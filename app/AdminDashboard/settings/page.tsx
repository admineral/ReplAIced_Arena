'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaCog, FaBell, FaLock, FaDatabase, FaPalette, FaChevronLeft } from 'react-icons/fa';

const DashboardSettings = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [dataRetention, setDataRetention] = useState('30');
  const [securityLevel, setSecurityLevel] = useState('high');

  const handleSave = () => {
    // Placeholder for saving settings
    console.log('Settings saved:', { notifications, darkMode, dataRetention, securityLevel });
    // In a real application, you would send these settings to your backend or update them in your state management system
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-blue-900 text-white pt-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Dashboard Settings</h1>
          <button
            onClick={() => router.push('/AdminDashboard')}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition duration-150 ease-in-out"
          >
            <FaChevronLeft className="mr-2" />
            Back to Dashboard
          </button>
        </div>

        <div className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-lg shadow-xl p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FaBell className="mr-2" /> Notifications
              </h2>
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={notifications}
                    onChange={() => setNotifications(!notifications)}
                  />
                  <div className={`block w-14 h-8 rounded-full ${notifications ? 'bg-blue-400' : 'bg-gray-600'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${notifications ? 'transform translate-x-6' : ''}`}></div>
                </div>
                <div className="ml-3 text-gray-200 font-medium">
                  {notifications ? 'Enabled' : 'Disabled'}
                </div>
              </label>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FaPalette className="mr-2" /> Appearance
              </h2>
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={darkMode}
                    onChange={() => setDarkMode(!darkMode)}
                  />
                  <div className={`block w-14 h-8 rounded-full ${darkMode ? 'bg-blue-400' : 'bg-gray-600'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${darkMode ? 'transform translate-x-6' : ''}`}></div>
                </div>
                <div className="ml-3 text-gray-200 font-medium">
                  {darkMode ? 'Dark Mode' : 'Light Mode'}
                </div>
              </label>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FaDatabase className="mr-2" /> Data Retention
              </h2>
              <select
                value={dataRetention}
                onChange={(e) => setDataRetention(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-gray-700 text-white"
              >
                <option value="7">7 days</option>
                <option value="30">30 days</option>
                <option value="90">90 days</option>
                <option value="365">1 year</option>
              </select>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FaLock className="mr-2" /> Security Level
              </h2>
              <div className="space-y-2">
                {['low', 'medium', 'high'].map((level) => (
                  <label key={level} className="flex items-center">
                    <input
                      type="radio"
                      name="security"
                      value={level}
                      checked={securityLevel === level}
                      onChange={() => setSecurityLevel(level)}
                      className="form-radio h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                    />
                    <span className="ml-2 text-gray-200 capitalize">{level}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={handleSave}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSettings;