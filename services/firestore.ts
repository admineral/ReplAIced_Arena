import { db } from '../firebase-config';
import { 
  collection, 
  addDoc, 
  setDoc,
  doc,
  query, 
  where, 
  orderBy, 
  getDocs, 
  limit,
  startAfter,
  onSnapshot,
  getDoc,
  writeBatch,
  deleteDoc,
  updateDoc,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore';

const ATTACKS_COLLECTION = 'attacks';
const USERS_COLLECTION = 'users';

interface UserRank {
  id: string;
  displayName: string;
  photoURL: string;
  level: number;
  experience: number;
  rank: number;
  streak: number;
  contributions: number;
  attacksLaunched: number;
  defensesSuccessful: number;
}

interface AttackData {
  timestamp: number;
  [key: string]: any;
}

interface Activity {
  type: 'attack' | 'defense' | 'contribution';
  timestamp: number;
  details: string;
}

interface OrbitConfig {
  name: string;
  systemPrompt: string;
  secretWord: string;
  difficulty: string;
  type: string;
  temperature: number;
}

interface User {
  id: string;
  displayName: string;
  email: string;
  isAdmin: boolean;
}

interface Box {
  id: string;
  type: string;
  x: number;
  y: number;
  difficulty: 'easy' | 'medium' | 'hard';
  systemPrompt: string;
  secretWord: string;
}

export const saveAttack = async (attackData: AttackData): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, ATTACKS_COLLECTION), {
      ...attackData,
      timestamp: Date.now()
    });
    console.log("Attack saved with ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error saving attack: ", error);
    throw error;
  }
};

export const getAttacks = async (date: Date, pageSize: number = 100, lastDoc: QueryDocumentSnapshot | null = null): Promise<{attacks: AttackData[], lastDoc: QueryDocumentSnapshot}> => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  let q = query(
    collection(db, ATTACKS_COLLECTION),
    where('timestamp', '>=', startOfDay.getTime()),
    where('timestamp', '<=', endOfDay.getTime()),
    orderBy('timestamp'),
    limit(pageSize)
  );

  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }

  const querySnapshot = await getDocs(q);
  const attacks = querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      timestamp: data.timestamp,
      ...data
    } as AttackData;
  });

  return {
    attacks,
    lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1]
  };
};

export const subscribeToAttacks = (date: Date, callback: (attacks: AttackData[]) => void): () => void => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const q = query(
    collection(db, ATTACKS_COLLECTION),
    where('timestamp', '>=', startOfDay.getTime()),
    where('timestamp', '<=', endOfDay.getTime()),
    orderBy('timestamp')
  );

  return onSnapshot(q, (querySnapshot) => {
    const attacks = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        timestamp: data.timestamp,
        ...data
      } as AttackData;
    });
    callback(attacks);
  });
};

export const initializeUserRank = async (userId: string, userData: Partial<UserRank>): Promise<void> => {
  console.log(`Initializing rank data for user: ${userId}`);
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await setDoc(userRef, {
      ...userData,
      experience: 0,
      level: 1,
      lastUpdated: Date.now()
    }, { merge: true });
    console.log(`Rank data initialized for user: ${userId}`);
  } catch (error) {
    console.error("Error initializing user rank:", error);
    throw error;
  }
};

export const updateUserExperience = async (userId: string, experienceGained: number): Promise<void> => {
  console.log(`Updating experience for user: ${userId}`);
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const userData = userDoc.data() as UserRank;
      const newExperience = (userData.experience || 0) + experienceGained;
      const newLevel = Math.floor(Math.sqrt(newExperience / 100)) + 1;
      await setDoc(userRef, {
        experience: newExperience,
        level: newLevel,
        lastUpdated: Date.now()
      }, { merge: true });
      console.log(`Experience updated for user: ${userId}. New experience: ${newExperience}, New level: ${newLevel}`);
    } else {
      console.log(`User ${userId} not found. Initializing with new experience.`);
      await initializeUserRank(userId, { experience: experienceGained });
    }
  } catch (error) {
    console.error("Error updating user experience:", error);
    throw error;
  }
};

export const getTopUsers = async (limitCount: number = 100): Promise<UserRank[]> => {
  console.log(`Fetching top ${limitCount} users from Firestore...`);
  try {
    const response = await fetch(`/api/firebase?limitCount=${limitCount}`);
    if (!response.ok) {
      throw new Error(`Error fetching top users: ${response.statusText}`);
    }
    const users = await response.json();
    console.log('Processed user data:', users);
    return users;
  } catch (error) {
    console.error("Error fetching top users:", error);
    throw error;
  }
};

