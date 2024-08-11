'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { FaMap, FaUsers, FaChartBar, FaCog, FaUserShield, FaExclamationTriangle, FaChevronDown, FaChevronUp, FaUser, FaUserTie } from 'react-icons/fa';
import { getTopUsers, getUserActivity, getAllUsers } from '../../services/firestore';
import Image from 'next/image';
import Link from 'next/link';

interface TopUser {
  id: string;
  displayName: string;
  level: number;
}

interface Activity {
  details: string;
  timestamp: number;
}

interface User {
  id: string;
  displayName: string;
  email: string;
  isAdmin: boolean;
}

const AdminDashboard = () => {
  const { user, isAdmin, login, logout } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [nonAdminUsers, setNonAdminUsers] = useState<User[]>([]);
  const [showDebugConsole, setShowDebugConsole] = useState(false);
  const [pendingReports, setPendingReports] = useState(0);
  const [activeChallenges, setActiveChallenges] = useState(0);

  useEffect(() => {
    if (user === null) {
      setIsLoading(false);
    } else if (user && !isAdmin) {
      router.push('/');
    } else {
      loadDashboardData();
    }
  }, [user, isAdmin, router]);

  const loadDashboardData = async () => {
    try {
      const [users, activity, allUsers] = await Promise.all([
        getTopUsers(5),
        getUserActivity(user!.uid, 'recent'),
        getAllUsers()
      ]);
      setTopUsers(users as TopUser[]);
      setUserCount(allUsers.length);
      setRecentActivity(activity as Activity[]);
      
      const admins = allUsers.filter(u => u.isAdmin);
      const nonAdmins = allUsers.filter(u => !u.isAdmin);
      setAdminUsers(admins);
      setNonAdminUsers(nonAdmins);

      setPendingReports(Math.floor(Math.random() * 10));
      setActiveChallenges(Math.floor(Math.random() * 20));

      setIsLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const renderSummaryBox = () => {
    return (
      <div className="bg-gray-800 rounded-lg shadow p-4 sm:p-6 mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">Dashboard Summary</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Logged In Admin</h3>
            <div className="flex items-center">
              <img src={user?.photoURL || '/default-avatar.png'} alt={user?.displayName || 'Admin'} className="w-10 h-10 rounded-full mr-3" />
              <div>
                <p className="font-medium">{user?.displayName || 'N/A'}</p>
                <p className="text-sm text-gray-400">{user?.email}</p>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center">
                <FaUsers className="text-xl sm:text-2xl text-blue-400 mr-2" />
                <span className="text-sm sm:text-base">{userCount} Total Users</span>
              </div>
              <div className="flex items-center">
                <FaUserTie className="text-xl sm:text-2xl text-green-400 mr-2" />
                <span className="text-sm sm:text-base">{adminUsers.length} Admins</span>
              </div>
              <div className="flex items-center">
                <FaExclamationTriangle className="text-xl sm:text-2xl text-yellow-400 mr-2" />
                <span className="text-sm sm:text-base">{pendingReports} Pending Reports</span>
              </div>
              <div className="flex items-center">
                <FaChartBar className="text-xl sm:text-2xl text-purple-400 mr-2" />
                <span className="text-sm sm:text-base">{activeChallenges} Active Challenges</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDebugInfo = () => {
    return (
      <div className="mt-4 bg-gray-800 rounded-lg p-4 sm:p-6 overflow-auto max-h-96">
        <h2 className="text-xl font-bold mb-4">Debug Information</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Logged In User Details</h3>
            <div className="bg-gray-900 p-3 sm:p-4 rounded">
              <p><strong>Name:</strong> {user?.displayName || 'N/A'}</p>
              <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
              <p><strong>User ID:</strong> {user?.uid || 'N/A'}</p>
              <p><strong>Provider:</strong> {user?.providerData[0]?.providerId || 'N/A'}</p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">User Statistics</h3>
            <div className="bg-gray-900 p-3 sm:p-4 rounded">
              <p><strong>Total Users:</strong> {userCount}</p>
              <p><strong>Admin Users:</strong> {adminUsers.length}</p>
              <p><strong>Non-Admin Users:</strong> {nonAdminUsers.length}</p>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Admin Users List</h3>
          <div className="bg-gray-900 p-3 sm:p-4 rounded">
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {adminUsers.map(admin => (
                <li key={admin.id} className="flex items-center">
                  <FaUserShield className="text-green-400 mr-2" />
                  <span className="text-sm sm:text-base">{admin.displayName || admin.email}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen bg-gray-900 text-white">Loading...</div>;
  }

  if (!user || !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
        <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
        <button
          onClick={handleLogin}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Login with GitHub
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-blue-900 text-white pt-16 sm:pt-24">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-0">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>

        {renderSummaryBox()}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 sm:mb-8">
          <Link href="/AdminDashboard/users" className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition-colors">
            <FaUsers className="text-2xl sm:text-3xl mb-2 text-blue-400" />
            <h2 className="text-lg sm:text-xl font-semibold">Manage Users</h2>
          </Link>
          <Link href="/AdminDashboard/mapconfig" className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition-colors">
            <FaMap className="text-2xl sm:text-3xl mb-2 text-green-400" />
            <h2 className="text-lg sm:text-xl font-semibold">Map Configurator</h2>
          </Link>
          <Link href="/AdminDashboard/ToDo" className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition-colors">
            <FaExclamationTriangle className="text-2xl sm:text-3xl mb-2 text-yellow-400" />
            <h2 className="text-lg sm:text-xl font-semibold">ToDo List</h2>
          </Link>
          <Link href="/AdminDashboard/settings" className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition-colors">
            <FaCog className="text-2xl sm:text-3xl mb-2 text-purple-400" />
            <h2 className="text-lg sm:text-xl font-semibold">Settings</h2>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <div className="bg-gray-800 shadow rounded-lg p-4 sm:p-6">
            <h2 className="text-xl font-semibold mb-4">Top Users</h2>
            <ul>
              {topUsers.map((user) => (
                <li key={user.id} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-b-0">
                  <span>{user.displayName}</span>
                  <span className="text-blue-400">Level {user.level}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gray-800 shadow rounded-lg p-4 sm:p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <ul>
              {recentActivity.map((activity, index) => (
                <li key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 border-b border-gray-700 last:border-b-0">
                  <span className="mb-1 sm:mb-0">{activity.details}</span>
                  <span className="text-gray-400 text-sm">{new Date(activity.timestamp).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaUserShield className="h-6 w-6 text-blue-400" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-400 truncate">Total Users</dt>
                    <dd className="mt-1 text-2xl sm:text-3xl font-semibold text-white">{userCount}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaExclamationTriangle className="h-6 w-6 text-yellow-400" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-400 truncate">Pending Reports</dt>
                    <dd className="mt-1 text-2xl sm:text-3xl font-semibold text-white">{pendingReports}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaChartBar className="h-6 w-6 text-green-400" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-400 truncate">Active Challenges</dt>
                    <dd className="mt-1 text-2xl sm:text-3xl font-semibold text-white">{activeChallenges}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowDebugConsole(!showDebugConsole)}
          className="mt-6 sm:mt-8 bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors flex items-center"
        >
          {showDebugConsole ? 'Hide' : 'Show'} Debug Information
          {showDebugConsole ? <FaChevronUp className="ml-2" /> : <FaChevronDown className="ml-2" />}
        </button>

        {showDebugConsole && renderDebugInfo()}
      </main>
    </div>
  );
};

export default AdminDashboard;