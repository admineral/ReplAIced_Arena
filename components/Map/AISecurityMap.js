/****************************************************************************
 * components/Map/AISecurityMap.js
 * 
 * AI Security Map Main Component
 * 
 * This is the main component for the AI Security Map application. It orchestrates
 * the layout and interaction between various sub-components, managing the overall
 * structure and state of the application.
 * 
 * Context:
 * - Root component of the AI Security Map application
 * - Utilizes the MapProvider for global state management
 * - Client-side rendered component ("use client" directive)
 * 
 * Key Components:
 * 1. MapCanvas: Main 3D rendering area for nodes and connections
 * 2. ControlPanel: UI for mode switching and box addition
 * 3. MiniMap: Small overview map of all nodes with interactive features
 * 4. ModalManager: Handles various modal dialogs (config, challenge, attack)
 * 5. CreateBoxModal: New modal for creating boxes with advanced options
 * 
 * Key Functionalities:
 * 1. Rendering the main application layout
 * 2. Managing application modes (create, preview, attack)
 * 3. Handling box additions and interactions
 * 4. Displaying tooltips and attack buttons
 * 5. Coordinating modal dialogs for various actions
 * 6. Managing MiniMap interactions and main map updates
 * 7. Loading boxes from Firebase in preview mode
 * 8. Clearing all boxes
 * 9. Displaying the number of loaded boxes
 * 10. Tracking and displaying the last update time
 * 11. Opening and managing the CreateBoxModal for new box creation
 * 
 * Note: This component heavily relies on the MapContext for state management.
 * Ensure that all required context values are properly provided by the MapProvider.
 ****************************************************************************/

"use client"

import React, { useState, useEffect, useCallback } from 'react';
import MiniMap from '../MiniMap/MiniMap_Component';
import ModalManager from '../Modals/ModalManager';
import CreateBoxModal from '../Modals/CreateBoxModal';
import MapCanvas from './MapCanvas';
import ControlPanel from '../Navbar/ControlPanel';
import { MapProvider, useMapContext } from '../../contexts/MapContext';
import { useAuth } from '../../contexts/AuthContext';

