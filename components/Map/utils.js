/****************************************************************************
 * components/Map/utils.js
 * 
 * Utility Functions for AI Security Map
 * 
 * This file contains various utility functions used throughout the
 * AI Security Map application. These functions handle common tasks
 * such as formatting, calculations, and data transformations.
 ****************************************************************************/

// Format the last update time
export const formatLastUpdateTime = (lastUpdateTime, currentTime) => {
    if (!lastUpdateTime) return 'Never';
    const diffInSeconds = Math.floor((currentTime - lastUpdateTime) / 1000);
    if (diffInSeconds < 0) return 'Just now';
    if (diffInSeconds < 60) {
      return `${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''} ago`;
    }
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    }
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    }
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  };
  
  // Calculate distance between two points
  export const calculateDistance = (x1, y1, x2, y2) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  };
  
  // Generate a random color
  export const generateRandomColor = () => {
    return '#' + Math.floor(Math.random()*16777215).toString(16);
  };
  
  // Clamp a number between a minimum and maximum value
  export const clamp = (num, min, max) => {
    return Math.min(Math.max(num, min), max);
  };
  
  // Convert degrees to radians
  export const degreesToRadians = (degrees) => {
    return degrees * (Math.PI / 180);
  };
  
  // Convert radians to degrees
  export const radiansToDegrees = (radians) => {
    return radians * (180 / Math.PI);
  };
  
  // Generate a unique ID
  export const generateUniqueId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };
  
  // Debounce function to limit the rate at which a function can fire
  export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };
  
  // Throttle function to limit the rate at which a function can fire
  export const throttle = (func, limit) => {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  };
  
  // Deep clone an object
  export const deepClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
  };
  
  // Check if two objects are equal
  export const isEqual = (obj1, obj2) => {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  };
  
  // Format a number with commas for thousands
  export const formatNumberWithCommas = (x) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  // Capitalize the first letter of a string
  export const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };
  
  // Convert a hex color to RGB
  export const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };
  
  // Add any additional utility functions as needed