"use client"
import React from 'react';
import MiniMap from './MiniMap/MiniMap_Component';
import ModalManager from './Modals/ModalManager';
import MapCanvas from './MapCanvas';
import ControlPanel from './ControlPanel';
import { MapProvider, useMapContext } from '../contexts/MapContext';
import { MAP_SIZE } from '../utils/mapUtils';

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
    handleDrag,
    switchMode,
    handleAttack,
    handleConfirmAttack
  } = useMapContext();

  const [selectedModel, setSelectedModel] = React.useState('default');

  const handleAddBox = () => {
    addBox(selectedModel);
  };

  return (
    <div className="w-screen h-screen relative bg-gray-900">
      <div className="absolute inset-0">
        <MapCanvas
          boxes={boxes}
          connections={connections}
          isAttacking={isAttacking}
          selectedBox={selectedBox}
          targetBox={targetBox}
          mode={mode}
          onBoxClick={handleBoxClick}
          onBoxDoubleClick={handleBoxDoubleClick}
          onDrag={handleDrag}
        />
        <div className="absolute bottom-4 right-4 z-10">
          <MiniMap boxes={boxes} mapSize={MAP_SIZE} />
        </div>
      </div>
      <ControlPanel
        mode={mode}
        switchMode={switchMode}
        addBox={handleAddBox}
        isAttackModeAvailable={isAttackModeAvailable}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
      />
      {mode === 'attack' && selectedBox && targetBox && (
        <button
          onClick={handleAttack}
          className="absolute top-20 left-4 bg-red-500 text-white rounded-full px-4 py-2 shadow-lg hover:bg-red-600 transition-colors duration-300"
        >
          Attack
        </button>
      )}
      {tooltip && (
        <div className="absolute bottom-4 left-4 bg-gray-800 text-white p-2 rounded-lg">
          {tooltip}
        </div>
      )}
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
}

const AISecurityMap = () => (
  <MapProvider>
    <AISecurityMapContent />
  </MapProvider>
);

export default AISecurityMap;