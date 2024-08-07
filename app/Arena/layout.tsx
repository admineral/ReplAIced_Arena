'use client'

import React, { useState } from 'react';
import ControlPanel from '../../components/ControlPanel/ControlPanel_Component';

export default function ArenaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mode, setMode] = useState('preview');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date());

  const switchMode = (newMode: string) => setMode(newMode);
  const openCreateBoxModal = () => {/* Implement this function */};
  const reloadBoxes = () => {/* Implement this function */};
  const clearAllBoxes = () => {/* Implement this function */};

  return (
    <div className="arena-layout">
      <ControlPanel 
        mode={mode}
        switchMode={switchMode}
        openCreateBoxModal={openCreateBoxModal}
        reloadBoxes={reloadBoxes}
        clearAllBoxes={clearAllBoxes}
        isAttackModeAvailable={true}
        isLoading={isLoading}
        setLastUpdateTime={setLastUpdateTime}
      />
      {children}
    </div>
  );
}