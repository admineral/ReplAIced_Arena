/****************************************************************************
 * hooks/useBox.js
 * 
 * Box Management Hook
 * 
 * This custom hook manages the state and operations for boxes (nodes) in the 
 * AI Security Map. It handles box creation, updating, positioning, and connections.
 * 
 * Context:
 * - Part of the AI Security Map application
 * - Used in conjunction with MapContext and other custom hooks
 * 
 * Global State:
 * - boxes: Array of box objects representing nodes on the map
 * - connections: Array of connection objects between boxes
 * 
 * Key Functionalities:
 * 1. Adding new boxes with random positions and collision checking
 * 2. Updating box properties and positions
 * 3. Managing connections between boxes
 * 4. Handling box dragging within map boundaries
 * 5. Removing boxes and clearing all boxes
 ****************************************************************************/

import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { constrainPosition, generateRandomPosition, isPositionValid } from '../utils/mapUtils';
import mapConfig from '../config/mapConfig';

const useBoxManager = (MAP_SIZE) => {
  const [boxes, setBoxes] = useState([]);
  const [connections, setConnections] = useState([]);

  const addBox = useCallback((type) => {
    let attempts = 0;
    let position;
    do {
      position = generateRandomPosition(MAP_SIZE);
      attempts++;
    } while (!isPositionValid(position[0], position[1], MAP_SIZE, boxes, mapConfig.minBoxDistance) && attempts < 100);

    if (attempts < 100) {
      const newBox = {
        id: uuidv4(),
        x: position[0],
        y: position[1],
        type,
        challenge: 'New AI Challenge',
        difficulty: 'medium',
      };
      setBoxes(prevBoxes => {
        const updatedBoxes = [...prevBoxes, newBox];
        updateConnections(updatedBoxes);
        return updatedBoxes;
      });
      return true; // Successfully added a box
    } else {
      console.error('Failed to find a valid position for new box');
      return false; // Failed to add a box
    }
  }, [MAP_SIZE, boxes]);

  const updateConnections = useCallback((updatedBoxes) => {
    const newConnections = updatedBoxes.map((box, index) => ({
      from: box.id,
      to: index < updatedBoxes.length - 1 ? updatedBoxes[index + 1].id : null
    })).filter(conn => conn.to !== null);
    setConnections(newConnections);
  }, []);

  const updateBox = useCallback((updatedBox) => {
    setBoxes(prevBoxes => prevBoxes.map(box => 
      box.id === updatedBox.id ? { ...box, ...updatedBox } : box
    ));
  }, []);

  const updateBoxPosition = useCallback((id, x, y) => {
    console.log('updateBoxPosition called:', id, x, y);
    setBoxes(prevBoxes => prevBoxes.map(box => {
      if (box.id === id) {
        const [constrainedX, constrainedY] = constrainPosition(x, y, MAP_SIZE);
        console.log('Constrained position:', constrainedX, constrainedY);
        return { ...box, x: constrainedX, y: constrainedY };
      }
      return box;
    }));
  }, [MAP_SIZE]);

  const removeBox = useCallback((id) => {
    setBoxes(prevBoxes => prevBoxes.filter(box => box.id !== id));
    setConnections(prevConnections => 
      prevConnections.filter(conn => conn.from !== id && conn.to !== id)
    );
  }, []);

  const clearAllBoxes = useCallback(() => {
    setBoxes([]);
    setConnections([]);
  }, []);

  const handleBoxDrag = useCallback((id, x, y) => {
    const halfWorldSize = (MAP_SIZE * mapConfig.worldSize) / 2;
    const constrainedX = Math.max(Math.min(x, halfWorldSize), -halfWorldSize);
    const constrainedY = Math.max(Math.min(y, halfWorldSize), -halfWorldSize);
    
    // Check if the new position is valid (not too close to other boxes)
    if (isPositionValid(constrainedX, constrainedY, MAP_SIZE, boxes.filter(box => box.id !== id), mapConfig.minBoxDistance)) {
      updateBoxPosition(id, constrainedX, constrainedY);
    }
  }, [MAP_SIZE, updateBoxPosition, boxes]);

  return { 
    boxes, 
    connections, 
    addBox, 
    updateBox, 
    updateBoxPosition,
    handleBoxDrag,
    removeBox, 
    clearAllBoxes 
  };
};

export default useBoxManager;