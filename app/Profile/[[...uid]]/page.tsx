'use client'

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
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

export default function UserProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const userIdFromUrl = Array.isArray(params.uid) ? params.uid[0] : params.uid;

  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [imageError, setImageError] = useState(false);
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async (uid: string) => {
      setLoading(true);
      setError(null);
      try {
        console.log("Fetching data for user:", uid);
        const userDocRef = doc(db, "users", uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data() as DocumentData;
          console.log("User data:", userData);
          setUserStats({
            attacksLaunched: userData.attacksLaunched || 0,
            defensesSuccessful: userData.defensesSuccessful || 0,
            rank: userData.rank || 0,
            level: userData.level || 1,
            experience: userData.experience || 0,
          });
          setAchievements(userData.achievements || []);
          setProfileUser({
            uid,
            displayName: userData.displayName,
            email: userData.email,
            photoURL: userData.photoURL,
          } as User);
        } else {
          console.log("No user data found for:", uid);
          setError("User not found");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to fetch user data");
      } finally {
        setLoading(false);
      }
    };

    console.log("userIdFromUrl:", userIdFromUrl);
    console.log("logged in user:", user?.uid);

    if (userIdFromUrl) {
      fetchUserData(userIdFromUrl);
    } else if (user) {
      fetchUserData(user.uid);
    } else {
      console.log("No user ID available, redirecting to login");
      router.push('/Login');
    }
  }, [userIdFromUrl, user, router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  }

  if (!userStats || !profileUser) {
    return <div className="min-h-screen flex items-center justify-center">No user data available</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-blue-900 text-white pt-24 sm:pt-32">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 mr-4">
                {!imageError && profileUser.photoURL ? (
                  <Image
                    src={profileUser.photoURL}
                    alt="Profile"
                    width={80}
                    height={80}
                    className="rounded-full border-4 border-blue-500"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-2xl font-bold border-4 border-blue-300">
                    {profileUser.displayName ? profileUser.displayName[0].toUpperCase() : 'U'}
                  </div>
                )}
              </div>
              <div className="flex-grow">
                <div className="uppercase tracking-wide text-sm text-blue-400 font-semibold">AI Security Expert</div>
                <h1 className="text-2xl font-bold">{profileUser.displayName || 'Anonymous User'}</h1>
                <p className="text-sm text-gray-300">{profileUser.email}</p>
                <div className="mt-2 flex items-center">
                  <div className="text-yellow-400 text-xl mr-2">⭐</div>
                  <div className="font-semibold text-sm">Level {userStats.level}</div>
                  <div className="ml-2 bg-gray-700 h-2 rounded-full w-24">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{width: `${(userStats.experience % 100)}%`}}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 p-6">
            <h2 className="text-xl font-bold mb-4">Stats</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">{userStats.attacksLaunched}</div>
                <div className="text-xs text-gray-300">Attacks Launched</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{userStats.defensesSuccessful}</div>
                <div className="text-xs text-gray-300">Defenses Successful</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4 text-center col-span-2">
                <div className="text-2xl font-bold text-yellow-400">#{userStats.rank}</div>
                <div className="text-xs text-gray-300">Global Rank</div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 p-6">
            <h2 className="text-xl font-bold mb-4">Achievements</h2>
            <div className="grid grid-cols-2 gap-4">
              {achievements.map((achievement) => (
                <div key={achievement.id} className={`bg-gray-700 rounded-lg p-4 text-center ${achievement.unlocked ? 'opacity-100' : 'opacity-50'}`}>
                  <div className="text-3xl mb-2">{achievement.icon}</div>
                  <div className="font-semibold text-sm">{achievement.name}</div>
                  <div className="text-xs text-gray-300">{achievement.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}