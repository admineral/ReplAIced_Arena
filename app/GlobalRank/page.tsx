'use client'

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getTopUsers, getCurrentUserRank, getUserActivity } from '../../services/firestore';
import dynamic from 'next/dynamic';

const MagnifyingGlassIcon = dynamic(() => import('@heroicons/react/24/outline/MagnifyingGlassIcon').then(mod => mod.default));
const TrophyIcon = dynamic(() => import('@heroicons/react/24/outline/TrophyIcon').then(mod => mod.default));
const BoltIcon = dynamic(() => import('@heroicons/react/24/outline/BoltIcon').then(mod => mod.default));
const CalendarIcon = dynamic(() => import('@heroicons/react/24/outline/CalendarIcon').then(mod => mod.default));
const ShieldCheckIcon = dynamic(() => import('@heroicons/react/24/outline/ShieldCheckIcon').then(mod => mod.default));
const SparklesIcon = dynamic(() => import('@heroicons/react/24/outline/SparklesIcon').then(mod => mod.default));
const FireIcon = dynamic(() => import('@heroicons/react/24/outline/FireIcon').then(mod => mod.default));
const UserGroupIcon = dynamic(() => import('@heroicons/react/24/outline/UserGroupIcon').then(mod => mod.default));
const XMarkIcon = dynamic(() => import('@heroicons/react/24/outline/XMarkIcon').then(mod => mod.default));

