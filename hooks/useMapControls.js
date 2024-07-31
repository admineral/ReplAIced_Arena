/****************************************************************************
 * hooks/useMapControls.js
 * 
 * Map Controls Hook
 * 
 * This custom hook manages the state and operations for map controls in the 
 * AI Security Map. It handles map position and zoom level, providing functions
 * for canvas dragging and zooming.
 * 
 * Context:
 * - Part of the AI Security Map application
 * - Used in conjunction with MapContext and other custom hooks
 * 
 * Global State:
 * - position: Current position of the map view
 * - zoom: Current zoom level of the map
 * 
 * Key Functionalities:
 * 1. Managing map position within world boundaries
 * 2. Handling canvas dragging for map navigation
 * 3. Controlling zoom levels with min and max limits
 * 4. Providing smooth zoom functionality
 ****************************************************************************/



import { useState, useCallback } from 'react';
import mapConfig from '../config/mapConfig';

export const useMapControls = () => {
  const [position, setPosition] = useState(mapConfig.initialPosition);
  const [zoom, setZoom] = useState(mapConfig.initialZoom);

  const handleCanvasDrag = useCallback((dx, dy) => {
    setPosition(prev => {
      const worldLimit = mapConfig.mapSize * mapConfig.worldSize / 2;
      const newX = Math.max(-worldLimit, Math.min(worldLimit, prev.x - dx));
      const newY = Math.max(-worldLimit, Math.min(worldLimit, prev.y - dy));
      return { x: newX, y: newY };
    });
  }, []);

  const handleZoom = useCallback((delta) => {
    setZoom(prev => {
      const newZoom = prev + delta * mapConfig.zoomStep;
      return Math.max(mapConfig.minZoom, Math.min(mapConfig.maxZoom, newZoom));
    });
  }, []);

  return { position, zoom, handleCanvasDrag, handleZoom };
};