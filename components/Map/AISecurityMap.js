/****************************************************************************
 * components/AISecurityMap.js
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
 * 3. MiniMap: Small overview map of all nodes
 * 4. ModalManager: Handles various modal dialogs (config, challenge, attack)
 * 
 * Key Functionalities:
 * 1. Rendering the main application layout
 * 2. Managing application modes (create, preview, attack)
 * 3. Handling box additions and interactions
 * 4. Displaying tooltips and attack buttons
 * 5. Coordinating modal dialogs for various actions
 * 
 * Note: This component heavily relies on the MapContext for state management.
 * Ensure that all required context values are properly provided by the MapProvider.
 ****************************************************************************/



"use client"

import React, { useState } from 'react';
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
    mapControls
  } = useMapContext();

  const [selectedModel, setSelectedModel] = useState('default');

  const handleAddBox = () => {
    addBox(selectedModel);
  };

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
          />
        </div>
        <div className="absolute bottom-4 right-4 z-10 pointer-events-auto">
          <MiniMap 
            boxes={boxes} 
            mapSize={MAP_SIZE} 
            currentPosition={mapControls.position}
            currentZoom={mapControls.zoom}
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
    </div>
  );
};

const AISecurityMap = () => (
  <MapProvider>
    <AISecurityMapContent />
  </MapProvider>
);

export default AISecurityMap;