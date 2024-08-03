/****************************************************************************
 * components/Map/AISecurityMap.js
 * 
 * AI Security Map Main Component
 * 
 * This is the main component for the AI Security Map application. It orchestrates
 * the overall layout and functionality of the application, including the map canvas,
 * control panel, attack replay controls, and various overlays and modals.
 ****************************************************************************/

"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { MapProvider, useMapContext } from '../../contexts/MapContext';
import { useAuth } from '../../contexts/AuthContext';
import * as eventHandlers from './eventHandlers';
import * as dataManagement from './dataManagement';
import { formatLastUpdateTime } from './utils';
import { useUpdateTimeInterval } from '../../hooks/useUpdateTimeInterval';
import MiniMap from '../MiniMap/MiniMap_Component';
import ModalManager from '../Modals/ModalManager';
import CreateBoxModal from '../Modals/CreateBoxModal';
import MapCanvas from './MapCanvas';
import ControlPanel from '../Navbar/ControlPanel';
import LoadingOverlay from './LoadingOverlay';
import ErrorOverlay from './ErrorOverlay';
import BoxesInfoDisplay from './BoxesInfoDisplay';
import AttackGuidedTour from './AttackGuidedTour';
import AttackReplayControls from '../AttackReplay/AttackReplayControls';

const AISecurityMapContent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [isCreateBoxModalOpen, setIsCreateBoxModalOpen] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(null);
  const [isTimedOut, setIsTimedOut] = useState(false);

  const { user } = useAuth();
  const mapContext = useMapContext();
  const currentTime = useUpdateTimeInterval(lastUpdateTime);

  const {
    mode,
    boxes,
    selectedBox,
    targetBox,
    isAttackModeAvailable,
    isAttacking,
    isConfigOpen,
    isChallengeOpen,
    isAttackModalOpen,
    setIsConfigOpen,
    setIsChallengeOpen,
    setIsAttackModalOpen,
    updateBox,
    handleConfirmAttack,
    MAP_SIZE,
    mapControls,
    switchMode,
    attackReplay,
  } = mapContext;

  // Event handlers
  const openCreateBoxModal = eventHandlers.handleOpenCreateBoxModal(setIsCreateBoxModalOpen);
  const closeCreateBoxModal = eventHandlers.handleCloseCreateBoxModal(setIsCreateBoxModalOpen);
  const createBox = eventHandlers.handleCreateBox(mapContext.addBox, MAP_SIZE, mapContext.setMapPosition, mapContext.setMapZoom, setIsCreateBoxModalOpen);
  const handleMiniMapPositionChange = eventHandlers.handleMiniMapPositionChange(mapContext.setMapPosition);
  const handleMiniMapZoomChange = eventHandlers.handleMiniMapZoomChange(mapContext.setMapZoom);

  // Data management
  const loadBoxes = useCallback(
    dataManagement.handleLoadBoxes(
      mapContext.loadBoxesFromFirebase,
      setIsLoading,
      setError,
      setIsTimedOut,
      setLastUpdateTime,
      setLoadingTimeout
    ),
    [mapContext.loadBoxesFromFirebase]
  );

  const reloadBoxes = useCallback(() => dataManagement.handleReloadBoxes(loadBoxes)(), [loadBoxes]);
  const clearBoxes = useCallback(() => dataManagement.handleClearBoxes(mapContext.clearAllBoxes, setIsLoading, setError, setLastUpdateTime)(), [mapContext.clearAllBoxes]);
  const retryLoading = useCallback(() => eventHandlers.handleRetry(loadingTimeout, loadBoxes)(), [loadingTimeout, loadBoxes]);

  // Effects
  useEffect(() => {
    switchMode('preview');
  }, [switchMode]);

  useEffect(() => {
    if (mode === 'preview') {
      loadBoxes();
    }
  }, [mode, loadBoxes]);

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-900">
      <div className="flex-none">
        <ControlPanel
          mode={mode}
          switchMode={switchMode}
          openCreateBoxModal={openCreateBoxModal}
          reloadBoxes={reloadBoxes}
          clearAllBoxes={clearBoxes}
          isAttackModeAvailable={isAttackModeAvailable}
          isLoading={isLoading}
          setLastUpdateTime={setLastUpdateTime}
        />
      </div>
      <div className="flex-grow relative">
        <MapCanvas />
        <div className="absolute inset-0 pointer-events-none">
          {mode === 'attack' && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 pointer-events-auto">
              <AttackGuidedTour
                step={selectedBox && targetBox ? 2 : selectedBox ? 1 : 0}
                selectedBox={selectedBox}
                targetBox={targetBox}
                isAttacking={isAttacking}
              />
            </div>
          )}
          
          {/* Layout for bottom components */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between items-end p-4">
            {/* BoxesInfoDisplay - left bottom */}
            <div className="pointer-events-auto">
              <BoxesInfoDisplay 
                boxCount={boxes.length}
                lastUpdateTime={lastUpdateTime}
                currentTime={currentTime}
              />
            </div>
            
            {/* AttackReplayControls - center bottom */}
            <div className="pointer-events-auto flex-grow mx-4 max-w-3xl z-50">
              <AttackReplayControls />
            </div>
            
            {/* MiniMap - right bottom */}
            <div className="pointer-events-auto">
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
          </div>
        </div>
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
        onClose={closeCreateBoxModal}
        onCreateBox={createBox}
        mapSize={MAP_SIZE}
      />
      <LoadingOverlay 
        isLoading={isLoading} 
        boxCount={boxes.length} 
        lastUpdateTime={lastUpdateTime} 
      />
      <ErrorOverlay 
        error={error}
        isTimedOut={isTimedOut}
        onRetry={retryLoading}
      />
    </div>
  );
};

const AISecurityMap = () => (
  <MapProvider>
    <AISecurityMapContent />
  </MapProvider>
);

export default AISecurityMap;