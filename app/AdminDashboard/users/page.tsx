'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { collection, getDocs, updateDoc, doc, query, orderBy, limit, startAfter } from 'firebase/firestore';
import { db } from '../../../firebase-config';
import { useRouter } from 'next/navigation';
import { FaUserShield, FaUserAltSlash, FaChevronLeft, FaChevronRight, FaUsers, FaUserCog } from 'react-icons/fa';

interface User {
  id: string;
  displayName: string;
  email: string;
  isAdmin: boolean;
  photoURL?: string;
}

const UserManagement = () => {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [userToUpdate, setUserToUpdate] = useState<User | null>(null);
  const usersPerPage = 10;

  useEffect(() => {
    if (!isAdmin) {
      router.push('/');
    } else {
      fetchUsers();
    }
  }, [isAdmin, router]);

  const fetchUsers = async () => {
    setLoading(true);
    const usersRef = collection(db, 'users');
    let q = query(usersRef, orderBy('email'), limit(usersPerPage));

    if (lastVisible) {
      q = query(q, startAfter(lastVisible));
    }

    const snapshot = await getDocs(q);
    const fetchedUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));

    setUsers(fetchedUsers);
    setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
    setLoading(false);
  };

  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { isAdmin: !currentStatus });
    setUsers(users.map(user => 
      user.id === userId ? { ...user, isAdmin: !currentStatus } : user
    ));
    setShowConfirmation(false);
    setUserToUpdate(null);
  };

  const handleNextPage = () => {
    setCurrentPage(currentPage + 1);
    fetchUsers();
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      fetchUsers();
    }
  };

  const handleConfirmation = (user: User) => {
    setUserToUpdate(user);
    setShowConfirmation(true);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 bg-gray-900 min-h-screen text-white pt-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <button
          onClick={() => router.push('/AdminDashboard')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition duration-150 ease-in-out"
        >
          Go Back to Dashboard
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <FaUsers className="text-3xl text-blue-500 mr-4" />
            <div>
              <h2 className="text-xl font-semibold">Total Users</h2>
              <p className="text-2xl font-bold">{users.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <FaUserShield className="text-3xl text-green-500 mr-4" />
            <div>
              <h2 className="text-xl font-semibold">Admin Users</h2>
              <p className="text-2xl font-bold">{users.filter(u => u.isAdmin).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <FaUserCog className="text-3xl text-purple-500 mr-4" />
            <div>
              <h2 className="text-xl font-semibold">Regular Users</h2>
              <p className="text-2xl font-bold">{users.filter(u => !u.isAdmin).length}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Admin Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {users.map(user => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img className="h-10 w-10 rounded-full" src={user.photoURL || '/default-avatar.png'} alt="" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-300">{user.displayName || 'N/A'}</div>
                      <div className="text-sm text-gray-500">ID: {user.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-300">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isAdmin ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {user.isAdmin ? 'Admin' : 'User'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleConfirmation(user)}
                    className={`inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-white ${
                      user.isAdmin ? 'bg-red-600 hover:bg-red-500' : 'bg-green-600 hover:bg-green-500'
                    } transition duration-150 ease-in-out`}
                  >
                    {user.isAdmin ? (
                      <>
                        <FaUserAltSlash className="mr-2" />
                        Remove Admin
                      </>
                    ) : (
                      <>
                        <FaUserShield className="mr-2" />
                        Make Admin
                      </>
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex justify-between items-center">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-blue-600 ${
            currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-500'
          } transition duration-150 ease-in-out`}
        >
          <FaChevronLeft className="mr-2" />
          Previous
        </button>
        <span className="text-sm text-gray-300">Page {currentPage}</span>
        <button
          onClick={handleNextPage}
          disabled={users.length < usersPerPage}
          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-blue-600 ${
            users.length < usersPerPage ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-500'
          } transition duration-150 ease-in-out`}
        >
          Next
          <FaChevronRight className="ml-2" />
        </button>
      </div>

      {showConfirmation && userToUpdate && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-gray-800 p-5 rounded-lg shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-white">Confirm Action</h2>
            <p className="text-gray-300">Are you sure you want to {userToUpdate.isAdmin ? 'remove admin rights from' : 'make admin'} {userToUpdate.displayName || userToUpdate.email}?</p>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={() => toggleAdminStatus(userToUpdate.id, userToUpdate.isAdmin)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;