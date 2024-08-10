/****************************************************************************
 * components/Map/dataManagement.js
 * 
 * Data Management Functions for AI Security Map
 * 
 * This file contains functions related to loading, validating, and managing
 * box data for the AI Security Map application. These functions handle
 * interactions with Firebase and local state management.
 ****************************************************************************/

import { useRef, useCallback } from 'react';

// Cache for storing box data
let boxCache = {
  data: null,
  timestamp: null
};

const CACHE_EXPIRATION_TIME = 60000; // 1 minute in milliseconds

export const validateBoxData = (boxData) => {
    const requiredFields = ['x', 'y', 'type', 'id', 'difficulty', 'createdAt', 'createdBy', 'secretWord'];
    const hasRequiredFields = requiredFields.every(field => field in boxData);
    
    const hasSystemPrompt = 'systemPrompt' in boxData || 'combinedSystemPrompt' in boxData;
    
    if (!hasRequiredFields || !hasSystemPrompt) {
        console.warn('Invalid box data:', boxData);
        return false;
    }
    
    return true;
};

// Handler for loading boxes from Firebase
export const handleLoadBoxes = (loadBoxesFromFirebase, setIsLoading, setError, setIsTimedOut, setLastUpdateTime, setLoadingTimeout, setBoxes) => {
  let isLoading = false;

  return async (forceRefresh = false) => {
    if (isLoading) {
      console.log('Load boxes operation already in progress. Skipping.');
      return;
    }

    const currentTime = Date.now();
    if (!forceRefresh && boxCache.data && boxCache.timestamp && (currentTime - boxCache.timestamp < CACHE_EXPIRATION_TIME)) {
      console.log('Using cached boxes data. Cache age:', currentTime - boxCache.timestamp, 'ms');
      setBoxes(boxCache.data);
      setLastUpdateTime(new Date(boxCache.timestamp));
      return;
    }
    
    console.log('Starting load boxes operation.');
    isLoading = true;
    setIsLoading(true);
    setError(null);
    setIsTimedOut(false);

    const timeoutId = setTimeout(() => {
      setIsTimedOut(true);
      setIsLoading(false);
      setError('Loading timed out. Please try again.');
      console.log('Load boxes operation timed out.');
      isLoading = false;
    }, 10000); // 10 seconds timeout

    setLoadingTimeout(timeoutId);

    try {
      console.log('Fetching boxes from Firebase.');
      const loadedBoxes = await loadBoxesFromFirebase();
      console.log('Loaded boxes:', loadedBoxes);
      
      if (!Array.isArray(loadedBoxes)) {
        throw new Error(`loadBoxesFromFirebase did not return an array. Received: ${typeof loadedBoxes}`);
      }

      const validBoxes = loadedBoxes.filter(validateBoxData);
      if (validBoxes.length !== loadedBoxes.length) {
        console.warn(`${loadedBoxes.length - validBoxes.length} boxes were invalid and filtered out.`);
      }
      console.log(`Successfully loaded ${validBoxes.length} boxes.`);
      
      // Update cache
      boxCache = {
        data: validBoxes,
        timestamp: currentTime
      };
      console.log('Box cache updated.');
      
      if (typeof setBoxes !== 'function') {
        console.error('setBoxes is not a function:', setBoxes);
        throw new Error('setBoxes is not a function');
      }
      
      setBoxes(validBoxes);
      setLastUpdateTime(new Date(currentTime));
      clearTimeout(timeoutId);
    } catch (err) {
      setError('Failed to load boxes. Please try again.');
      console.error('Error loading boxes:', err);
    } finally {
      setIsLoading(false);
      clearTimeout(timeoutId);
      isLoading = false;
      console.log('Load boxes operation completed.');
    }
  };
};
// Handler for reloading boxes
export const handleReloadBoxes = (handleLoadBoxes) => () => {
  console.log('Reloading boxes (force refresh).');
  handleLoadBoxes(true); // Force refresh
};

// Handler for clearing all boxes
export const handleClearBoxes = (clearAllBoxes, setIsLoading, setError, setLastUpdateTime) => async () => {
  console.log('Starting clear all boxes operation.');
  setIsLoading(true);
  setError(null);
  try {
    await clearAllBoxes();
    console.log('All boxes cleared successfully.');
    setLastUpdateTime(new Date());
    // Clear the cache when all boxes are cleared
    boxCache = { data: null, timestamp: null };
    console.log('Box cache cleared.');
  } catch (err) {
    setError('Failed to clear boxes. Please try again.');
    console.error('Error clearing boxes:', err);
  } finally {
    setIsLoading(false);
    console.log('Clear all boxes operation completed.');
  }
};

// Function to add a new box
export const addBox = (newBox, existingBoxes, setBoxes) => {
  console.log('Adding new box:', newBox);
  if (validateBoxData(newBox)) {
    const updatedBoxes = [...existingBoxes, newBox];
    setBoxes(updatedBoxes);
    // Update cache
    boxCache = { data: updatedBoxes, timestamp: Date.now() };
    console.log('New box added successfully. Cache updated.');
  } else {
    console.error('Invalid box data:', newBox);
  }
};

// Function to update an existing box
export const updateBox = (boxId, updates, existingBoxes, setBoxes) => {
  console.log(`Updating box ${boxId} with:`, updates);
  const updatedBoxes = existingBoxes.map(box => 
    box.id === boxId ? { ...box, ...updates } : box
  );
  setBoxes(updatedBoxes);
  // Update cache
  boxCache = { data: updatedBoxes, timestamp: Date.now() };
  console.log(`Box ${boxId} updated successfully. Cache updated.`);
};

// Function to delete a box
export const deleteBox = (boxId, existingBoxes, setBoxes) => {
  console.log(`Deleting box ${boxId}`);
  const updatedBoxes = existingBoxes.filter(box => box.id !== boxId);
  setBoxes(updatedBoxes);
  // Update cache
  boxCache = { data: updatedBoxes, timestamp: Date.now() };
  console.log(`Box ${boxId} deleted successfully. Cache updated.`);
};

// Function to get a box by ID
export const getBoxById = (boxId, existingBoxes) => {
  console.log(`Fetching box with ID ${boxId}`);
  return existingBoxes.find(box => box.id === boxId);
};

// Function to filter boxes based on criteria
export const filterBoxes = (criteria, existingBoxes) => {
  console.log('Filtering boxes with criteria:', criteria);
  return existingBoxes.filter(box => {
    return Object.entries(criteria).every(([key, value]) => box[key] === value);
  });
};

// Add any additional data management functions as needed