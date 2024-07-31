# Components Directory

This directory contains the core components of the AI Security Map application. Each subdirectory groups related components by functionality.

## Directory Structure

- **Attack**: Components related to the attack functionality.
- **Error**: Error handling and display components.
- **Map**: Main map components, including the primary canvas.
- **MiniMap**: Components for the miniature map overview.
- **Modals**: Various modal dialogs used throughout the application.
- **Navbar**: Navigation and control panel components.
- **Nodes**: Components related to individual nodes (boxes) on the map.

## Key Components

### Map/AISecurityMap.js
The main component that orchestrates the entire application. It integrates various sub-components and manages the overall layout and state.

### Map/MapCanvas.js
Renders the main 3D canvas using react-three-fiber. Handles rendering of nodes, connections, and user interactions.

### MiniMap/MiniMap_Component.js
Provides a small overview of the entire map, showing all nodes and their positions.

### Modals/BoxConfigFormModal.js
A modal dialog for configuring individual node properties.

### Navbar/ControlPanel.js
Contains controls for switching modes, adding nodes, and other top-level actions.

## Usage

These components are typically imported and used within the main `AISecurityMap.js` component or other parent components. They rely on the `MapContext` for global state management and often use custom hooks for specific functionalities.

Example:
