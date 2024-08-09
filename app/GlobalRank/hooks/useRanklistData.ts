import { useState, useEffect } from 'react';
import { getTopUsers, getCurrentUserRank, populateDatabase, increaseRandomUsersExperience, deleteAllUsers } from '../../../services/firestore';
import { UserRank } from '../types';

export const useRanklistData = (user: any) => {
  const [users, setUsers] = useState<UserRank[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<UserRank | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    fetchUsers();
  }, [user]);

  const handlePopulateDatabase = async () => {
    try {
      setIsLoading(true);
      await populateDatabase(100);
      alert('Database populated with 100 fake users');
      await fetchUsers();
    } catch (error) {
      console.error('Error populating database:', error);
      alert('Error populating database');
    } finally {
      setIsLoading(false);
    }
  };

  const handleIncreaseExperience = async () => {
    try {
      setIsLoading(true);
      await increaseRandomUsersExperience(10, 100);
      alert(`Experience increased for 10 random users`);
      await fetchUsers();
    } catch (error) {
      console.error('Error increasing experience:', error);
      alert('Error increasing experience');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAllUsers = async () => {
    if (window.confirm("Are you sure you want to delete all users? This action cannot be undone.")) {
      try {
        setIsLoading(true);
        await deleteAllUsers();
        alert('All users have been deleted');
        setUsers([]);
        setCurrentUserRank(null);
      } catch (error) {
        console.error('Error deleting users:', error);
        alert('Error deleting users');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return {
    users,
    currentUserRank,
    isLoading,
    error,
    fetchUsers,
    handlePopulateDatabase,
    handleIncreaseExperience,
    handleDeleteAllUsers,
  };
};
