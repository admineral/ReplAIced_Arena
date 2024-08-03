/****************************************************************************
 * contexts/MapContext.js
 * 
 * Map Context Provider
 * 
 * This file defines the central context for the AI Security Map application.
 * It combines various custom hooks and manages the overall state and logic
 * for the map, boxes, attacks, user interactions, and authentication.
 * 
 * Context:
 * - Core component of the AI Security Map application
 * - Integrates useBoxManager, useAttackManager, and useMapControls hooks
 * 
 * Global State:
 * - mode: Current application mode (create, preview, attack)
 * - boxes: Array of box objects representing nodes on the map
 * - connections: Array of connection objects between boxes
 * - selectedBox: Currently selected box for attack or configuration
 * - targetBox: Target box for attack
 * - mapControls: Position and zoom state for map navigation
 * - user: Current authenticated user (null if not logged in)
 * 
 * Key Functionalities:
 * 1. Managing application mode and UI states
 * 2. Handling box interactions (click, double-click, drag)
 * 3. Coordinating attack initiation and confirmation
 * 4. Providing context values for child components
 * 5. Responsive map size calculation based on screen size
 * 6. User authentication state management
 ****************************************************************************/
import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import useBoxManager from '../hooks/useBox';
import useAttackManager from '../hooks/useAttack';
import { useMapControls } from '../hooks/useMapControls';
import mapConfig from '../config/mapConfig';
import { auth } from '../firebase-config';
import { onAuthStateChanged } from 'firebase/auth';
import useAttackReplay from '../hooks/useAttackReplay';
import { saveAttack } from '../services/firestore';

const MapContext = createContext();

const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return screenSize;
};

export const MapProvider = ({ children }) => {
  const screenSize = useScreenSize();
  const [user, setUser] = useState(null);

  const MAP_SIZE = useMemo(() => {
    const aspectRatio = screenSize.width / screenSize.height;
    return aspectRatio > 1 ? mapConfig.mapSize * aspectRatio : mapConfig.mapSize;
  }, [screenSize.width, screenSize.height]);

  const [mode, setMode] = useState('create');
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isChallengeOpen, setIsChallengeOpen] = useState(false);
  const [isAttackModalOpen, setIsAttackModalOpen] = useState(false);
  const [replayDate, setReplayDate] = useState(new Date());
  const attackReplay = useAttackReplay(replayDate);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = useCallback(() => {
    console.log('User logged in');
  }, []);

  const handleLogout = useCallback(() => {
    console.log('User logged out');
  }, []);

  const boxManager = useBoxManager(MAP_SIZE);
  const { 
    boxes, 
    connections, 
    addBox, 
    updateBox, 
    updateBoxPosition, 
    handleBoxDrag, 
    loadBoxesFromFirebase,
    clearAllBoxes
  } = boxManager;

  const attackManager = useAttackManager(boxes, mode, setMode);
  const { 
    selectedBox, 
    targetBox, 
    isAttacking, 
    isAttackModeAvailable, 
    initiateAttack, 
    startAttackAnimation,
    confirmAttack 
  } = attackManager;

  const mapControls = useMapControls();

  const handleBoxClick = useCallback((boxId) => {
    console.log('handleBoxClick called:', boxId);
    const box = boxes.find(b => b.id === boxId);
    if (box) {
      if (mode === 'preview') {
        initiateAttack(box);
        setIsChallengeOpen(true);
      } else if (mode === 'attack') {
        if (!selectedBox) {
          initiateAttack(box);
        } else if (selectedBox.id !== box.id) {
          initiateAttack(selectedBox, box);
          setIsAttackModalOpen(true);
        } else {
          initiateAttack(null);
        }
      } else if (mode === 'create') {
        initiateAttack(box.id === selectedBox?.id ? null : box);
      }
    }
  }, [mode, selectedBox, boxes, initiateAttack, setIsChallengeOpen, setIsAttackModalOpen]);

  const handleBoxDoubleClick = useCallback((boxId) => {
    console.log('handleBoxDoubleClick called:', boxId);
    if (mode === 'create') {
      const box = boxes.find(b => b.id === boxId);
      if (box) {
        initiateAttack(box);
        setIsConfigOpen(true);
      }
    }
  }, [mode, boxes, initiateAttack, setIsConfigOpen]);

  const switchMode = useCallback((newMode) => {
    console.log('Switching mode to:', newMode);
    if (newMode === 'attack' && !isAttackModeAvailable) {
      return;
    }
    setMode(newMode);
    initiateAttack(null);
  }, [isAttackModeAvailable, initiateAttack, setMode]);

  const handleConfirmAttack = useCallback(async () => {
    console.log('handleConfirmAttack called');
    setIsAttackModalOpen(false);
    startAttackAnimation();
    
    const attackData = {
      attackerId: selectedBox.id,
      targetId: targetBox.id,
      timestamp: Date.now(),
    };
    
    try {
      await saveAttack(attackData);
      console.log('Attack saved to Firestore');
    } catch (error) {
      console.error('Error saving attack to Firestore:', error);
    }

    setTimeout(() => {
      confirmAttack();
    }, 5000); // Adjust this timeout to match your animation duration
  }, [confirmAttack, setIsAttackModalOpen, startAttackAnimation, selectedBox, targetBox]);

  const setMapPosition = useCallback((newPosition) => {
    console.log('MapContext: Setting map position to:', newPosition);
    mapControls.setPosition(newPosition);
    // Force a re-render of components that depend on map position
    setMode(prevMode => {
      console.log('MapContext: Forcing re-render, current mode:', prevMode);
      return prevMode;
    });
  }, [mapControls, setMode]);

  const setMapZoom = useCallback((newZoom) => {
    mapControls.setZoom(newZoom);
  }, [mapControls]);

  useEffect(() => {
    console.log('MapContext: Map position changed:', mapControls.position);
  }, [mapControls.position]);

  const contextValue = {
    MAP_SIZE,
    mode,
    setMode,
    isConfigOpen,
    setIsConfigOpen,
    isChallengeOpen,
    setIsChallengeOpen,
    isAttackModalOpen,
    setIsAttackModalOpen,
    isAttacking,
    boxes,
    connections,
    selectedBox,
    targetBox,
    addBox,
    updateBox,
    handleBoxClick,
    handleBoxDoubleClick,
    handleBoxDrag,
    switchMode,
    handleConfirmAttack,
    isAttackModeAvailable,
    startAttackAnimation,
    mapControls,
    setMapPosition,
    setMapZoom,
    loadBoxesFromFirebase,
    clearAllBoxes,
    user,
    handleLogin,
    handleLogout,
    attackReplay,
    setReplayDate
  };

  return (
    <MapContext.Provider value={contextValue}>
      {children}
    </MapContext.Provider>
  );
};

export const useMapContext = () => useContext(MapContext);