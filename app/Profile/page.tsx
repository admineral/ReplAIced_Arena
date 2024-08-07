'use client'

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { db } from '@/firebase-config';
import { doc, getDoc, DocumentData } from "firebase/firestore";
import { User } from 'firebase/auth';

interface UserStats {
  attacksLaunched: number;
  defensesSuccessful: number;
  rank: number;
  level: number;
  experience: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const ProfilePage: React.FC = () => {
  const { user } = useAuth() as AuthContextType;
  const router = useRouter();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/Login');
    } else {
      fetchUserData();
    }
  }, [user, router]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data() as DocumentData;
        setUserStats({
          attacksLaunched: userData.attacksLaunched || 0,
          defensesSuccessful: userData.defensesSuccessful || 0,
          rank: userData.rank || 0,
          level: userData.level || 1,
          experience: userData.experience || 0,
        });
        setAchievements(userData.achievements || []);
      } else {
        console.log("No user data found!");
        setUserStats({
          attacksLaunched: 0,
          defensesSuccessful: 0,
          rank: 0,
          level: 1,
          experience: 0,
        });
        setAchievements([]);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  if (!user || !userStats) {
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
              <div className="uppercase tracking-wide text-sm text-blue-400 font-semibold">AI Security Expert</div>
              <h1 className="mt-2 text-3xl font-bold">{user.displayName || 'Anonymous User'}</h1>
              <p className="mt-2 text-gray-300">{user.email}</p>
              <div className="mt-4 flex items-center">
                <div className="text-yellow-400 text-2xl mr-2">⭐</div>
                <div className="font-semibold">Level {userStats.level}</div>
                <div className="ml-4 bg-gray-700 h-2 rounded-full flex-grow">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{width: `${(userStats.experience % 100)}%`}}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 p-6">
            <h2 className="text-2xl font-bold mb-4">Stats</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-blue-400">{userStats.attacksLaunched}</div>
                <div className="text-sm text-gray-300">Attacks Launched</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-400">{userStats.defensesSuccessful}</div>
                <div className="text-sm text-gray-300">Defenses Successful</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-yellow-400">#{userStats.rank}</div>
                <div className="text-sm text-gray-300">Global Rank</div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 p-6">
            <h2 className="text-2xl font-bold mb-4">Achievements</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {achievements.map((achievement) => (
                <div key={achievement.id} className={`bg-gray-700 rounded-lg p-4 text-center ${achievement.unlocked ? 'opacity-100' : 'opacity-50'}`}>
                  <div className="text-4xl mb-2">{achievement.icon}</div>
                  <div className="font-semibold">{achievement.name}</div>
                  <div className="text-sm text-gray-300">{achievement.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;