/****************************************************************************
 * config/mapConfig.js
 * 
 * Map Configuration
 * 
 * This file defines the configuration parameters for the AI Security Map.
 * It includes settings for map size, zoom levels, drag behavior, and more.
 * 
 * Context:
 * - Used throughout the AI Security Map application
 * - Imported by various components and hooks to maintain consistent behavior
 * 
 * Key Configuration Areas:
 * 1. Map Dimensions: Defines the size of the map and the entire world
 * 2. Zoom Settings: Controls initial, minimum, and maximum zoom levels
 * 3. Drag Behavior: Sets drag speed and direction inversion
 * 4. Camera Limits: Determines how far the camera can move from the center
 * 
 * Note: Ensure that these values are adjusted carefully as they affect
 * the overall user experience and performance of the application.
 ****************************************************************************/

const mapConfig = {
  // The size of the entire world (as a multiple of mapSize)
  // Increased from 5 to 10 to expand the explorable area
  // This means the total world is now 10 times the size of the visible map
  // Allows for more space to place nodes and creates a larger explorable area
  worldSize: 5,

  // Minimum distance between boxes
  minBoxDistance: 2, 

  // Initial map position (center of the world)
  initialPosition: { x: 0, y: 0 },

  // Initial zoom level (1 is default, <1 is zoomed out, >1 is zoomed in)
  // Slightly decreased to show more of the expanded world initially
  initialZoom: 0.7,

  // Minimum zoom level (maximum zoom out)
  // Decreased to allow viewing more of the expanded world at once
  minZoom: 0.3,

  // Maximum zoom level (maximum zoom in)
  maxZoom: 1.5,

  // How much the zoom changes per scroll
  zoomStep: 0.05,

  // The size of the map (this should match your MAP_SIZE calculation)
  // This represents the size of the visible area
  mapSize: 50,

  // How far the camera can move from the center in any direction
  // (as a multiple of mapSize)
  // Increased to allow exploration of the larger world
  panLimit: 3,

  // Drag speed (lower values make dragging slower)
  // Slightly increased to make navigation of the larger world easier
  dragSpeed: 0.02,

  // Whether to invert the horizontal drag direction
  invertDragX: true,

  // Whether to invert the vertical drag direction
  invertDragY: false,
};

export default mapConfig;