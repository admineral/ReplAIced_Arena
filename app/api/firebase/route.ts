import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (!getApps().length) {
  console.log('Initializing Firebase app');
  initializeApp(firebaseConfig);
} else {
  console.log('Firebase app already initialized');
}

const db = getFirestore();

export async function GET(req: NextRequest) {
  console.log('Received GET request to /api/firebase');
  const { searchParams } = new URL(req.url);
  const limitCount = parseInt(searchParams.get('limitCount') || '100');
  console.log(`Limit count: ${limitCount}`);

  try {
    console.log('Querying Firestore for top users');
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('level', 'desc'), orderBy('experience', 'desc'), limit(limitCount));
    const querySnapshot = await getDocs(q);
    const users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(`Retrieved ${users.length} users from Firestore`);
    
    // Log the first user (if available) for debugging
    if (users.length > 0) {
      console.log('First user in results:', JSON.stringify(users[0], null, 2));
    }

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching top users:', error);
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}