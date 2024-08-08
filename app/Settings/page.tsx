'use client'

import { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { GithubAuthProvider, signInWithPopup, reauthenticateWithPopup, deleteUser, updateProfile } from "firebase/auth";
import { deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '@/firebase-config';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [newProfilePicture, setNewProfilePicture] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateProfilePicture = async (file: File) => {
    if (!user) return;
    
    const storage = getStorage();
    const storageRef = ref(storage, `profile_pictures/${user.uid}`);
    
    try {
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      await updateProfile(user, { photoURL: downloadURL });
    } catch (error) {
      console.error("Error updating profile picture:", error);
      throw error;
    }
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewProfilePicture(file);
    }
  };

  const handleSaveProfilePicture = async () => {
    if (newProfilePicture && user) {
      try {
        await updateProfilePicture(newProfilePicture);
        setImageError(false);
        setNewProfilePicture(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        alert("Profile picture updated successfully!");
      } catch (error) {
        console.error("Error updating profile picture:", error);
        alert("Failed to update profile picture. Please try again.");
      }
    }
  };

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
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-blue-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:flex-shrink-0 p-6">
              {!imageError && user.photoURL ? (
                <Image
                  src={user.photoURL}
                  alt="Profile"
                  width={150}
                  height={150}
                  className="rounded-full border-4 border-blue-500"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-[150px] h-[150px] bg-blue-500 rounded-full flex items-center justify-center text-4xl font-bold border-4 border-blue-300">
                  {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
                </div>
              )}
            </div>
            <div className="p-8 flex-grow">
              <div className="uppercase tracking-wide text-sm text-blue-400 font-semibold">Account Settings</div>
              <h1 className="mt-2 text-3xl font-bold">{user.displayName || 'Anonymous User'}</h1>
              <p className="mt-2 text-gray-300">{user.email}</p>
              <div className="mt-4 flex items-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  className="hidden"
                  ref={fileInputRef}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mr-2"
                >
                  Choose File
                </button>
                <button
                  onClick={handleSaveProfilePicture}
                  disabled={!newProfilePicture}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                >
                  Save Profile Picture
                </button>
              </div>
              {newProfilePicture && (
                <p className="mt-2 text-sm text-gray-300">New picture selected. Click "Save" to update.</p>
              )}
            </div>
          </div>
          <div className="border-t border-gray-700 p-6">
            <h2 className="text-2xl font-bold mb-4">Delete Account</h2>
            <p className="mb-4 text-red-400">Warning: This action cannot be undone.</p>
            <button
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
            >
              {isDeleting ? 'Deleting...' : 'Delete Account'}
            </button>
            {deleteError && <p className="mt-2 text-red-400">{deleteError}</p>}
          </div>
          <div className="border-t border-gray-700 p-6 filter blur-sm">
            <h2 className="text-2xl font-bold mb-4">Other Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <h3 className="text-lg font-semibold">Email Notifications</h3>
                <p className="text-sm text-gray-300">Configure your email preferences</p>
              </div>
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <h3 className="text-lg font-semibold">Privacy</h3>
                <p className="text-sm text-gray-300">Manage your privacy settings</p>
              </div>
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <h3 className="text-lg font-semibold">Security</h3>
                <p className="text-sm text-gray-300">Update password and security options</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;