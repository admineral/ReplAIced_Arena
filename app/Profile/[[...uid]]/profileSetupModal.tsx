'use client';

import React, { useState } from 'react';
import { auth, db } from '@/firebase-config';
import { doc, setDoc } from 'firebase/firestore';

const ProfileSetupModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [username, setUsername] = useState('');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [password, setPassword] = useState(''); // New state for password

  const handleSubmit = async () => {
    if (!auth.currentUser) return;

    // Add password handling logic here
    if (!password) {
        alert("Password is required.");
        return;
    }

    // Logic to set password (you may need to implement this based on your auth strategy)
    // Example: await setPasswordForUser(auth.currentUser, password);

    const userDocRef = doc(db, 'users', auth.currentUser.uid);
    const userData = {
      displayName: username,
      photoURL: profilePicture ? URL.createObjectURL(profilePicture) : '/default-avatar.png',
    };

    await setDoc(userDocRef, userData, { merge: true });
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-gray-800 p-6 rounded shadow-lg w-96">
        <h2 className="text-lg font-bold mb-4 text-white">Set Up Profile</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border border-gray-600 p-2 w-full mb-4 bg-gray-700 text-white"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-gray-600 p-2 w-full mb-4 bg-gray-700 text-white"
        />
        <input
          type="file"
          onChange={(e) => setProfilePicture(e.target.files?.[0] || null)}
          className="mb-4"
        />
        <div className="flex justify-between">
          <button onClick={handleSubmit} className="bg-green-500 text-white px-4 py-2 rounded">Save</button>
          <button onClick={() => { auth.signOut(); onClose(); }} className="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetupModal;