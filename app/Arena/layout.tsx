'use client'

import React from 'react';
import ControlPanel from '../../components/ControlPanel/ControlPanel_Component';
import { useMapContext } from '../../contexts/MapContext';

export default function ArenaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { 
    mode, 
    switchMode, 
    isAttackModeAvailable, 
    isLoading, 
    openCreateBoxModal,
    reloadBoxes,
    clearAllBoxes,
    setLastUpdateTime
  } = useMapContext();

  return (
    <div className="arena-layout">
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
      />
      {children}
    </div>
  );
}