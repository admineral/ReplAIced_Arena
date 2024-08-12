"use client"

import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
    handleMapPositionChange,
    handleMapZoomChange,
  } = mapContext;

  useEffect(() => {
    const expanded = mapPosition.x < 0 || mapPosition.y < 0 || 
                     mapPosition.x > MAP_SIZE || mapPosition.y > MAP_SIZE;
    setIsMapExpanded(expanded);
  }, [mapPosition, MAP_SIZE]);

  const miniMapSize = useMemo(() => {
    if (isMobile) return 80; // Reduced size for mobile
    if (isTablet) return 100;
    return 120; // Reduced size for desktop
  }, [isMobile, isTablet]);

  const replayControlsStyle = useMemo(() => {
    if (isMobile) return "w-full";
    if (isTablet) return `w-[calc(100%-${miniMapSize + 32}px)]`;
    return isMapExpanded 
      ? `w-[calc(100%-${miniMapSize + 48}px)]` 
      : `w-[calc(100%-${miniMapSize + 32}px)]`;
  }, [isMobile, isTablet, isMapExpanded, miniMapSize]);

  const handleMiniMapPositionChange = useCallback((newPosition) => {
    console.log('MiniMap position change:', newPosition);
    if (typeof handleMapPositionChange === 'function') {
      handleMapPositionChange(newPosition);
    } else {
      console.warn('handleMapPositionChange is not a function');
    }
  }, [handleMapPositionChange]);

  const handleMiniMapZoomChange = useCallback((newZoom) => {
    console.log('MiniMap zoom change:', newZoom);
    if (typeof handleMapZoomChange === 'function') {
      handleMapZoomChange(newZoom);
    } else {
      console.warn('handleMapZoomChange is not a function');
    }
  }, [handleMapZoomChange]);

  const miniMapStyle = useMemo(() => ({
    position: 'absolute',
    bottom: isMobile ? '8px' : '16px',
    right: isMobile ? '8px' : '16px',
    left: isMobile ? '8px' : 'auto',
  }), [isMobile]);

  return (
    <div className="flex flex-col h-full w-full bg-gray-900 relative">
      <div className="flex-grow relative">
        <MapCanvas />
      </div>
      <div className="absolute inset-0 pointer-events-none">
        {mode === 'attack' && (
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-50 pointer-events-auto">
            <AttackGuidedTour
              step={selectedBox && targetBox ? 2 : selectedBox ? 1 : 0}
              selectedBox={selectedBox}
              targetBox={targetBox}
              isAttacking={isAttacking}
            />
          </div>
        )}
        
        <div className="absolute bottom-2 left-2 right-2 flex flex-col items-start">
          <div className="flex w-full items-end justify-between">
            <div className={`pointer-events-auto ${replayControlsStyle}`}>
              <AttackReplayControls isMapExpanded={isMapExpanded} isMobile={isMobile} />
            </div>
            
            <div className="pointer-events-auto ml-2">
              <MiniMap 
                boxes={boxes} 
                mapSize={MAP_SIZE} 
                currentPosition={mapPosition}
                currentZoom={mapZoom}
                onPositionChange={handleMiniMapPositionChange}
                onZoomChange={handleMiniMapZoomChange}
                miniMapSize={miniMapSize}
                miniMapZoom={1.5}
                boxSize={isMobile ? 2 : 3}
                padding={isMobile ? 2 : 4}
                backgroundColor="rgba(0, 0, 0, 0.7)"
                borderColor="#4a5568"
                viewRectColor="#ffd700"
                disableHoverEnlarge={isMobile}
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