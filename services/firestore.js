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
  deleteDoc
} from 'firebase/firestore';

const ATTACKS_COLLECTION = 'attacks';
const USERS_COLLECTION = 'users';

/**
 * @typedef {Object} UserRank
 * @property {string} id
 * @property {string} displayName
 * @property {string} photoURL
 * @property {number} level
 * @property {number} experience
 * @property {number} rank
 * @property {number} streak
 * @property {number} contributions
 * @property {number} attacksLaunched
 * @property {number} defensesSuccessful
 */

/**
 * @typedef {Object} AttackData
 * @property {number} timestamp
 */

/**
 * @typedef {Object} Activity
 * @property {('attack'|'defense'|'contribution')} type
 * @property {number} timestamp
 * @property {string} details
 */

/**
 * @param {AttackData} attackData
 * @returns {Promise<string>}
 */
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

/**
 * @param {Date} date
 * @param {number} pageSize
 * @param {import('firebase/firestore').QueryDocumentSnapshot|null} lastDoc
 * @returns {Promise<{attacks: AttackData[], lastDoc: import('firebase/firestore').QueryDocumentSnapshot}>}
 */
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

/**
 * @param {Date} date
 * @param {function(AttackData[]): void} callback
 * @returns {function(): void}
 */
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

/**
 * @param {string} userId
 * @param {Partial<UserRank>} userData
 * @returns {Promise<void>}
 */
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

/**
 * @param {string} userId
 * @param {number} experienceGained
 * @returns {Promise<void>}
 */
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

   /**
    * @param {number} limitCount
    * @returns {Promise<UserRank[]>}
    */
   export const getTopUsers = async (limitCount = 100) => {
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

/**
 * @param {string} userId
 * @returns {Promise<UserRank | null>}
 */
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

/**
 * @param {number} index
 * @returns {UserRank}
 */
const generateFakeUser = (index) => ({
  displayName: `User ${index}`,
  photoURL: '/default-avatar.png',
  level: Math.floor(Math.random() * 10) + 1,
  experience: Math.floor(Math.random() * 1000),
  streak: Math.floor(Math.random() * 30),
  contributions: Math.floor(Math.random() * 100),
  attacksLaunched: Math.floor(Math.random() * 50),
  defensesSuccessful: Math.floor(Math.random() * 30),
  rank: index
});

/**
 * @returns {Promise<void>}
 */
export const deleteAllUsers = async () => {
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

/**
 * @param {number} userCount
 * @returns {Promise<void>}
 */
export const populateDatabase = async (userCount = 100) => {
  console.log(`Populating database with ${userCount} fake users...`);
  const batch = writeBatch(db);

  for (let i = 0; i < userCount; i++) {
    const userData = generateFakeUser(i + 1);
    const userRef = doc(collection(db, USERS_COLLECTION));
    batch.set(userRef, userData);
  }

  await batch.commit();
  console.log(`Database populated with ${userCount} fake users.`);
};

/**
 * @param {number} userCount
 * @param {number} experienceIncrease
 * @returns {Promise<Array<{id: string, displayName: string, newExperience: number, newLevel: number}>>}
 */
export const increaseRandomUsersExperience = async (userCount = 10, experienceIncrease = 100) => {
  console.log(`Increasing experience for ${userCount} random users...`);
  const usersSnapshot = await getDocs(collection(db, USERS_COLLECTION));
  const users = usersSnapshot.docs;

  const batch = writeBatch(db);
  const updatedUsers = [];

  for (let i = 0; i < userCount; i++) {
    const randomIndex = Math.floor(Math.random() * users.length);
    const userDoc = users[randomIndex];
    const userData = userDoc.data();

    const newExperience = (userData.experience || 0) + experienceIncrease;
    const newLevel = Math.floor(Math.sqrt(newExperience / 100)) + 1;

    batch.update(userDoc.ref, {
      experience: newExperience,
      level: newLevel,
      lastUpdated: Date.now()
    });

    updatedUsers.push({
      id: userDoc.id,
      displayName: userData.displayName,
      newExperience,
      newLevel
    });
  }

  await batch.commit();
  console.log(`Experience increased for ${userCount} random users:`, updatedUsers);
  return updatedUsers;
};

/**
 * @param {string} userId
 * @param {string} timeRange
 * @returns {Promise<Activity[]>}
 */
export const getUserActivity = async (userId, timeRange) => {
  console.log(`Fetching activity for user ${userId} in time range ${timeRange}`);
  
  // Return dummy data with correct types
  return [
    { type: 'attack', timestamp: Date.now() - 1000000, details: 'Launched an attack' },
    { type: 'defense', timestamp: Date.now() - 2000000, details: 'Successfully defended' },
    { type: 'contribution', timestamp: Date.now() - 3000000, details: 'Made a contribution' },
  ];
};