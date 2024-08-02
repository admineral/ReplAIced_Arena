/****************************************************************************
 * hooks/useUpdateTimeInterval.js
 * 
 * Custom Hook for Update Time Interval
 * 
 * This custom React hook manages the update time interval for the
 * AI Security Map application. It provides a way to keep track of
 * the current time and update it at regular intervals when needed.
 ****************************************************************************/

import { useState, useEffect } from 'react';

/**
 * Custom hook to manage update time interval
 * @param {Date|null} lastUpdateTime - The timestamp of the last update
 * @param {number} [intervalMs=1000] - The interval in milliseconds to update the current time
 * @returns {Date} The current time
 */
export const useUpdateTimeInterval = (lastUpdateTime, intervalMs = 1000) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    let interval;

    // Only start the interval if there's a lastUpdateTime
    if (lastUpdateTime) {
      // Set up the interval to update currentTime
      interval = setInterval(() => {
        setCurrentTime(new Date());
      }, intervalMs);
    }

    // Clean up function to clear the interval when the component unmounts
    // or when lastUpdateTime changes
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [lastUpdateTime, intervalMs]); // Re-run effect if lastUpdateTime or intervalMs changes

  return currentTime;
};

export default useUpdateTimeInterval;