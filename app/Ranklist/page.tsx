'use client'

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Image from 'next/image';
import { getTopUsers, getCurrentUserRank, getUserActivity } from '../../services/firestore';

interface UserRank {
  id: string;
  displayName: string;
  photoURL: string;
  level: number;
  experience: number;
  rank: number;
  streak: number;
  contributions: number;
}

interface Activity {
  type: 'attack' | 'defense' | 'contribution';
  timestamp: number;
  details: string;
}

const RanklistPage: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserRank[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<UserRank | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserRank | null>(null);
  const [userActivity, setUserActivity] = useState<Activity[]>([]);
  const [timeRange, setTimeRange] = useState('week');

  useEffect(() => {
    fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const topUsers = await getTopUsers(100);
      setUsers(topUsers);
      
      if (user) {
        const userRank = await getCurrentUserRank(user.uid);
        if (userRank) {
          setCurrentUserRank(userRank);
        }
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to fetch users. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserSelect = async (selectedUser: UserRank) => {
    setSelectedUser(selectedUser);
    try {
      const activity = await getUserActivity(selectedUser.id, timeRange);
      setUserActivity(activity);
    } catch (error) {
      console.error("Error fetching user activity:", error);
    }
  };

  const filteredUsers = users.filter(user => 
    user.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">AI Security Expert Ranklist</h1>
        
        {error && (
          <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 p-4 rounded-md mb-8">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-4 mb-6">
              <div className="flex items-center mb-4">
                <span className="text-gray-500 mr-2">🔍</span>
                <input
                  type="text"
                  placeholder="Search users..."
                  className="bg-gray-700 text-white px-3 py-2 rounded-md w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex space-x-2">
                <button
                  className={`px-3 py-1 rounded-md ${timeRange === 'week' ? 'bg-blue-600' : 'bg-gray-700'}`}
                  onClick={() => setTimeRange('week')}
                >
                  Week
                </button>
                <button
                  className={`px-3 py-1 rounded-md ${timeRange === 'month' ? 'bg-blue-600' : 'bg-gray-700'}`}
                  onClick={() => setTimeRange('month')}
                >
                  Month
                </button>
                <button
                  className={`px-3 py-1 rounded-md ${timeRange === 'year' ? 'bg-blue-600' : 'bg-gray-700'}`}
                  onClick={() => setTimeRange('year')}
                >
                  Year
                </button>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-700">
                    <th className="p-3 text-left">Rank</th>
                    <th className="p-3 text-left">User</th>
                    <th className="p-3 text-left">Level</th>
                    <th className="p-3 text-left">XP</th>
                    <th className="p-3 text-left">Streak</th>
                    <th className="p-3 text-left">Contributions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="text-center p-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="border-t border-gray-700 hover:bg-gray-700 cursor-pointer transition-colors"
                        onClick={() => handleUserSelect(user)}
                      >
                        <td className="p-3">
                          {user.rank <= 3 ? (
                            <span className={`mr-1 ${
                              user.rank === 1 ? 'text-yellow-400' :
                              user.rank === 2 ? 'text-gray-400' :
                              'text-yellow-700'
                            }`}>
                              🏆
                            </span>
                          ) : null}
                          #{user.rank}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center">
                            <Image
                              src={user.photoURL}
                              alt={user.displayName}
                              width={32}
                              height={32}
                              className="rounded-full mr-3"
                            />
                            <span className="font-medium">{user.displayName}</span>
                          </div>
                        </td>
                        <td className="p-3">{user.level}</td>
                        <td className="p-3">{user.experience} XP</td>
                        <td className="p-3">
                          <div className="flex items-center">
                            <span className="text-green-500 mr-1">📈</span>
                            {user.streak} days
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center">
                            <span className="text-blue-500 mr-1">💻</span>
                            {user.contributions}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            {currentUserRank && (
              <div className="bg-gray-800 rounded-lg p-4 mb-6">
                <h2 className="text-xl font-semibold mb-4">Your Rank</h2>
                <div className="flex items-center">
                  <Image
                    src={currentUserRank.photoURL}
                    alt={currentUserRank.displayName}
                    width={64}
                    height={64}
                    className="rounded-full mr-4"
                  />
                  <div>
                    <p className="font-semibold text-lg">{currentUserRank.displayName}</p>
                    <p className="text-gray-400">Rank: #{currentUserRank.rank}</p>
                    <p className="text-gray-400">Level: {currentUserRank.level}</p>
                    <p className="text-gray-400">{currentUserRank.experience} XP</p>
                  </div>
                </div>
              </div>
            )}

            {selectedUser && (
              <div className="bg-gray-800 rounded-lg p-4">
                <h2 className="text-xl font-semibold mb-4">User Details</h2>
                <div className="flex items-center mb-4">
                  <Image
                    src={selectedUser.photoURL}
                    alt={selectedUser.displayName}
                    width={64}
                    height={64}
                    className="rounded-full mr-4"
                  />
                  <div>
                    <p className="font-semibold text-lg">{selectedUser.displayName}</p>
                    <p className="text-gray-400">Rank: #{selectedUser.rank}</p>
                    <p className="text-gray-400">Level: {selectedUser.level}</p>
                    <p className="text-gray-400">{selectedUser.experience} XP</p>
                  </div>
                </div>
                <h3 className="font-semibold mb-2">Recent Activity</h3>
                <ul className="space-y-2">
                  {userActivity.map((activity, index) => (
                    <li key={index} className="text-sm">
                      <span className={`mr-2 ${
                        activity.type === 'attack' ? 'text-red-500' :
                        activity.type === 'defense' ? 'text-green-500' :
                        'text-blue-500'
                      }`}>
                        {activity.type === 'attack' ? '🗡️' :
                         activity.type === 'defense' ? '🛡️' :
                         '💻'}
                      </span>
                      {activity.details}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RanklistPage;