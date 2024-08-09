'use client'

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRanklistData } from './hooks/useRanklistData';
import { RankTable } from './components/RankTable';
import { UserDetailsPanel } from './components/UseDetailsPanel';
import { ControlPanel } from './components/ControlPanel';
import { LoadingSpinner } from './components/LoadingSpinner';
import { UserRank } from './types';

const RanklistPage: React.FC = () => {
  const { user } = useAuth();
  const { 
    users, 
    currentUserRank, 
    isLoading, 
    error, 
    fetchUsers, 
    handlePopulateDatabase, 
    handleIncreaseExperience, 
    handleDeleteAllUsers 
  } = useRanklistData(user);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserRank | null>(null);
  const [timeRange, setTimeRange] = useState('week');
  const [activeTab, setActiveTab] = useState('overall');
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showAllUsers, setShowAllUsers] = useState(false);

  const handleUserSelect = (user: UserRank) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-gradient-to-b from-black to-gray-900 text-white">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-5xl font-bold mb-8 bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent pb-2">
          Global Ranklist
        </h1>
        
        <ControlPanel
          handlePopulateDatabase={handlePopulateDatabase}
          handleIncreaseExperience={handleIncreaseExperience}
          handleDeleteAllUsers={handleDeleteAllUsers}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          timeRange={timeRange}
          setTimeRange={setTimeRange}
        />

        {error && (
          <div className="mb-8 p-4 bg-red-500 bg-opacity-10 border border-red-500 text-red-500 rounded-lg">
            {error}
          </div>
        )}

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <RankTable
            users={users}
            searchTerm={searchTerm}
            activeTab={activeTab}
            showAllUsers={showAllUsers}
            setShowAllUsers={setShowAllUsers}
            onUserSelect={handleUserSelect}
          />
        )}

        <UserDetailsPanel
          selectedUser={selectedUser}
          showUserDetails={showUserDetails}
          setShowUserDetails={setShowUserDetails}
          timeRange={timeRange}
        />
      </div>
    </main>
  );
};

export default RanklistPage;