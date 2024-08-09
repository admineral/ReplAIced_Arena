import { useState, useEffect } from 'react';
import { getUserActivity } from '../../../services/firestore';
import { Activity } from '../types';

export const useUserActivity = (userId: string | undefined, timeRange: string) => {
  const [userActivity, setUserActivity] = useState<Activity[]>([]);

  useEffect(() => {
    const fetchUserActivity = async () => {
      if (userId) {
        try {
          const activity = await getUserActivity(userId, timeRange);
          setUserActivity(activity);
        } catch (error) {
          console.error("Error fetching user activity:", error);
        }
      }
    };

    fetchUserActivity();
  }, [userId, timeRange]);

  return { userActivity };
};
