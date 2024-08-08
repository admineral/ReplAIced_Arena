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
  experience: number;
}

const GlobalRankPage: React.FC = () => {
  const [rankedUsers, setRankedUsers] = useState<RankedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGlobalRankings();
  }, []);

  const fetchGlobalRankings = async () => {
    try {
      console.log("Fetching global rankings...");
      const usersRef = collection(db, "users");
      const q = query(usersRef, orderBy("level", "desc"), orderBy("experience", "desc"), limit(100));
      
      console.log("Executing query...");
      const querySnapshot = await getDocs(q);
      console.log(`Fetched ${querySnapshot.size} documents`);
      
      const users: RankedUser[] = [];
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        users.push({
          id: doc.id,
          displayName: userData.displayName || 'Anonymous User',
          level: userData.level || 1,
          attacksLaunched: userData.attacksLaunched || 0,
          defensesSuccessful: userData.defensesSuccessful || 0,
          experience: userData.experience || 0,
        });
      });
      
      console.log(`Processed ${users.length} users`);
      setRankedUsers(users);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching global rankings:", error);
      if (error instanceof Error) {
        if (error.message.includes("The query requires an index")) {
          setError("Rankings are being prepared. Please try again in a few minutes.");
        } else {
          setError("Failed to fetch rankings. Please try again later.");
        }
      } else {
        setError("An unexpected error occurred. Please try again later.");
      }
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-blue-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8 text-center">Global Rankings</h1>
        {rankedUsers.length > 0 ? (
          <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-700">
                  <th className="px-4 py-2 text-left">Rank</th>
                  <th className="px-4 py-2 text-left">User</th>
                  <th className="px-4 py-2 text-center">Level</th>
                  <th className="px-4 py-2 text-center">Experience</th>
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
                    <td className="px-4 py-2 text-center">{user.experience}</td>
                    <td className="px-4 py-2 text-center">{user.attacksLaunched}</td>
                    <td className="px-4 py-2 text-center">{user.defensesSuccessful}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-xl">No ranked users found.</div>
        )}
      </div>
    </div>
  );
};

export default GlobalRankPage;