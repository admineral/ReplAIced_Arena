import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import useBoxManager from '../hooks/useBox';
import useAttackManager from '../hooks/useAttack';
import { useMapControls } from '../hooks/useMapControls';
import mapConfig from '../config/mapConfig';

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

  const MAP_SIZE = useMemo(() => {
    const aspectRatio = screenSize.width / screenSize.height;
    return aspectRatio > 1 ? mapConfig.mapSize * aspectRatio : mapConfig.mapSize;
  }, [screenSize.width, screenSize.height]);

  const [mode, setMode] = useState('create');
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isChallengeOpen, setIsChallengeOpen] = useState(false);
  const [isAttackModalOpen, setIsAttackModalOpen] = useState(false);
  const [tooltip, setTooltip] = useState('');

  const boxManager = useBoxManager(MAP_SIZE);
  const { boxes, connections, addBox, updateBox, updateBoxPosition } = boxManager;

  const attackManager = useAttackManager(boxes, mode, setMode, setTooltip);
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
          setTooltip('Now select a target node to attack');
        } else if (selectedBox.id !== box.id) {
          initiateAttack(selectedBox, box);
          setTooltip('Click the Attack button to initiate');
        } else {
          initiateAttack(null);
          setTooltip('Select a node to start the attack');
        }
      } else if (mode === 'create') {
        initiateAttack(box.id === selectedBox?.id ? null : box);
      }
    }
  }, [mode, selectedBox, boxes, initiateAttack, setTooltip, setIsChallengeOpen]);

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

  const handleDrag = useCallback((id, x, y) => {
    console.log('handleDrag called:', id, x, y);
    updateBoxPosition(id, x, y);
  }, [updateBoxPosition]);

  const switchMode = useCallback((newMode) => {
    console.log('Switching mode to:', newMode);
    if (newMode === 'attack' && !isAttackModeAvailable) {
      setTooltip('You need at least 2 boxes to enable attack mode. Add another box.');
      return;
    }
    setMode(newMode);
    initiateAttack(null);
    setTooltip(newMode === 'attack' ? 'Select a node to start the attack' : '');
  }, [isAttackModeAvailable, initiateAttack, setMode, setTooltip]);

  const handleAttack = useCallback(() => {
    console.log('handleAttack called');
    if (selectedBox && targetBox) {
      setIsAttackModalOpen(true);
    }
  }, [selectedBox, targetBox, setIsAttackModalOpen]);

  const handleConfirmAttack = useCallback(() => {
    console.log('handleConfirmAttack called');
    setIsAttackModalOpen(false);
    startAttackAnimation();
    setTimeout(() => {
      confirmAttack();
      setTooltip('Select a node to start a new attack');
    }, 5000); // Adjust this timeout to match your animation duration
  }, [confirmAttack, setIsAttackModalOpen, setTooltip, startAttackAnimation]);

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
    tooltip,
    setTooltip,
    isAttacking,
    boxes,
    connections,
    selectedBox,
    targetBox,
    addBox,
    updateBox,
    handleBoxClick,
    handleBoxDoubleClick,
    handleDrag,
    switchMode,
    handleAttack,
    handleConfirmAttack,
    isAttackModeAvailable,
    startAttackAnimation,
    mapControls
  };

  return (
    <MapContext.Provider value={contextValue}>
      {children}
    </MapContext.Provider>
  );
};

export const useMapContext = () => useContext(MapContext);