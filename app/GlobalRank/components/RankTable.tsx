import React from 'react';
import { UserRank } from '../types';
import { sortUsers } from '../utils/sortUser';
import { generateColor } from '../utils/generateColor';
import { TrophyIcon, FireIcon, BoltIcon, CalendarIcon, SparklesIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

interface RankTableProps {
  users: UserRank[];
  searchTerm: string;
  activeTab: string;
  showAllUsers: boolean;
  setShowAllUsers: (show: boolean) => void;
  onUserSelect: (user: UserRank) => void;
}

export const RankTable: React.FC<RankTableProps> = ({ 
  users, 
  searchTerm, 
  activeTab, 
  showAllUsers, 
  setShowAllUsers, 
  onUserSelect 
}) => {
  const filteredUsers = users.filter(user => 
    user.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedUsers = sortUsers(filteredUsers, activeTab);

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-900">
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Rank</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Level</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Experience</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Streak</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Attacks</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Defenses</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {sortedUsers.slice(0, showAllUsers ? undefined : 10).map((user, index) => (
            <tr 
              key={user.id} 
              className={`hover:bg-gray-700 cursor-pointer transition-colors ${index < 3 ? 'bg-gradient-to-r from-gray-800 to-gray-700' : ''}`}
              onClick={() => onUserSelect(user)}
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
      {sortedUsers.length > 10 && !showAllUsers && (
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
  );
};
