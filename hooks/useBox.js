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
 * 6. Loading boxes from Firebase
 * 7. Updating box positions in Firebase after drag
 ****************************************************************************/

import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { constrainPosition, generateRandomPosition, isPositionValid } from '../utils/mapUtils';
import mapConfig from '../config/mapConfig';
import { db } from '../firebase-config';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';

const useBoxManager = (MAP_SIZE) => {
  const [boxes, setBoxes] = useState([]);
  const [connections, setConnections] = useState([]);

  const addBox = useCallback(async (type) => {
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
        createdAt: new Date().toISOString(),
        createdBy: 'User123', // Mock user ID, replace with actual user authentication later
      };

      try {
        const docRef = await addDoc(collection(db, 'boxes'), newBox);
        console.log('Box added with ID: ', docRef.id);
        
        setBoxes(prevBoxes => {
          const updatedBoxes = [...prevBoxes, { ...newBox, id: docRef.id }];
          updateConnections(updatedBoxes);
          return updatedBoxes;
        });
        return true; // Successfully added a box
      } catch (error) {
        console.error('Error adding box to Firestore: ', error);
        return false;
      }
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

  const updateBox = useCallback(async (updatedBox) => {
    try {
      const boxRef = doc(db, 'boxes', updatedBox.id);
      await updateDoc(boxRef, updatedBox);
      setBoxes(prevBoxes => prevBoxes.map(box => 
        box.id === updatedBox.id ? { ...box, ...updatedBox } : box
      ));
      console.log('Box updated in Firestore:', updatedBox.id);
    } catch (error) {
      console.error('Error updating box in Firestore:', error);
    }
  }, []);

  const updateBoxPosition = useCallback(async (id, x, y) => {
    console.log('updateBoxPosition called:', id, x, y);
    const [constrainedX, constrainedY] = constrainPosition(x, y, MAP_SIZE);
    console.log('Constrained position:', constrainedX, constrainedY);
    
    // Update local state immediately
    setBoxes(prevBoxes => prevBoxes.map(box => 
      box.id === id ? { ...box, x: constrainedX, y: constrainedY } : box
    ));

    // Update Firestore in the background
    try {
      const boxRef = doc(db, 'boxes', id);
      await updateDoc(boxRef, { x: constrainedX, y: constrainedY });
      console.log('Box position updated in Firestore:', id);
    } catch (error) {
      console.error('Error updating box position in Firestore:', error);
      // Optionally, revert the local state change if the Firestore update fails
      // setBoxes(prevBoxes => prevBoxes.map(box => 
      //   box.id === id ? { ...box, x: box.x, y: box.y } : box
      // ));
    }
  }, [MAP_SIZE]);

  const removeBox = useCallback(async (id) => {
    try {
      await deleteDoc(doc(db, 'boxes', id));
      setBoxes(prevBoxes => prevBoxes.filter(box => box.id !== id));
      setConnections(prevConnections => 
        prevConnections.filter(conn => conn.from !== id && conn.to !== id)
      );
      console.log('Box removed from Firestore:', id);
    } catch (error) {
      console.error('Error removing box from Firestore:', error);
    }
  }, []);

  const clearAllBoxes = useCallback(async () => {
    try {
      const batch = writeBatch(db);
      const querySnapshot = await getDocs(collection(db, 'boxes'));
      querySnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      setBoxes([]);
      setConnections([]);
      console.log('All boxes cleared from Firestore');
    } catch (error) {
      console.error('Error clearing all boxes from Firestore:', error);
      throw error;
    }
  }, []);

  const handleBoxDrag = useCallback((id, x, y) => {
    const halfWorldSize = (MAP_SIZE * mapConfig.worldSize) / 2;
    const constrainedX = Math.max(Math.min(x, halfWorldSize), -halfWorldSize);
    const constrainedY = Math.max(Math.min(y, halfWorldSize), -halfWorldSize);
    
    if (isPositionValid(constrainedX, constrainedY, MAP_SIZE, boxes.filter(box => box.id !== id), mapConfig.minBoxDistance)) {
      // Update local state immediately
      setBoxes(prevBoxes => prevBoxes.map(box => 
        box.id === id ? { ...box, x: constrainedX, y: constrainedY } : box
      ));

      // Update Firestore in the background
      updateBoxPosition(id, constrainedX, constrainedY);
    }
  }, [MAP_SIZE, updateBoxPosition, boxes]);

  const loadBoxesFromFirebase = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'boxes'));
      const loadedBoxes = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));
      setBoxes(loadedBoxes);
      updateConnections(loadedBoxes);
      console.log('Boxes loaded from Firebase:', loadedBoxes);
      return loadedBoxes;
    } catch (error) {
      console.error('Error loading boxes from Firestore:', error);
      throw error;
    }
  }, [updateConnections]);

  return { 
    boxes, 
    connections, 
    addBox, 
    updateBox, 
    updateBoxPosition,
    handleBoxDrag,
    removeBox, 
    clearAllBoxes,
    loadBoxesFromFirebase
  };
};

export default useBoxManager;