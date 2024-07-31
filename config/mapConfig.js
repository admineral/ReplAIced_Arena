const mapConfig = {


    dragSpeed: 0.5,
    invertDragX: false,
    invertDragY: false,


    // The size of the entire world (as a multiple of mapSize)
    worldSize: 5,
  
    // Initial map position
    initialPosition: { x: 0, y: 0 },
  
    // Initial zoom level (1 is default, <1 is zoomed out, >1 is zoomed in)
    initialZoom: 0.8,
  
    // Minimum zoom level (maximum zoom out)
    minZoom: 0.5,
  
    // Maximum zoom level (maximum zoom in)
    maxZoom: 1.5,
  
    // How much the zoom changes per scroll
    zoomStep: 0.05,
  
    // The size of the map (this should match your MAP_SIZE calculation)
    mapSize: 30,
  
    // How far the camera can move from the center in any direction
    // (as a multiple of mapSize)
    panLimit: 1.5,
  
    // Drag speed (lower values make dragging slower)
    dragSpeed: 0.02,
  
    // Whether to invert the horizontal drag direction
    invertDragX: true,
  
    // Whether to invert the vertical drag direction
    invertDragY: false,
  };
  
  export default mapConfig;