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
  getUserArticles: (userId: string) => Promise<{ id: string; title: string; content: string; published: boolean }[]>; // Veröffentlichungsstatus hinzufügen
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Add this line if UserContext is not exported
export const UserContext = createContext<User | null>(null); // Example context creation

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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await ensureUserDocument(user);
        await checkAdminStatus(user.uid);
      } else {
        setIsAdmin(false);
      }
      setUser(user);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const ensureUserDocument = async (user: User) => {
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
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
    } else {
      await setDoc(userDocRef, {
        displayName: user.displayName || userDoc.data().displayName,
        email: user.email || userDoc.data().email,
        photoURL: user.photoURL || userDoc.data().photoURL
      }, { merge: true });
    }
  };

  const checkAdminStatus = async (uid: string) => {
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      setIsAdmin(userData.isAdmin || false);
    } else {
      setIsAdmin(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const getUserBoxes = async (userId: string): Promise<BoxId[]> => {
    const boxesQuery = query(collection(db, 'boxOwners'), where('ownerId', '==', userId));
    const querySnapshot = await getDocs(boxesQuery);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        firestoreId: doc.id,
        customId: data.customId,
        x: data.x,
        y: data.y
      };
    });
  };

  const getUserArticles = async (userId: string): Promise<{ id: string; title: string; content: string; published: boolean }[]> => {
    const articlesRef = collection(db, 'articles');
    const articlesSnapshot = await getDocs(articlesRef);
    return articlesSnapshot.docs
      .filter(doc => doc.data().userId === userId && doc.data().published) // Filter for published articles
      .map(doc => ({
        id: doc.id,
        title: doc.data().title,
        content: doc.data().content,
        published: doc.data().published || false,
      }));
  };


  const value = {
    user,
    loading,
    isAdmin,
    logout,
    getUserBoxes,
    getUserArticles,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}