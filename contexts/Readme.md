# MapContext.js

## Overview
This file defines the central context provider for the AI Security Map application. It integrates various custom hooks and manages the overall state and logic for the map, boxes, attacks, and user interactions.

## Key Components

### MapContext
- **Created using**: `createContext()` from React
- **Purpose**: Provides the global state and functions to all child components

### useScreenSize
- **Custom hook for tracking screen size changes**
- **Returns**: `{ width, height }`

### MapProvider
- **Main component** that wraps the application and provides the context
- **Integrates**:
  - `useBoxManager`
  - `useAttackManager`
  - `useMapControls` hooks

## State Management

### Global State
- `mode`: Current application mode (create, preview, attack)
- `isConfigOpen`, `isChallengeOpen`, `isAttackModalOpen`: Modal states
- `tooltip`: Current tooltip message
- `MAP_SIZE`: Calculated map size based on screen aspect ratio

### Imported Hook States
- **From `useBoxManager`**: 
  - `boxes`, `connections`, `addBox`, `updateBox`, `updateBoxPosition`, `handleBoxDrag`
- **From `useAttackManager`**:
  - `selectedBox`, `targetBox`, `isAttacking`, `isAttackModeAvailable`, `initiateAttack`, `startAttackAnimation`, `confirmAttack`
- **From `useMapControls`**: 
  - `mapControls` (position and zoom state)

## Key Functions

### handleBoxClick
- **Purpose**: Manages box selection based on current mode
- **Actions**: Initiates attacks or opens challenge modal

### handleBoxDoubleClick
- **Purpose**: Opens configuration modal for boxes in create mode

### switchMode
- **Purpose**: Changes application mode (create, preview, attack)
- **Actions**: Checks if attack mode is available

### handleAttack
- **Purpose**: Initiates attack process when attacker and target are selected

### handleConfirmAttack
- **Purpose**: Confirms and executes attack
- **Actions**: Manages attack animation and state reset

## Context Value
Provides a comprehensive object containing all state variables and functions needed by child components, including:
- Application mode and UI states
- Box and attack management functions
- Map control functions
- Event handlers for user interactions

