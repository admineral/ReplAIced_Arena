export const constrainPosition = (x, y, mapSize) => {
    const halfSize = mapSize / 2;
    const constrainedX = Math.max(Math.min(x, halfSize), -halfSize);
    const constrainedY = Math.max(Math.min(y, halfSize), -halfSize);
    return [constrainedX, constrainedY];
  };
  
  export const generateRandomPosition = (mapSize) => {
    return [
      (Math.random() * mapSize - mapSize / 2) * 0.9,
      (Math.random() * mapSize - mapSize / 2) * 0.9
    ];
  };
  
  export const calculateDistance = (x1, y1, x2, y2) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  };
  
  export const normalizePosition = (x, y, mapSize) => {
    return [
      (x + mapSize / 2) / mapSize,
      (y + mapSize / 2) / mapSize
    ];
  };
  
  export const denormalizePosition = (normalizedX, normalizedY, mapSize) => {
    return [
      (normalizedX * mapSize) - mapSize / 2,
      (normalizedY * mapSize) - mapSize / 2
    ];
  };
  
  export const isPositionValid = (x, y, mapSize, existingBoxes, minDistance = 2) => {
    const [constrainedX, constrainedY] = constrainPosition(x, y, mapSize);
    
    // Check if the position is within the map bounds
    if (constrainedX !== x || constrainedY !== y) {
      return false;
    }
  
    // Check if the position is too close to existing boxes
    for (const box of existingBoxes) {
      const distance = calculateDistance(x, y, box.x, box.y);
      if (distance < minDistance) {
        return false;
      }
    }
  
    return true;
  };