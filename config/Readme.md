# mapConfig.js

## Overview
This configuration file defines the core parameters that control the behavior and appearance of the AI Security Map. It sets various aspects of the map's dimensions, zoom functionality, and drag behavior.

## Configuration Parameters

### Map Dimensions
- **worldSize**: `5`
  - Defines the size of the entire world as a multiple of mapSize
- **mapSize**: `20`
  - The base size of the map

### Initial Settings
- **initialPosition**: `{ x: 0, y: 0 }`
  - Starting position of the map view
- **initialZoom**: `0.8`
  - Initial zoom level (`< 1` is zoomed out, `> 1` is zoomed in)

### Zoom Settings
- **minZoom**: `0.5`
  - Minimum zoom level (maximum zoom out)
- **maxZoom**: `1.5`
  - Maximum zoom level (maximum zoom in)
- **zoomStep**: `0.05`
  - Incremental change in zoom per scroll action

### Camera Limits
- **panLimit**: `1.5`
  - How far the camera can move from the center (as a multiple of mapSize)

### Drag Behavior
- **dragSpeed**: `0.02`
  - Speed of map dragging (lower values make dragging slower)
- **invertDragX**: `true`
  - Inverts the horizontal drag direction
- **invertDragY**: `false`
  - Keeps the vertical drag direction normal

## Usage
This configuration object is imported and used throughout the AI Security Map application to ensure consistent behavior across different components and hooks. It's particularly important for:
1. Initializing the map view
2. Controlling zoom functionality
3. Setting boundaries for map navigation
4. Defining drag behavior

## Note
The values in this configuration file significantly impact the user experience and performance of the application. Any adjustments should be made carefully, considering their effects on the overall map interaction and visual presentation.