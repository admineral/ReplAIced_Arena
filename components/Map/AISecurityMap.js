"use client"

import React, { useState } from 'react';
import { useMapContext } from '../../contexts/MapContext';
import { useUpdateTimeInterval } from '../../hooks/useUpdateTimeInterval';
import MapCanvas from './MapCanvas';
import BoxesInfoDisplay from './BoxesInfoDisplay';
import AttackGuidedTour from './AttackGuidedTour';
import AttackReplayControls from '../AttackReplay/AttackReplayControls';
import { useMediaQuery } from 'react-responsive';

const AISecurityMapContent = () => {
  const [isReplayControlsOpen, setIsReplayControlsOpen] = useState(false);
  const [forceExpand, setForceExpand] = useState(false);

  const isMobile = useMediaQuery({ maxWidth: 768 });

  const mapContext = useMapContext();
  const currentTime = useUpdateTimeInterval(mapContext.lastUpdateTime);

  const {
    mode,
    boxes,
    selectedBox,
    targetBox,
    isAttacking,
    lastUpdateTime,
  } = mapContext;

  const toggleReplayControls = () => {
    setIsReplayControlsOpen(!isReplayControlsOpen);
  };

  return (
    <div className="flex flex-col h-full w-full bg-gray-900 relative">
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
        
        <div className={`absolute bottom-4 left-4 right-4 flex ${isMobile ? 'flex-col' : 'justify-between'} items-end`}>
          <div className={`pointer-events-auto ${isMobile ? 'mb-2 w-full' : ''}`}>
            <BoxesInfoDisplay 
              boxCount={boxes.length}
              lastUpdateTime={lastUpdateTime}
              currentTime={currentTime}
              forceExpand={forceExpand}
            />
          </div>
          
          <div className={`pointer-events-auto ${isMobile ? 'w-full' : 'flex-grow mx-4 max-w-3xl'}`}>
            {isMobile ? (
              <>
                <button
                  onClick={toggleReplayControls}
                  className="w-full bg-gray-800 text-white py-2 px-4 rounded-md mb-2"
                >
                  {isReplayControlsOpen ? 'Hide Replay Controls' : 'Show Replay Controls'}
                </button>
                {isReplayControlsOpen && <AttackReplayControls />}
              </>
            ) : (
              <AttackReplayControls />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const AISecurityMap = () => <AISecurityMapContent />;

export default AISecurityMap;