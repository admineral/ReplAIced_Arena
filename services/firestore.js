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
  getDoc
} from 'firebase/firestore';

const ATTACKS_COLLECTION = 'attacks';
const USERS_COLLECTION = 'users';

export const saveAttack = async (attackData) => {
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

export const getAttacks = async (date, pageSize = 100, lastDoc = null) => {
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
  const attacks = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  return {
    attacks,
    lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1]
  };
};

export const subscribeToAttacks = (date, callback) => {
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
    const attacks = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(attacks);
  });
};

export const initializeUserRank = async (userId, userData) => {
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

export const updateUserExperience = async (userId, experienceGained) => {
  console.log(`Updating experience for user: ${userId}`);
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
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

export const getTopUsers = async (limitCount = 100) => {
  console.log(`Fetching top ${limitCount} users from Firestore...`);
  try {
    const q = query(
      collection(db, USERS_COLLECTION),
      orderBy('experience', 'desc'),
      limit(limitCount)
    );
    console.log('Query created:', q);
    const querySnapshot = await getDocs(q);
    console.log(`Fetched ${querySnapshot.docs.length} users`);
    const users = querySnapshot.docs.map((doc, index) => {
      const userData = doc.data();
      console.log(`User ${index + 1}:`, { id: doc.id, ...userData });
      return {
        id: doc.id,
        displayName: userData.displayName || `User ${index + 1}`,
        photoURL: userData.photoURL || '/default-avatar.png',
        level: userData.level || 1,
        experience: userData.experience || 0,
        rank: index + 1
      };
    });
    console.log('Processed user data:', users);
    return users;
  } catch (error) {
    console.error("Error fetching top users:", error);
    throw error;
  }
};

export const getCurrentUserRank = async (userId) => {
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
      const userData = querySnapshot.docs[userIndex].data();
      console.log('User data found:', userData);
      const userRank = {
        ...userData,
        id: querySnapshot.docs[userIndex].id,
        displayName: userData.displayName || `User ${userIndex + 1}`,
        photoURL: userData.photoURL || '/default-avatar.png',
        level: userData.level || 1,
        experience: userData.experience || 0,
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