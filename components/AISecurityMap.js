"use client"

import React, { useState } from 'react';
import MiniMap from './MiniMap/MiniMap_Component';
import ModalManager from './Modals/ModalManager';
import MapCanvas from './MapCanvas';
import ControlPanel from './ControlPanel';
import { MapProvider, useMapContext } from '../contexts/MapContext';
import mapConfig from '../config/mapConfig';

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
    updateBoxPosition,
    switchMode,
    handleAttack,
    handleConfirmAttack,
    MAP_SIZE
  } = useMapContext();

  const [selectedModel, setSelectedModel] = useState('default');
  const [isOverNode, setIsOverNode] = useState(false);

  const handleAddBox = () => {
    addBox(selectedModel);
  };

  const handleDrag = (id, x, y) => {
    const halfWorldSize = (MAP_SIZE * mapConfig.worldSize) / 2;
    const constrainedX = Math.max(Math.min(x, halfWorldSize), -halfWorldSize);
    const constrainedY = Math.max(Math.min(y, halfWorldSize), -halfWorldSize);
    updateBoxPosition(id, constrainedX, constrainedY);
  };

  return (
    <div className="w-screen h-screen relative bg-gray-900">
      <div className="absolute inset-0">
        <MapCanvas
          boxes={boxes}
          connections={connections}
          selectedBox={selectedBox}
          targetBox={targetBox}
          isAttacking={isAttacking}
          mode={mode}
          handleBoxClick={handleBoxClick}
          handleBoxDoubleClick={handleBoxDoubleClick}
          handleDrag={handleDrag}
          setIsOverNode={setIsOverNode}
        />
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
          />
        </div>
        <div className="absolute bottom-4 right-4 z-10 pointer-events-auto">
          <MiniMap boxes={boxes} mapSize={MAP_SIZE} />
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
    </div>
  );
};

const AISecurityMap = () => (
  <MapProvider>
    <AISecurityMapContent />
  </MapProvider>
);

export default AISecurityMap;