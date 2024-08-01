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
 * 
 * Note: This component heavily relies on the MapContext for state management.
 * Ensure that all required context values are properly provided by the MapProvider.
 ****************************************************************************/

"use client"

import React, { useState, useEffect, useCallback } from 'react';
import MiniMap from '../MiniMap/MiniMap_Component';
import ModalManager from '../Modals/ModalManager';
import MapCanvas from './MapCanvas';
import ControlPanel from '../Navbar/ControlPanel';
import { MapProvider, useMapContext } from '../../contexts/MapContext';

const AISecurityMapContent = () => {
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

  const [selectedModel, setSelectedModel] = useState('default');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAddBox = useCallback(() => {
    addBox(selectedModel);
  }, [addBox, selectedModel]);

  const handleMiniMapPositionChange = useCallback((newPosition) => {
    setMapPosition(newPosition);
  }, [setMapPosition]);

  const handleMiniMapZoomChange = useCallback((newZoom) => {
    setMapZoom(newZoom);
  }, [setMapZoom]);

  const validateBoxData = (boxData) => {
    const requiredFields = ['x', 'y', 'type', 'id', 'challenge', 'difficulty', 'createdAt', 'createdBy'];
    return requiredFields.every(field => field in boxData);
  };

  const handleLoadBoxes = useCallback(async () => {
    if (mode === 'preview') {
      setIsLoading(true);
      setError(null);
      try {
        const loadedBoxes = await loadBoxesFromFirebase();
        const validBoxes = loadedBoxes.filter(validateBoxData);
        if (validBoxes.length !== loadedBoxes.length) {
          console.warn(`${loadedBoxes.length - validBoxes.length} boxes were invalid and filtered out.`);
        }
        console.log(`Successfully loaded ${validBoxes.length} boxes.`);
      } catch (err) {
        setError('Failed to load boxes. Please try again.');
        console.error('Error loading boxes:', err);
      } finally {
        setIsLoading(false);
      }
    }
  }, [mode, loadBoxesFromFirebase]);

  const handleClearBoxes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await clearAllBoxes();
      console.log('All boxes cleared.');
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
            addBox={handleAddBox}
            isAttackModeAvailable={isAttackModeAvailable}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            onLoadBoxes={handleLoadBoxes}
            isLoading={isLoading}
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
      <div className="absolute top-20 right-4 z-10 pointer-events-auto">
        <button
          onClick={handleClearBoxes}
          className="bg-red-500 text-white rounded-full px-4 py-2 shadow-lg hover:bg-red-600 transition-colors duration-300"
        >
          Clear All Boxes
        </button>
      </div>
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-white text-2xl">Loading...</div>
        </div>
      )}
      {error && (
        <div className="absolute bottom-4 left-4 bg-red-500 text-white p-2 rounded-lg pointer-events-auto">
          {error}
        </div>
      )}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white p-2 rounded-lg">
        Loaded Boxes: {boxes.length}
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