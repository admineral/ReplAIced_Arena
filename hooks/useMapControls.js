import { useState, useCallback } from 'react';
import mapConfig from '../config/mapConfig';

export const useMapControls = () => {
  const [position, setPosition] = useState(mapConfig.initialPosition);
  const [zoom, setZoom] = useState(mapConfig.initialZoom);

  const handleDrag = useCallback((dx, dy) => {
    setPosition(prev => {
      const worldLimit = mapConfig.mapSize * mapConfig.worldSize / 2;
      const newX = Math.max(-worldLimit, Math.min(worldLimit, prev.x + dx));
      const newY = Math.max(-worldLimit, Math.min(worldLimit, prev.y + dy));
      return { x: newX, y: newY };
    });
  }, []);

  const handleZoom = useCallback((delta) => {
    setZoom(prev => {
      const newZoom = prev + delta * mapConfig.zoomStep;
      return Math.max(mapConfig.minZoom, Math.min(mapConfig.maxZoom, newZoom));
    });
  }, []);

  return { position, zoom, handleDrag, handleZoom };
};