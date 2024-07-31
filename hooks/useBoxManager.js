import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

const MAP_SIZE = 10;

const useBoxManager = () => {
  const [boxes, setBoxes] = useState([]);
  const [connections, setConnections] = useState([]);

  const addBox = useCallback((type) => {
    const newBox = {
      id: uuidv4(),
      x: (Math.random() * MAP_SIZE - MAP_SIZE / 2) * 0.9,
      y: (Math.random() * MAP_SIZE - MAP_SIZE / 2) * 0.9,
      type,
      challenge: 'New AI Challenge',
      difficulty: 'medium',
    };
    setBoxes(prevBoxes => {
      const updatedBoxes = [...prevBoxes, newBox];
      updateConnections(updatedBoxes);
      return updatedBoxes;
    });
  }, []);

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
    setBoxes(prevBoxes => prevBoxes.map(box => {
      if (box.id === id) {
        const constrainedX = Math.max(Math.min(x, MAP_SIZE / 2), -MAP_SIZE / 2);
        const constrainedY = Math.max(Math.min(y, MAP_SIZE / 2), -MAP_SIZE / 2);
        return { ...box, x: constrainedX, y: constrainedY };
      }
      return box;
    }));
  }, []);

  return { boxes, connections, addBox, updateBox, updateBoxPosition };
};

export default useBoxManager;