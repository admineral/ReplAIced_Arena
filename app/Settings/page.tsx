'use client'

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { GithubAuthProvider, reauthenticateWithPopup, deleteUser } from "firebase/auth";
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/firebase-config';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteAccount = async () => {
    if (!user) return;

    const confirmDelete = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");
    if (!confirmDelete) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      // Re-authenticate with GitHub
      const provider = new GithubAuthProvider();
      await reauthenticateWithPopup(user, provider);

      // Now proceed with account deletion
      await deleteDoc(doc(db, "users", user.uid));
      await deleteUser(user);
      router.push('/');
    } catch (error) {
      console.error("Error deleting account:", error);
      if (error instanceof Error) {
        setDeleteError(`Failed to delete account: ${error.message}`);
      } else {
        setDeleteError("Failed to delete account. Please try again.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-blue-900 text-white pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-16">
        <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start">
              <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-6">
                {!imageError && user.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt="Profile"
                    width={100}
                    height={100}
                    className="rounded-full border-4 border-blue-500"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-[100px] h-[100px] bg-blue-500 rounded-full flex items-center justify-center text-3xl font-bold border-4 border-blue-300">
                    {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
                  </div>
                )}
              </div>
              <div className="text-center sm:text-left">
                <div className="uppercase tracking-wide text-sm text-blue-400 font-semibold">Account Settings</div>
                <h1 className="mt-2 text-2xl sm:text-3xl font-bold">{user.displayName || 'Anonymous User'}</h1>
                <p className="mt-2 text-sm sm:text-base text-gray-300">{user.email}</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 p-6">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Delete Account</h2>
            <p className="mb-4 text-red-400 text-sm sm:text-base">Warning: This action cannot be undone.</p>
            <button
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded text-sm sm:text-base"
            >
              {isDeleting ? 'Deleting...' : 'Delete Account'}
            </button>
            {deleteError && <p className="mt-2 text-red-400 text-sm sm:text-base">{deleteError}</p>}
          </div>
          <div className="border-t border-gray-700 p-6 filter blur-sm">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Other Settings</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <h3 className="text-base sm:text-lg font-semibold">Email Notifications</h3>
                <p className="text-xs sm:text-sm text-gray-300">Configure your email preferences</p>
              </div>
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <h3 className="text-base sm:text-lg font-semibold">Privacy</h3>
                <p className="text-xs sm:text-sm text-gray-300">Manage your privacy settings</p>
              </div>
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <h3 className="text-base sm:text-lg font-semibold">Security</h3>
                <p className="text-xs sm:text-sm text-gray-300">Update password and security options</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;