export const getCurrentUserRank = async (userId: string): Promise<UserRank | null> => {
  console.log(`Fetching rank for user with ID: ${userId}`);
  try {
    const q = query(
      collection(db, USERS_COLLECTION),
      orderBy('experience', 'desc')
    );
    console.log('Query created:', q);
    const querySnapshot = await getDocs(q);
    console.log(`Fetched ${querySnapshot.docs.length} users for ranking`);
    const userIndex = querySnapshot.docs.findIndex(doc => doc.id === userId);
    console.log(`User index in ranking: ${userIndex}`);
    if (userIndex !== -1) {
      const userData = querySnapshot.docs[userIndex].data() as UserRank;
      console.log('User data found:', userData);
      const userRank: UserRank = {
        id: querySnapshot.docs[userIndex].id,
        displayName: userData.displayName || `User ${userIndex + 1}`,
        photoURL: userData.photoURL || '/default-avatar.png',
        level: userData.level || 1,
        experience: userData.experience || 0,
        streak: userData.streak || 0,
        contributions: userData.contributions || 0,
        attacksLaunched: userData.attacksLaunched || 0,
        defensesSuccessful: userData.defensesSuccessful || 0,
        rank: userIndex + 1
      };
      console.log('Processed user rank:', userRank);
      return userRank;
    }
    console.log('User not found in ranking');
    return null;
  } catch (error) {
    console.error("Error fetching current user rank:", error);
    throw error;
  }
};

export const deleteAllUsers = async (): Promise<void> => {
  console.log("Deleting all users...");
  try {
    const usersSnapshot = await getDocs(collection(db, USERS_COLLECTION));
    const batch = writeBatch(db);

    usersSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log("All users deleted successfully");
  } catch (error) {
    console.error("Error deleting users:", error);
    throw error;
  }
};

export const getUserActivity = async (userId: string, timeRange: string): Promise<Activity[]> => {
  console.log(`Fetching activity for user ${userId} in time range ${timeRange}`);
  
  // Return dummy data with correct types
  return [
    { type: 'attack', timestamp: Date.now() - 1000000, details: 'Launched an attack' },
    { type: 'defense', timestamp: Date.now() - 2000000, details: 'Successfully defended' },
    { type: 'contribution', timestamp: Date.now() - 3000000, details: 'Made a contribution' },
  ];
};

export const getBoxConfig = async (boxId: string): Promise<OrbitConfig | null> => {
  console.log(`Fetching box configuration for box ID: ${boxId}`);
  try {
    const boxRef = doc(db, 'boxes', boxId);
    const boxDoc = await getDoc(boxRef);
    if (boxDoc.exists()) {
      const boxData = boxDoc.data();
      console.log('Box configuration:', boxData);
      return {
        name: boxData.name || 'Unknown Orbit',
        systemPrompt: boxData.systemPrompt || '',
        secretWord: boxData.secretWord || '',
        difficulty: boxData.difficulty || 'medium',
        type: boxData.type || 'default',
        temperature: boxData.temperature || 0.7
      };
    } else {
      console.log(`No box found with ID: ${boxId}`);
      return null;
    }
  } catch (error) {
    console.error("Error fetching box configuration:", error);
    throw error;
  }
};

export const updateBoxConfig = async (boxId: string, updatedConfig: Partial<OrbitConfig>): Promise<void> => {
  console.log(`Updating box configuration for box ID: ${boxId}`);
  try {
    const boxRef = doc(db, 'boxes', boxId);
    await updateDoc(boxRef, updatedConfig);
    console.log('Box configuration updated successfully');
  } catch (error) {
    console.error("Error updating box configuration:", error);
    throw error;
  }
};

export const fetchBoxConfiguration = async (userId: string, boxId: string): Promise<DocumentData | null> => {
  console.log(`Fetching box configuration for box ID: ${boxId}`);
  const boxRef = doc(db, 'users', userId, 'boxes', boxId);
  const boxSnap = await getDoc(boxRef);

  if (boxSnap.exists()) {
    console.log(`Box found with ID: ${boxId}`);
    return boxSnap.data();
  } else {
    console.warn(`No box found with ID: ${boxId}`);
    return null;
  }
};

export const getAllUsers = async (): Promise<User[]> => {
  const usersRef = collection(db, USERS_COLLECTION);
  const snapshot = await getDocs(usersRef);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    displayName: doc.data().displayName,
    email: doc.data().email,
    isAdmin: doc.data().isAdmin || false
  }));
};

export const writeBoxesToFirestore = async (boxes: Box[]): Promise<void> => {
  console.log('Writing boxes to Firestore:', boxes);
  const batch = writeBatch(db);
  const boxesRef = collection(db, 'boxes');

  // Delete all existing boxes
  const existingBoxes = await getDocs(boxesRef);
  existingBoxes.forEach((doc) => {
    batch.delete(doc.ref);
  });

  // Add new boxes
  boxes.forEach((box) => {
    const newBoxRef = doc(boxesRef);
    batch.set(newBoxRef, box);
  });

  await batch.commit();
  console.log('Boxes written to Firestore successfully');
};