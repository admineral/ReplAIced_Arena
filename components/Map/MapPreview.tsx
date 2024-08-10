import React from 'react';
import mapConfig from '../../config/mapConfig';

interface Box {
  id: string;
  x: number;
  y: number;
  type: string;
}

interface MapPreviewProps {
  boxes: Box[];
  mapSize: number;
  previewSize?: number;
}

const MapPreview: React.FC<MapPreviewProps> = ({ 
  boxes, 
  mapSize, 
  previewSize = 300 
}) => {
  const worldSize = mapSize * mapConfig.worldSize;
  const padding = 10;

  const scalePosition = (value: number) => {
    return ((value + worldSize / 2) / worldSize) * (previewSize - 2 * padding) + padding;
  };

  const getBoxColor = (type: string) => {
    switch (type) {
      case 'openai':
        return 'green';
      case 'claude':
        return 'blue';
      case 'gemini':
        return 'purple';
      case 'meta':
        return 'orange';
      default:
        return 'gray';
    }
  };

  return (
    <div 
      style={{ 
        width: previewSize, 
        height: previewSize, 
        backgroundColor: 'rgba(0, 0, 0, 0.5)', 
        border: '1px solid white', 
        position: 'relative',
      }}
    >
      {boxes.map((box) => (
        <div
          key={box.id}
          style={{
            position: 'absolute',
            left: `${scalePosition(box.x)}px`,
            top: `${scalePosition(-box.y)}px`,
            width: 4,
            height: 4,
            backgroundColor: getBoxColor(box.type),
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </div>
  );
};

export default MapPreview;