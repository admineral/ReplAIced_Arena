import React from 'react';
import { UserRank } from '../types';
import { useUserActivity } from '../hooks/useUserActivity';
import { generateColor } from '../utils/generateColor';

interface UserDetailsPanelProps {
  selectedUser: UserRank | null;
  showUserDetails: boolean;
  setShowUserDetails: (show: boolean) => void;
  timeRange: string;
}

export const UserDetailsPanel: React.FC<UserDetailsPanelProps> = ({
  selectedUser,
  showUserDetails,
  setShowUserDetails,
  timeRange
}) => {
  const { userActivity } = useUserActivity(selectedUser?.id, timeRange);

  if (!selectedUser || !showUserDetails) {
    return null;
  }

  return (
    <div className="mt-8 bg-gray-800 rounded-lg shadow-lg p-4">
      <h2 className="text-2xl font-bold mb-4">
        <span
          style={{
            backgroundColor: generateColor(selectedUser.id),
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            marginRight: '12px'
          }}
        />
        {selectedUser.displayName}
      </h2>
      <div className="flex justify-between mb-4">
        <div className="flex items-center">
          <span className="text-gray-400">Level:</span>
          <span className="text-gray-300 ml-2">{selectedUser.level}</span>
        </div>
        <div className="flex items-center">
          <span className="text-gray-400">Experience:</span>
          <span className="text-gray-300 ml-2">{selectedUser.experience}</span>
        </div>
      </div>
      <div className="flex justify-between mb-4">
        <div className="flex items-center">
          <span className="text-gray-400">Streak:</span>
          <span className="text-gray-300 ml-2">{selectedUser.streak}</span>
        </div>
        <div className="flex items-center">
          <span className="text-gray-400">Attacks:</span>
          <span className="text-gray-300 ml-2">{selectedUser.attacksLaunched}</span>
        </div>
      </div>
      <div className="flex justify-between mb-4">
        <div className="flex items-center">
          <span className="text-gray-400">Defenses:</span>
          <span className="text-gray-300 ml-2">{selectedUser.defensesSuccessful}</span>
        </div>
        <div className="flex items-center">
          <span className="text-gray-400">Rank:</span>
          <span className="text-gray-300 ml-2">{selectedUser.rank}</span>
        </div>
      </div>
      <div className="flex justify-between mb-4">
        <div className="flex items-center">
          <span className="text-gray-400">Activity:</span>
          <span className="text-gray-300 ml-2">
            {userActivity.length > 0 ? userActivity.map(activity => activity.type).join(', ') : 'No recent activity'}
          </span>
        </div>
      </div>
      <button
        className="bg-gray-700 hover:bg-gray-600 transition-colors px-4 py-2 rounded-md w-full"
        onClick={() => setShowUserDetails(false)}
      >
        Close
      </button>
    </div>
  );
};