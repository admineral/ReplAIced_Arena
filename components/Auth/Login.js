'use client';

import React from 'react';
import { signInWithPopup, GithubAuthProvider, signOut } from 'firebase/auth';
import { auth } from '../../firebase-config';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';

const Login = () => {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleGitHubSignIn = async () => {
    const provider = new GithubAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      const redirectPath = localStorage.getItem('loginRedirect') || '/';
      localStorage.removeItem('loginRedirect');
      router.push(redirectPath);
    } catch (error) {
      console.error('GitHub sign in error:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout(); // Use the logout function from AuthContext
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <button
      onClick={user ? handleSignOut : handleGitHubSignIn}
      className="bg-gray-700 text-white rounded-full px-4 py-2 shadow-lg hover:bg-gray-600 transition-colors duration-300"
    >
      {user ? 'Logout' : 'Login'}
    </button>
  );
};

export default Login;