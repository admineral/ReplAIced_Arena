'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, onAuthStateChanged, signOut, signInWithPopup, GithubAuthProvider } from 'firebase/auth';
import { auth, db } from '../firebase-config';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

interface BoxId {
  firestoreId: string;
  customId: string;
  x: number;
  y: number;
}

interface Article {
  id: string;
  title: string;
  content: string;
  published: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getUserBoxes: (userId: string) => Promise<BoxId[]>;
  getUserArticles: (userId: string) => Promise<Article[]>;
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
    const boxesQuery = query(collection(db, 'boxCoordinates'), where('ownerId', '==', userId));
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

  const getUserArticles = async (userId: string): Promise<Article[]> => {
    console.log(`Attempting to get articles for user: ${userId}`);
    const articlesRef = collection(db, 'articles');
    const articlesQuery = query(articlesRef, where('userId', '==', userId), where('published', '==', true));
    const articlesSnapshot = await getDocs(articlesQuery);
    console.log(`Query snapshot received. Number of documents: ${articlesSnapshot.size}`);
    const articles = articlesSnapshot.docs.map(doc => {
      const data = doc.data();
      console.log('Article data:', data);
      return {
        id: doc.id,
        title: data.title,
        content: data.content,
        published: data.published || false,
      };
    });
    console.log(`Returning ${articles.length} articles for user ${userId}`);
    return articles;
  };

  const login = async () => {
    try {
      console.log('Attempting to log in user');
      const provider = new GithubAuthProvider();
      const result = await signInWithPopup(auth, provider);
      console.log('User logged in successfully:', result.user.uid);
      // The onAuthStateChanged listener will handle updating the user state and checking admin status
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    isAdmin,
    login,
    logout,
    getUserBoxes,
    getUserArticles
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
