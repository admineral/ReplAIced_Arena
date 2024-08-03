import { db } from '../firebase-config';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  limit, 
  startAfter,
  onSnapshot
} from 'firebase/firestore';

const ATTACKS_COLLECTION = 'attacks';

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