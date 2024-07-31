# AI Security Map Hooks

This folder contains custom React hooks that power the core functionality of the AI Security Map application. These hooks manage various aspects of the application's state and logic, providing reusable functionality across components.

## Contents

### useScreenSize.js
**useScreenSize()**
- **Returns**: `{ width, height }`
- **Description**: Provides real-time screen size information, crucial for responsive design and layout adjustments.

### useMapControls.js
**useMapControls()**
- **Returns**: `{ position, zoom, handleCanvasDrag, handleZoom }`
- **Description**: Manages map position and zoom level, ensuring smooth navigation and exploration within defined boundaries.
- **Key functions**:
  - `handleCanvasDrag(dx, dy)`: Handles map dragging
  - `handleZoom(delta)`: Controls map zooming

### useBox.js
**useBoxManager(MAP_SIZE)**
- **Returns**: `{ boxes, connections, addBox, updateBox, updateBoxPosition, handleBoxDrag, removeBox, clearAllBoxes }`
- **Description**: Manages the state and operations for boxes (nodes) representing AI models or security challenges.
- **Key functions**:
  - `addBox(type)`: Adds a new box with random position
  - `updateBox(updatedBox)`: Updates box properties
  - `updateBoxPosition(id, x, y)`: Updates box position
  - `handleBoxDrag(id, x, y)`: Handles box dragging
  - `removeBox(id)`: Removes a box
  - `clearAllBoxes()`: Removes all boxes

### useAttack.js
**useAttackManager(boxes, mode, setMode, setTooltip)**
- **Returns**: `{ selectedBox, targetBox, isAttacking, isAttackModeAvailable, initiateAttack, startAttackAnimation, confirmAttack }`
- **Description**: Manages attack state and logic, simulating and visualizing potential security threats and interactions between AI models.
- **Key functions**:
  - `initiateAttack(attacker, target)`: Initiates an attack
  - `startAttackAnimation()`: Starts the attack animation
  - `confirmAttack()`: Confirms and completes an attack

## Overview

These hooks form the backbone of the AI Security Map application, encapsulating complex state management and business logic. They work in tandem with the MapContext to provide a seamless, interactive experience for users exploring the AI security landscape.

## Detailed Descriptions

### useScreenSize
This hook tracks changes in the window's dimensions and updates the state accordingly. It's essential for creating a responsive layout that adapts to different screen sizes and orientations.

### useMapControls
By managing the map's position and zoom level, this hook enables users to navigate the AI security landscape effectively. It ensures that map movements are smooth and constrained within the defined world boundaries, providing a consistent exploration experience.

### useBox
This hook is central to the application's functionality, managing the lifecycle of boxes (nodes) that represent various AI models or security challenges. It handles box creation, updates, positioning, and removal, while also managing connections between boxes. The hook ensures that all box-related operations respect the map's boundaries and rules.

### useAttack
Encapsulating the logic for the application's attack mode, this hook manages the selection of attacker and target nodes, controls attack mode availability, and handles the attack confirmation process. It plays a crucial role in demonstrating potential vulnerabilities and interactions between different AI models in the security landscape.

## Usage

These hooks are designed to be used within the context of the AI Security Map application. They should be imported into components or other hooks as needed, typically in conjunction with the MapContext for global state management.

