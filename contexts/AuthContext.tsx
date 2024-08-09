'use client';

/**
 * AuthContext.tsx
 * 
 * This file defines the authentication context for the application.
 * It provides user authentication state and methods to the entire app.
 * 
 * Key features:
 * - Manages user authentication state
 * - Ensures user document exists in Firestore
 * - Provides login status, logout functionality, and admin status
 * - Admin status is stored in and read from Firestore
 * - Manages a list of box IDs created by the user
 * - Removes box IDs from the user document when deleted
 * 
 * @module AuthContext
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase-config';
import { db } from '../firebase-config';
import { doc, setDoc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  myBoxIds: string[];
  logout: () => Promise<void>;
  addBoxId: (boxId: string) => Promise<void>;
  removeBoxId: (boxId: string) => Promise<void>;
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
  const [myBoxIds, setMyBoxIds] = useState<string[]>([]);

  useEffect(() => {
    console.log('Setting up auth state listener');
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log('User authenticated:', user.uid);
        await ensureUserDocument(user);
        await checkAdminStatus(user.uid);
        await fetchMyBoxIds(user.uid);
      } else {
        console.log('User not authenticated');
        setIsAdmin(false);
        setMyBoxIds([]);
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
        isAdmin: false,
        myBoxIds: []
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

  const fetchMyBoxIds = async (uid: string) => {
    console.log('Fetching box IDs for:', uid);
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      setMyBoxIds(userData.myBoxIds || []);
      console.log('Fetched box IDs:', userData.myBoxIds || []);
    } else {
      setMyBoxIds([]);
      console.log('User document not found, box IDs set to empty array');
    }
  };

  const addBoxId = async (boxId: string) => {
    if (user) {
      console.log('Adding box ID to user document:', boxId);
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        myBoxIds: arrayUnion(boxId)
      });
      setMyBoxIds(prevIds => [...prevIds, boxId]);
      console.log('Box ID added successfully');
    } else {
      console.error('No user logged in, cannot add box ID');
    }
  };

  const removeBoxId = async (boxId: string) => {
    if (user) {
      console.log('Removing box ID from user document:', boxId);
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        myBoxIds: myBoxIds.filter(id => id !== boxId)
      });
      setMyBoxIds(prevIds => prevIds.filter(id => id !== boxId));
      console.log('Box ID removed successfully');
    } else {
      console.error('No user logged in, cannot remove box ID');
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

  const value = {
    user,
    loading,
    isAdmin,
    myBoxIds,
    logout,
    addBoxId,
    removeBoxId
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}