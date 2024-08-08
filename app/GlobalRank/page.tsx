'use client'

import React, { useState, useEffect } from 'react';
import { db } from '@/firebase-config';
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";

interface RankedUser {
  id: string;
  displayName: string;
  level: number;
  attacksLaunched: number;
  defensesSuccessful: number;
}

const GlobalRankPage: React.FC = () => {
  const [rankedUsers, setRankedUsers] = useState<RankedUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGlobalRankings();
  }, []);

  const fetchGlobalRankings = async () => {
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, orderBy("level", "desc"), orderBy("experience", "desc"), limit(100));
      const querySnapshot = await getDocs(q);
      
      const users: RankedUser[] = [];
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        users.push({
          id: doc.id,
          displayName: userData.displayName || 'Anonymous User',
          level: userData.level || 1,
          attacksLaunched: userData.attacksLaunched || 0,
          defensesSuccessful: userData.defensesSuccessful || 0,
        });
      });
      
      setRankedUsers(users);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching global rankings:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-blue-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8 text-center">Global Rankings</h1>
        <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-700">
                <th className="px-4 py-2 text-left">Rank</th>
                <th className="px-4 py-2 text-left">User</th>
                <th className="px-4 py-2 text-center">Level</th>
                <th className="px-4 py-2 text-center">Attacks</th>
                <th className="px-4 py-2 text-center">Defenses</th>
              </tr>
            </thead>
            <tbody>
              {rankedUsers.map((user, index) => (
                <tr key={user.id} className={index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'}>
                  <td className="px-4 py-2 font-bold">{index + 1}</td>
                  <td className="px-4 py-2">{user.displayName}</td>
                  <td className="px-4 py-2 text-center">{user.level}</td>
                  <td className="px-4 py-2 text-center">{user.attacksLaunched}</td>
                  <td className="px-4 py-2 text-center">{user.defensesSuccessful}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GlobalRankPage;
