'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '../firebase-config';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

interface BoxId {
  firestoreId: string;
  customId: string;
  x: number;
  y: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  logout: () => Promise<void>;
  getUserBoxes: (userId: string) => Promise<BoxId[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    console.log('Setting up auth state listener');
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log('User authenticated:', user.uid);
        await ensureUserDocument(user);
        await checkAdminStatus(user.uid);
      } else {
        console.log('User not authenticated');
        setIsAdmin(false);
      }
      setUser(user);
      setLoading(false);
    });

    return () => {
      console.log('Cleaning up auth state listener');
      unsubscribe();
    };
  }, []);

  const ensureUserDocument = async (user: User) => {
    console.log('Ensuring user document exists for:', user.uid);
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      console.log('Creating new user document');
      await setDoc(userDocRef, {
        uid: user.uid,
        displayName: user.displayName || 'Anonymous User',
        email: user.email,
        photoURL: user.photoURL || '/default-avatar.png',
        attacksLaunched: 0,
        defensesSuccessful: 0,
        rank: 0,
        level: 1,
        experience: 0,
        achievements: [],
        isAdmin: false
      });
      console.log('New user document created');
    } else {
      console.log('Updating existing user document');
      await setDoc(userDocRef, {
        displayName: user.displayName || userDoc.data().displayName,
        email: user.email || userDoc.data().email,
        photoURL: user.photoURL || userDoc.data().photoURL
      }, { merge: true });
      console.log('User document updated');
    }
  };

  const checkAdminStatus = async (uid: string) => {
    console.log('Checking admin status for:', uid);
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      setIsAdmin(userData.isAdmin || false);
      console.log('Admin status:', userData.isAdmin || false);
    } else {
      setIsAdmin(false);
      console.log('User document not found, admin status set to false');
    }
  };

  const logout = async () => {
    try {
      console.log('Attempting to log out user');
      await signOut(auth);
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getUserBoxes = async (userId: string): Promise<BoxId[]> => {
    console.log(`Attempting to get boxes for user: ${userId}`);
    const boxesQuery = query(collection(db, 'boxOwners'), where('ownerId', '==', userId));
    console.log('Query created:', boxesQuery);
    const querySnapshot = await getDocs(boxesQuery);
    console.log(`Query snapshot received. Number of documents: ${querySnapshot.size}`);
    const boxes = querySnapshot.docs.map(doc => {
      const data = doc.data();
      console.log('Box data:', data);
      return {
        firestoreId: doc.id,
        customId: data.customId,
        x: data.x,
        y: data.y
      };
    });
    console.log(`Returning ${boxes.length} boxes for user ${userId}`);
    return boxes;
  };

  const value = {
    user,
    loading,
    isAdmin,
    logout,
    getUserBoxes
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}