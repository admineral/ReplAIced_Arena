'use client'

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { db } from '@/firebase-config';
import { doc, getDoc } from "firebase/firestore";

interface UserStats {
  attacksLaunched: number;
  defensesSuccessful: number;
  rank: number;
}

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/Login');
    } else {
      fetchUserStats();
    }
  }, [user, router]);

  const fetchUserStats = async () => {
    if (!user) return;

    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        setUserStats({
          attacksLaunched: userData.attacksLaunched || 0,
          defensesSuccessful: userData.defensesSuccessful || 0,
          rank: userData.rank || 0,
        });
      } else {
        console.log("No user data found!");
        setUserStats({
          attacksLaunched: 0,
          defensesSuccessful: 0,
          rank: 0,
        });
      }
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  };

  if (!user || !userStats) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-blue-900 text-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:flex-shrink-0 p-6">
              {!imageError && user.photoURL ? (
                <Image
                  src={user.photoURL}
                  alt="Profile"
                  width={150}
                  height={150}
                  className="rounded-full"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-[150px] h-[150px] bg-blue-500 rounded-full flex items-center justify-center text-4xl font-bold">
                  {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
                </div>
              )}
            </div>
            <div className="p-8">
              <div className="uppercase tracking-wide text-sm text-blue-400 font-semibold">AI Security Expert</div>
              <h1 className="mt-2 text-3xl font-bold">{user.displayName || 'Anonymous User'}</h1>
              <p className="mt-2 text-gray-300">{user.email}</p>
            </div>
          </div>
          <div className="border-t border-gray-700">
            <dl className="divide-y divide-gray-700">
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-400">Attacks Launched</dt>
                <dd className="mt-1 text-sm text-white sm:col-span-2 sm:mt-0">{userStats.attacksLaunched}</dd>
              </div>
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-400">Defenses Successful</dt>
                <dd className="mt-1 text-sm text-white sm:col-span-2 sm:mt-0">{userStats.defensesSuccessful}</dd>
              </div>
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-400">Global Rank</dt>
                <dd className="mt-1 text-sm text-white sm:col-span-2 sm:mt-0">#{userStats.rank}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;