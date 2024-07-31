// Define the MAP_SIZE constant here if it's used across multiple files
export const MAP_SIZE = 20;

export const constrainPosition = (x, y, mapSize = MAP_SIZE) => {
  const halfSize = mapSize / 2;
  const constrainedX = Math.max(Math.min(x, halfSize), -halfSize);
  const constrainedY = Math.max(Math.min(y, halfSize), -halfSize);
  return [constrainedX, constrainedY];
};

// You can add other utility functions here as needed
export const generateRandomPosition = (mapSize = MAP_SIZE) => {
  return [
    (Math.random() * mapSize - mapSize / 2) * 0.9,
    (Math.random() * mapSize - mapSize / 2) * 0.9
  ];
};