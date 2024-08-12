'use client';

import React, { useState, useEffect } from 'react';
import { getAuth, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink, GithubAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../firebase-config';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const actionCodeSettings = {
    url: 'http://localhost:3000/Login', // Ersetze dies durch deine URL
    handleCodeInApp: true,
  };
  
  const handleGitHubSignIn = async () => {
    const provider = new GithubAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      const redirectPath = localStorage.getItem('loginRedirect') || '/';
      localStorage.removeItem('loginRedirect'); // Clean up
      router.push(redirectPath);
    } catch (error) {
      console.error('GitHub sign in error:', error);
    }
  };


  const handleEmailSignIn = async () => {
    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      alert('Ein Anmeldelink wurde an deine E-Mail-Adresse gesendet.');
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Ein unbekannter Fehler ist aufgetreten.');
      }
    }
  };

  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let email = window.localStorage.getItem('emailForSignIn');
      if (!email) {
        email = window.prompt('Bitte gib deine E-Mail-Adresse zur Bestätigung ein');
      }
      signInWithEmailLink(auth, email, window.location.href)
        .then((result) => {
          window.localStorage.removeItem('emailForSignIn');
          router.push('/Profile'); // Weiterleitung nach erfolgreicher Anmeldung
        })
        .catch((error) => {
          setError(error.message);
        });
    }
  }, [auth, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Melden Sie sich bei ReplAIced an
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div>
            <input
              type="email"
              placeholder="E-Mail-Adresse"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-gray-600 p-2 w-full mb-4 bg-gray-700 text-white"
            />
            <button
              onClick={handleEmailSignIn}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
            >
              Mit E-Mail anmelden
            </button>
            <button
              onClick={handleGitHubSignIn}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-150 ease-in-out"
            >
              Mit GitHub anmelden
            </button>
            {error && <p className="mt-2 text-red-500">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;