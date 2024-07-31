/****************************************************************************
 * utils/mapUtils.js
 * 
 * Map Utility Functions for AI Security Map
 * 
 * This file contains utility functions for various map-related operations
 * in the AI Security Map application. These functions handle position
 * calculations, constraints, and validations.
 * 
 * Key Functions:
 * 1. constrainPosition: Ensures a position is within the map boundaries
 * 2. generateRandomPosition: Creates a random position within the map
 * 3. calculateDistance: Computes the distance between two points
 * 4. normalizePosition: Converts map coordinates to normalized [0,1] range
 * 5. denormalizePosition: Converts normalized coordinates back to map coordinates
 * 6. isPositionValid: Checks if a position is valid (within bounds and not too close to others)
 * 
 * Usage:
 * These functions are used throughout the application for managing box positions,
 * ensuring map boundaries are respected, and handling various map-related calculations.
 * 
 * Note: All functions assume a centered coordinate system where (0,0) is the center of the map,
 * and mapSize represents the total width/height of the map.
 ****************************************************************************/




export const constrainPosition = (x, y, mapSize) => {
    const halfSize = mapSize / 2;
    const constrainedX = Math.max(Math.min(x, halfSize), -halfSize);
    const constrainedY = Math.max(Math.min(y, halfSize), -halfSize);
    return [constrainedX, constrainedY];
  };
  
  export const generateRandomPosition = (mapSize) => {
    return [
      (Math.random() * mapSize - mapSize / 2) * 0.9,
      (Math.random() * mapSize - mapSize / 2) * 0.9
    ];
  };
  
  export const calculateDistance = (x1, y1, x2, y2) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  };
  
  export const normalizePosition = (x, y, mapSize) => {
    return [
      (x + mapSize / 2) / mapSize,
      (y + mapSize / 2) / mapSize
    ];
  };
  
  export const denormalizePosition = (normalizedX, normalizedY, mapSize) => {
    return [
      (normalizedX * mapSize) - mapSize / 2,
      (normalizedY * mapSize) - mapSize / 2
    ];
  };
  
  export const isPositionValid = (x, y, mapSize, existingBoxes, minDistance = 2) => {
    const [constrainedX, constrainedY] = constrainPosition(x, y, mapSize);
    
    // Check if the position is within the map bounds
    if (constrainedX !== x || constrainedY !== y) {
      return false;
    }
  
    // Check if the position is too close to existing boxes
    for (const box of existingBoxes) {
      const distance = calculateDistance(x, y, box.x, box.y);
      if (distance < minDistance) {
        return false;
      }
    }
  
    return true;
  };