'use client'

import React from 'react';
import ControlPanel from '../../components/ControlPanel/ControlPanel_Component';
import { useMapContext } from '../../contexts/MapContext';
import { useMediaQuery } from 'react-responsive';

export default function ArenaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const { 
    mode, 
    switchMode, 
    isAttackModeAvailable, 
    isLoading, 
    openCreateBoxModal,
    reloadBoxes,
    clearAllBoxes,
    setLastUpdateTime,
    mapPosition,
    mapZoom,
    handleMapPositionChange,
    handleMapZoomChange,
    boxes,
    lastUpdateTime
  } = useMapContext();

  return (
    <div className="arena-layout flex flex-col h-screen">
      <div className="flex-shrink-0">
        <ControlPanel 
          mode={mode}
          switchMode={switchMode}
          openCreateBoxModal={openCreateBoxModal}
          reloadBoxes={reloadBoxes}
          clearAllBoxes={clearAllBoxes}
          isAttackModeAvailable={isAttackModeAvailable}
          isLoading={isLoading}
          setLastUpdateTime={setLastUpdateTime}
          onBoxCreated={reloadBoxes}
          mapPosition={mapPosition}
          mapZoom={mapZoom}
          onMapPositionChange={handleMapPositionChange}
          onMapZoomChange={handleMapZoomChange}
          boxCount={boxes.length}
          lastUpdateTime={lastUpdateTime}
        />
      </div>
      <div className={`flex-grow ${isMobile ? 'h-[calc(100vh-64px)]' : ''}`}>
        {children}
      </div>
    </div>
  );
}