import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { constrainPosition, generateRandomPosition } from '../utils/mapUtils';

const useBoxManager = (mapSize) => {
  const [boxes, setBoxes] = useState([]);
  const [connections, setConnections] = useState([]);

  const addBox = useCallback((type) => {
    const [x, y] = generateRandomPosition(mapSize);
    const newBox = {
      id: uuidv4(),
      x,
      y,
      type,
      challenge: 'New AI Challenge',
      difficulty: 'medium',
    };
    setBoxes(prevBoxes => {
      const updatedBoxes = [...prevBoxes, newBox];
      updateConnections(updatedBoxes);
      return updatedBoxes;
    });
  }, [mapSize]);

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
        const [constrainedX, constrainedY] = constrainPosition(x, y, mapSize);
        console.log('Constrained position:', constrainedX, constrainedY);
        return { ...box, x: constrainedX, y: constrainedY };
      }
      return box;
    }));
  }, [mapSize]);

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

  return { 
    boxes, 
    connections, 
    addBox, 
    updateBox, 
    updateBoxPosition, 
    removeBox, 
    clearAllBoxes 
  };
};

export default useBoxManager;