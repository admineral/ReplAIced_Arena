'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { FaMap, FaUsers, FaChartBar, FaCog, FaUserShield, FaExclamationTriangle, FaChevronDown, FaChevronUp } from 'react-icons/fa';
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
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-blue-900 text-white pt-24">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link href="/AdminDashboard/users" className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition-colors">
            <FaUsers className="text-3xl mb-2 text-blue-400" />
            <h2 className="text-xl font-semibold">Manage Users</h2>
          </Link>
          <Link href="/AdminDashboard/challenges" className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition-colors">
            <FaMap className="text-3xl mb-2 text-green-400" />
            <h2 className="text-xl font-semibold">Manage Challenges</h2>
          </Link>
          <Link href="/AdminDashboard/ToDo" className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition-colors">
            <FaExclamationTriangle className="text-3xl mb-2 text-yellow-400" />
            <h2 className="text-xl font-semibold">ToDo List</h2>
          </Link>
          <Link href="/AdminDashboard/settings" className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition-colors">
            <FaCog className="text-3xl mb-2 text-purple-400" />
            <h2 className="text-xl font-semibold">Settings</h2>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-800 shadow rounded-lg p-6">
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

          <div className="bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <ul>
              {recentActivity.map((activity, index) => (
                <li key={index} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-b-0">
                  <span>{activity.details}</span>
                  <span className="text-gray-400 text-sm">{new Date(activity.timestamp).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaUserShield className="h-6 w-6 text-blue-400" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-400 truncate">Total Users</dt>
                    <dd className="mt-1 text-3xl font-semibold text-white">{userCount}</dd>
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
                    <dd className="mt-1 text-3xl font-semibold text-white">{pendingReports}</dd>
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
                    <dd className="mt-1 text-3xl font-semibold text-white">{activeChallenges}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowDebugConsole(!showDebugConsole)}
          className="mt-8 bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors flex items-center"
        >
          {showDebugConsole ? 'Hide' : 'Show'} Debug Console
          {showDebugConsole ? <FaChevronUp className="ml-2" /> : <FaChevronDown className="ml-2" />}
        </button>

        {showDebugConsole && (
          <div className="mt-4 bg-gray-800 rounded-lg p-6 overflow-auto max-h-96">
            <h2 className="text-xl font-bold mb-4">Debug Console</h2>
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Logged In User:</h3>
              <pre className="bg-gray-900 p-2 rounded overflow-x-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Admin Users:</h3>
              <ul className="bg-gray-900 p-2 rounded">
                {adminUsers.map(admin => (
                  <li key={admin.id} className="mb-2">
                    {admin.displayName || admin.email} (ID: {admin.id})
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Non-Admin Users:</h3>
              <ul className="bg-gray-900 p-2 rounded">
                {nonAdminUsers.map(nonAdmin => (
                  <li key={nonAdmin.id} className="mb-2">
                    {nonAdmin.displayName || nonAdmin.email} (ID: {nonAdmin.id})
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;