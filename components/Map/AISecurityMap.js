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
import ControlPanel from '../ControlPanel/ControlPanel_Component';
import LoadingOverlay from './LoadingOverlay';
import ErrorOverlay from './ErrorOverlay';
import BoxesInfoDisplay from './BoxesInfoDisplay';
import AttackGuidedTour from './AttackGuidedTour';
import AttackReplayControls from '../AttackReplay/AttackReplayControls';
import { useMediaQuery } from 'react-responsive';

const AISecurityMapContent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [isCreateBoxModalOpen, setIsCreateBoxModalOpen] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(null);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [isReplayControlsOpen, setIsReplayControlsOpen] = useState(false);
  const [forceExpand, setForceExpand] = useState(false);

  const isMobile = useMediaQuery({ maxWidth: 768 });

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
    mapPosition,
    mapZoom,
    handleMapPositionChange,
    handleMapZoomChange,
    switchMode,
    attackReplay,
  } = mapContext;

  // Event handlers
  const openCreateBoxModal = eventHandlers.handleOpenCreateBoxModal(setIsCreateBoxModalOpen);
  const closeCreateBoxModal = eventHandlers.handleCloseCreateBoxModal(setIsCreateBoxModalOpen);
  const createBox = eventHandlers.handleCreateBox(mapContext.addBox, MAP_SIZE, handleMapPositionChange, handleMapZoomChange, setIsCreateBoxModalOpen);
  const handleMiniMapPositionChange = eventHandlers.handleMiniMapPositionChange(handleMapPositionChange);
  const handleMiniMapZoomChange = eventHandlers.handleMiniMapZoomChange(handleMapZoomChange);

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

  const reloadBoxes = useCallback(() => {
    const currentPosition = mapPosition;
    dataManagement.handleReloadBoxes(loadBoxes, true)().then(() => {
      handleMapPositionChange(currentPosition);
      setForceExpand(true);
      setTimeout(() => setForceExpand(false), 100); // Reset forceExpand after a short delay
    });
  }, [loadBoxes, mapPosition, handleMapPositionChange]);

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

  const toggleReplayControls = () => {
    setIsReplayControlsOpen(!isReplayControlsOpen);
  };

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
          <div className={`absolute bottom-0 left-0 right-0 flex ${isMobile ? 'flex-col' : 'justify-between'} items-end p-4`}>
            {/* BoxesInfoDisplay - left bottom on desktop, top on mobile */}
            <div className={`pointer-events-auto ${isMobile ? 'mb-2 w-full' : ''}`}>
              <BoxesInfoDisplay 
                boxCount={boxes.length}
                lastUpdateTime={lastUpdateTime}
                currentTime={currentTime}
                forceExpand={forceExpand}
              />
            </div>
            
            {/* AttackReplayControls - center bottom on desktop, collapsible on mobile */}
            {isMobile ? (
              <div className="pointer-events-auto w-full mb-2">
                <button
                  onClick={toggleReplayControls}
                  className="w-full bg-gray-800 text-white py-2 px-4 rounded-md"
                >
                  {isReplayControlsOpen ? 'Hide Replay Controls' : 'Show Replay Controls'}
                </button>
                {isReplayControlsOpen && <AttackReplayControls />}
              </div>
            ) : (
              <div className="pointer-events-auto flex-grow mx-4 max-w-3xl z-50">
                <AttackReplayControls />
              </div>
            )}
            
            {/* MiniMap - right bottom on desktop, bottom on mobile */}
            <div className={`pointer-events-auto ${isMobile ? 'w-full' : ''}`}>
              <MiniMap 
                boxes={boxes} 
                mapSize={MAP_SIZE} 
                currentPosition={mapPosition}
                currentZoom={mapZoom}
                onPositionChange={handleMiniMapPositionChange}
                onZoomChange={handleMiniMapZoomChange}
                miniMapSize={isMobile ? 150 : 200}
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