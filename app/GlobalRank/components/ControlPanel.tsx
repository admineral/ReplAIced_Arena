import React from 'react';
import { TrophyIcon, BoltIcon, TrashIcon, MagnifyingGlassIcon, UserGroupIcon, SparklesIcon, ShieldCheckIcon, CalendarIcon } from '@heroicons/react/24/outline';

interface ControlPanelProps {
  handlePopulateDatabase: () => Promise<void>;
  handleIncreaseExperience: () => Promise<void>;
  handleDeleteAllUsers: () => Promise<void>;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  timeRange: string;
  setTimeRange: (range: string) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  handlePopulateDatabase,
  handleIncreaseExperience,
  handleDeleteAllUsers,
  searchTerm,
  setSearchTerm,
  activeTab,
  setActiveTab,
  timeRange,
  setTimeRange
}) => {
  return (
    <>
      <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <button
          onClick={handlePopulateDatabase}
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
        >
          <h2 className="mb-3 text-2xl font-semibold">
            <TrophyIcon className="inline-block h-6 w-6 mr-2" />
            Populate DB
          </h2>
        </button>

        <button
          onClick={handleIncreaseExperience}
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
        >
          <h2 className="mb-3 text-2xl font-semibold">
            <BoltIcon className="inline-block h-6 w-6 mr-2" />
            Boost XP
          </h2>
        </button>

        <button
          onClick={handleDeleteAllUsers}
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
        >
          <h2 className="mb-3 text-2xl font-semibold">
            <TrashIcon className="inline-block h-6 w-6 mr-2" />
            Delete All
          </h2>
        </button>

        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
          <h2 className="mb-3 text-2xl font-semibold">
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

      <div className="mb-8 flex justify-between items-center">
        <div className="flex space-x-2">
          <button
            className={`flex items-center justify-center min-w-[120px] px-4 py-2 rounded-md transition-colors ${activeTab === 'overall' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            onClick={() => setActiveTab('overall')}
          >
            <UserGroupIcon className="h-5 w-5 mr-2" />
            <span className="whitespace-nowrap">Overall</span>
          </button>
          <button
            className={`flex items-center justify-center min-w-[120px] px-4 py-2 rounded-md transition-colors ${activeTab === 'attackers' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            onClick={() => setActiveTab('attackers')}
          >
            <SparklesIcon className="h-5 w-5 mr-2" />
            <span className="whitespace-nowrap">Top Attackers</span>
          </button>
          <button
            className={`flex items-center justify-center min-w-[120px] px-4 py-2 rounded-md transition-colors ${activeTab === 'defenders' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            onClick={() => setActiveTab('defenders')}
          >
            <ShieldCheckIcon className="h-5 w-5 mr-2" />
            <span className="whitespace-nowrap">Top Defenders</span>
          </button>
        </div>
        <div className="flex space-x-2">
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
    </>
  );
};