export interface UserRank {
  id: string;
  displayName: string;
  photoURL: string;
  level: number;
  experience: number;
  rank: number;
  streak: number;
  contributions: number;
  attacksLaunched: number;
  defensesSuccessful: number;
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
  const [activeTab, setActiveTab] = useState('overall');
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showAllUsers, setShowAllUsers] = useState(false);

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
    setShowUserDetails(true);
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

  const generateColor = (userId: string) => {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = `hsl(${hash % 360}, 70%, 60%)`;
    return color;
  };

  const sortedUsers = () => {
    switch (activeTab) {
      case 'attackers':
        return [...filteredUsers].sort((a, b) => b.attacksLaunched - a.attacksLaunched);
      case 'defenders':
        return [...filteredUsers].sort((a, b) => b.defensesSuccessful - a.defensesSuccessful);
      default:
        return filteredUsers;
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between pt-20 md:pt-24 p-4 md:p-24 bg-gradient-to-b from-black to-gray-900 text-white">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="text-3xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent pb-2">
          Global Ranklist
        </h1>
        
        <div className="mb-8">
          <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
            <h2 className="mb-3 text-xl md:text-2xl font-semibold">
              <MagnifyingGlassIcon className="inline-block h-6 w-6 mr-2" />
              Search
            </h2>
            <input
              type="text"
              placeholder="Search users..."
              className="bg-gray-800 text-white px-4 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="mb-8 flex flex-wrap justify-between items-center gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              className={`flex items-center justify-center px-4 py-2 rounded-md transition-colors ${activeTab === 'overall' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
              onClick={() => setActiveTab('overall')}
            >
              <UserGroupIcon className="h-5 w-5 mr-2" />
              <span className="whitespace-nowrap">Overall</span>
            </button>
            <button
              className={`flex items-center justify-center px-4 py-2 rounded-md transition-colors ${activeTab === 'attackers' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
              onClick={() => setActiveTab('attackers')}
            >
              <SparklesIcon className="h-5 w-5 mr-2" />
              <span className="whitespace-nowrap">Top Attackers</span>
            </button>
            <button
              className={`flex items-center justify-center px-4 py-2 rounded-md transition-colors ${activeTab === 'defenders' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
              onClick={() => setActiveTab('defenders')}
            >
              <ShieldCheckIcon className="h-5 w-5 mr-2" />
              <span className="whitespace-nowrap">Top Defenders</span>
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {['week', 'month', 'year'].map((range) => (
              <button
                key={range}
                className={`px-4 py-2 rounded-md transition-colors ${
                  timeRange === range ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                }`}
                onClick={() => setTimeRange(range)}
              >
                <CalendarIcon className="inline-block h-5 w-5 mr-2" />
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-500 bg-opacity-10 border border-red-500 text-red-500 rounded-lg">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg shadow-lg overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-900">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Level</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">XP</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Streak</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Attacks</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Defenses</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {sortedUsers().slice(0, showAllUsers ? undefined : 10).map((user, index) => (
                  <tr 
                    key={user.id} 
                    className={`hover:bg-gray-700 cursor-pointer transition-colors ${index < 3 ? 'bg-gradient-to-r from-gray-800 to-gray-700' : ''}`}
                    onClick={() => handleUserSelect(user)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.rank <= 3 && (
                          <span className={`mr-2 ${
                            user.rank === 1 ? 'text-yellow-400' :
                            user.rank === 2 ? 'text-gray-400' :
                            'text-yellow-700'
                          }`}>
                            {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : '🥉'}
                          </span>
                        )}
                        <span className="font-medium">{user.rank}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          style={{
                            backgroundColor: generateColor(user.id),
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            marginRight: '12px'
                          }}
                        />
                        <span className="font-medium">{user.displayName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <FireIcon className="inline-block h-5 w-5 mr-1 text-orange-500" />
                      {user.level}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <BoltIcon className="inline-block h-5 w-5 mr-1 text-yellow-500" />
                      {user.experience}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <CalendarIcon className="inline-block h-5 w-5 mr-1 text-green-500" />
                      {user.streak}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <SparklesIcon className="inline-block h-5 w-5 mr-1 text-red-500" />
                      {user.attacksLaunched}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <ShieldCheckIcon className="inline-block h-5 w-5 mr-1 text-blue-500" />
                      {user.defensesSuccessful}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {sortedUsers().length > 10 && !showAllUsers && (
              <div className="text-center py-4 bg-gray-900">
                <button 
                  className="text-blue-500 hover:text-blue-400 transition-colors"
                  onClick={() => setShowAllUsers(true)}
                >
                  Show More
                </button>
              </div>
            )}
          </div>
        )}

        {/* Slide-in User Details Panel */}
        <div className={`fixed top-0 right-0 w-full md:w-96 h-full bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out ${showUserDetails ? 'translate-x-0' : 'translate-x-full'}`}>
          {selectedUser && (
            <div className="p-6 h-full overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">User Details</h2>
                <button onClick={() => setShowUserDetails(false)} className="text-gray-400 hover:text-white">
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="flex items-center mb-6">
                <div
                  style={{
                    backgroundColor: generateColor(selectedUser.id),
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    marginRight: '16px'
                  }}
                />
                <div>
                  <p className="font-semibold text-xl">{selectedUser.displayName}</p>
                  <p className="text-gray-400">
                    <TrophyIcon className="inline-block h-5 w-5 mr-1 text-yellow-500" />
                    Rank: #{selectedUser.rank} •
                    <FireIcon className="inline-block h-5 w-5 mx-1 text-orange-500" />
                    Level: {selectedUser.level} •
                    <BoltIcon className="inline-block h-5 w-5 mx-1 text-yellow-500" />
                    {selectedUser.experience} XP
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2 flex items-center">
                    <SparklesIcon className="h-6 w-6 mr-2 text-red-500" />
                    Attacks Launched
                  </h3>
                  <p className="text-3xl font-bold">{selectedUser.attacksLaunched}</p>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2 flex items-center">
                    <ShieldCheckIcon className="h-6 w-6 mr-2 text-blue-500" />
                    Defenses Successful
                  </h3>
                  <p className="text-3xl font-bold">{selectedUser.defensesSuccessful}</p>
                </div>
              </div>
              <h3 className="font-semibold text-lg mb-3">Recent Activity</h3>
              <ul className="space-y-3">
                {userActivity.map((activity, index) => (
                  <li key={index} className="flex items-center text-sm bg-gray-700 rounded-lg p-3">
                    <span className={`mr-3 text-xl ${
                      activity.type === 'attack' ? 'text-red-500' :
                      activity.type === 'defense' ? 'text-blue-500' :
                      'text-green-500'
                    }`}>
                      {activity.type === 'attack' ? <SparklesIcon className="h-6 w-6" /> :
                       activity.type === 'defense' ? <ShieldCheckIcon className="h-6 w-6" /> :
                       <BoltIcon className="h-6 w-6" />}
                    </span>
                    <span>{activity.details}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default RanklistPage;