const AISecurityMapContent = () => {
  const [initialMode, setInitialMode] = useState('preview');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [isCreateBoxModalOpen, setIsCreateBoxModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loadingTimeout, setLoadingTimeout] = useState(null);
  const [isTimedOut, setIsTimedOut] = useState(false);

  const { user } = useAuth();

  const {
    mode,
    boxes,
    connections,
    selectedBox,
    targetBox,
    isAttacking,
    isAttackModeAvailable,
    tooltip,
    isConfigOpen,
    isChallengeOpen,
    isAttackModalOpen,
    setIsConfigOpen,
    setIsChallengeOpen,
    setIsAttackModalOpen,
    addBox,
    updateBox,
    handleBoxClick,
    handleBoxDoubleClick,
    handleBoxDrag,
    switchMode,
    handleAttack,
    handleConfirmAttack,
    MAP_SIZE,
    mapControls,
    setMapPosition,
    setMapZoom,
    loadBoxesFromFirebase,
    clearAllBoxes
  } = useMapContext();

  useEffect(() => {
    switchMode(initialMode);
  }, [initialMode, switchMode]);

  const handleOpenCreateBoxModal = useCallback(() => {
    setIsCreateBoxModalOpen(true);
  }, []);

  const handleCloseCreateBoxModal = useCallback(() => {
    setIsCreateBoxModalOpen(false);
  }, []);

  const handleCreateBox = useCallback((newBoxData) => {
    const centerX = MAP_SIZE / 2;
    const centerY = MAP_SIZE / 2;
    const radius = MAP_SIZE / 4; // This will place boxes within a quarter of the map size from the center
  
    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.random() * radius;
  
    const x = centerX + distance * Math.cos(angle);
    const y = centerY + distance * Math.sin(angle);
  
    const boxWithPosition = {
      ...newBoxData,
      x: x,
      y: y
    };
  
    addBox(boxWithPosition);
  
    // Center the view on the new box
    setMapPosition({ x: x, y: y });
  
    // Set a specific zoom level (adjust as needed)
    const newZoomLevel = 2; // This will zoom in closer to the new box
    setMapZoom(newZoomLevel);
  
    setIsCreateBoxModalOpen(false);
  }, [addBox, MAP_SIZE, setMapPosition, setMapZoom]);

  const handleMiniMapPositionChange = useCallback((newPosition) => {
    setMapPosition(newPosition);
  }, [setMapPosition]);

  const handleMiniMapZoomChange = useCallback((newZoom) => {
    setMapZoom(newZoom);
  }, [setMapZoom]);

  const validateBoxData = (boxData) => {
    const requiredFields = ['x', 'y', 'type', 'id', 'challenge', 'difficulty', 'createdAt', 'createdBy', 'model', 'systemPrompt', 'secretWord'];
    return requiredFields.every(field => field in boxData);
  };

  const handleLoadBoxes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setIsTimedOut(false);

    const timeoutId = setTimeout(() => {
      setIsTimedOut(true);
      setIsLoading(false);
      setError('Loading timed out. Please try again.');
    }, 10000); // 10 seconds timeout

    setLoadingTimeout(timeoutId);

    try {
      const loadedBoxes = await loadBoxesFromFirebase();
      const validBoxes = loadedBoxes.filter(validateBoxData);
      if (validBoxes.length !== loadedBoxes.length) {
        console.warn(`${loadedBoxes.length - validBoxes.length} boxes were invalid and filtered out.`);
      }
      console.log(`Successfully loaded ${validBoxes.length} boxes.`);
      setLastUpdateTime(new Date());
      clearTimeout(timeoutId);
    } catch (err) {
      setError('Failed to load boxes. Please try again.');
      console.error('Error loading boxes:', err);
    } finally {
      setIsLoading(false);
      clearTimeout(timeoutId);
    }
  }, [loadBoxesFromFirebase]);

  const handleRetry = useCallback(() => {
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
    }
    handleLoadBoxes();
  }, [handleLoadBoxes, loadingTimeout]);

  const handleReloadBoxes = useCallback(async () => {
    await handleLoadBoxes();
  }, [handleLoadBoxes]);

  const handleClearBoxes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await clearAllBoxes();
      console.log('All boxes cleared.');
      setLastUpdateTime(new Date());
    } catch (err) {
      setError('Failed to clear boxes. Please try again.');
      console.error('Error clearing boxes:', err);
    } finally {
      setIsLoading(false);
    }
  }, [clearAllBoxes]);

  useEffect(() => {
    if (mode === 'preview') {
      handleLoadBoxes();
    }
  }, [mode, handleLoadBoxes]);

  const formatLastUpdateTime = () => {
    if (!lastUpdateTime) return 'Never';
    const diffInSeconds = Math.floor((currentTime - lastUpdateTime) / 1000);
    if (diffInSeconds < 0) return 'Just now';
    if (diffInSeconds < 60) {
      return (
        <span>
          <span className="tabular-nums inline-block w-8 text-right">{diffInSeconds}</span> seconds ago
        </span>
      );
    }
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    return (
      <span>
        <span className="tabular-nums inline-block w-8 text-right">{diffInMinutes}</span> minute{diffInMinutes !== 1 ? 's' : ''} ago
      </span>
    );
  };

  useEffect(() => {
    let interval;
    if (lastUpdateTime) {
      interval = setInterval(() => setCurrentTime(new Date()), 1000);
    }
    return () => clearInterval(interval);
  }, [lastUpdateTime]);

  return (
    <div className="w-screen h-screen relative bg-gray-900">
      <div className="absolute inset-0">
        <MapCanvas />
      </div>
      <div className="absolute inset-0 pointer-events-none">
        <div className="pointer-events-auto">
          <ControlPanel
            mode={mode}
            switchMode={switchMode}
            openCreateBoxModal={handleOpenCreateBoxModal}
            reloadBoxes={handleReloadBoxes}
            clearAllBoxes={handleClearBoxes}
            isAttackModeAvailable={isAttackModeAvailable}
            isLoading={isLoading}
            setLastUpdateTime={setLastUpdateTime}
          />
        </div>
        <div className="absolute bottom-4 right-4 z-10 pointer-events-auto">
          <MiniMap 
            boxes={boxes} 
            mapSize={MAP_SIZE} 
            currentPosition={mapControls.position}
            currentZoom={mapControls.zoom}
            onPositionChange={handleMiniMapPositionChange}
            onZoomChange={handleMiniMapZoomChange}
            miniMapSize={200}
            miniMapZoom={1.5}
            boxSize={4}
            padding={8}
            backgroundColor="rgba(0, 0, 0, 0.7)"
            borderColor="#4a5568"
            viewRectColor="#ffd700"
          />
        </div>
        {mode === 'attack' && selectedBox && targetBox && (
          <button
            onClick={handleAttack}
            className="absolute top-20 left-4 bg-red-500 text-white rounded-full px-4 py-2 shadow-lg hover:bg-red-600 transition-colors duration-300 pointer-events-auto"
          >
            Attack
          </button>
        )}
        {tooltip && (
          <div className="absolute bottom-4 left-4 bg-gray-800 text-white p-2 rounded-lg pointer-events-auto">
            {tooltip}
          </div>
        )}
      </div>
      <ModalManager
        isConfigOpen={isConfigOpen}
        isChallengeOpen={isChallengeOpen}
        isAttackModalOpen={isAttackModalOpen}
        selectedBox={selectedBox}
        targetBox={targetBox}
        onConfigUpdate={updateBox}
        onAttackConfirm={handleConfirmAttack}
        setIsConfigOpen={setIsConfigOpen}
        setIsChallengeOpen={setIsChallengeOpen}
        setIsAttackModalOpen={setIsAttackModalOpen}
      />
      <CreateBoxModal
        isOpen={isCreateBoxModalOpen}
        onClose={handleCloseCreateBoxModal}
        onCreateBox={handleCreateBox}
        mapSize={MAP_SIZE}
      />
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-white text-2xl">Loading...</div>
        </div>
      )}
      {(error || isTimedOut) && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-4 rounded-lg text-white">
            <p className="mb-4">{error || 'Loading timed out. Please try again.'}</p>
            <button
              onClick={handleRetry}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Retry
            </button>
          </div>
        </div>
      )}
      <div className="absolute bottom-4 left-4 flex space-x-4">
        <div className="bg-gray-800 text-white p-2 rounded-lg">
          Loaded Boxes: {boxes.length}
        </div>
        <div className="bg-gray-800 text-white p-2 rounded-lg whitespace-nowrap">
          Last Updated: {formatLastUpdateTime()}
        </div>
      </div>
    </div>
  );
};

const AISecurityMap = () => (
  <MapProvider>
    <AISecurityMapContent />
  </MapProvider>
);

export default AISecurityMap;