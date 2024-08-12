"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { useMapContext } from '../../contexts/MapContext';
import { useUpdateTimeInterval } from '../../hooks/useUpdateTimeInterval';
import MapCanvas from './MapCanvas';
import AttackGuidedTour from './AttackGuidedTour';
import AttackReplayControls from '../AttackReplay/AttackReplayControls';
import MiniMap from '../MiniMap/MiniMap_Component';
import { useMediaQuery } from 'react-responsive';

const AISecurityMapContent = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const isTablet = useMediaQuery({ minWidth: 769, maxWidth: 1024 });
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  const mapContext = useMapContext();
  const currentTime = useUpdateTimeInterval(mapContext.lastUpdateTime);

  const {
    mode,
    boxes,
    selectedBox,
    targetBox,
    isAttacking,
    mapPosition,
    mapZoom,
    MAP_SIZE,
    handleMiniMapPositionChange,
    handleMiniMapZoomChange,
  } = mapContext;

  useEffect(() => {
    const expanded = mapPosition.x < 0 || mapPosition.y < 0 || 
                     mapPosition.x > MAP_SIZE || mapPosition.y > MAP_SIZE;
    setIsMapExpanded(expanded);
  }, [mapPosition, MAP_SIZE]);

  const miniMapSize = useMemo(() => {
    if (isMobile) return 100;
    if (isTablet) return 120;
    return 150;
  }, [isMobile, isTablet]);

  const replayControlsStyle = useMemo(() => {
    if (isMobile) return "w-full";
    if (isTablet) return `w-[calc(100%-${miniMapSize + 32}px)]`;
    return isMapExpanded 
      ? `w-[calc(100%-${miniMapSize + 48}px)]` 
      : `w-[calc(100%-${miniMapSize + 32}px)]`;
  }, [isMobile, isTablet, isMapExpanded, miniMapSize]);

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
        
        <div className="absolute bottom-4 left-4 right-4 flex flex-col items-start">
          <div className="flex w-full items-end justify-between">
            <div className={`pointer-events-auto ${replayControlsStyle}`}>
              <AttackReplayControls isMapExpanded={isMapExpanded} isMobile={isMobile} />
            </div>
            
            <div className="pointer-events-auto ml-4">
              <MiniMap 
                boxes={boxes} 
                mapSize={MAP_SIZE} 
                currentPosition={mapPosition}
                currentZoom={mapZoom}
                onPositionChange={handleMiniMapPositionChange}
                onZoomChange={handleMiniMapZoomChange}
                miniMapSize={miniMapSize}
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
    </div>
  );
};

const AISecurityMap = () => <AISecurityMapContent />;

export default AISecurityMap;