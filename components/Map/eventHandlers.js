/****************************************************************************
 * components/Map/eventHandlers.js
 * 
 * Event Handlers for AI Security Map
 * 
 * This file contains event handling functions used in the AI Security Map
 * component. These functions are exported and used in the main component to
 * handle various user interactions and state changes.
 ****************************************************************************/

// Handler for opening the create box modal
export const handleOpenCreateBoxModal = (setIsCreateBoxModalOpen) => () => {
    setIsCreateBoxModalOpen(true);
  };
  
  // Handler for closing the create box modal
  export const handleCloseCreateBoxModal = (setIsCreateBoxModalOpen) => () => {
    setIsCreateBoxModalOpen(false);
  };
  
  // Handler for creating a new box
  export const handleCreateBox = (addBox, MAP_SIZE, setMapPosition, setMapZoom, setIsCreateBoxModalOpen) => (newBoxData) => {
    const centerX = MAP_SIZE / 2;
    const centerY = MAP_SIZE / 2;
    const radius = MAP_SIZE / 4; // This will place boxes within a quarter of the map size from the center
  
    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.random() * radius;
  
    const x = centerX + distance * Math.cos(angle);
    const y = centerY + distance * Math.sin(angle);
  
    const boxWithPosition = {
      ...newBoxData,
      x: x,
      y: y
    };
  
    addBox(boxWithPosition);
  
    // Center the view on the new box
    setMapPosition({ x: x, y: y });
  
    // Set a specific zoom level (adjust as needed)
    const newZoomLevel = 2; // This will zoom in closer to the new box
    setMapZoom(newZoomLevel);
  
    setIsCreateBoxModalOpen(false);
  };
  
  // Handler for MiniMap position changes
  export const handleMiniMapPositionChange = (setMapPosition) => (newPosition) => {
    setMapPosition(newPosition);
  };
  
  // Handler for MiniMap zoom changes
  export const handleMiniMapZoomChange = (setMapZoom) => (newZoom) => {
    setMapZoom(newZoom);
  };
  
  // Handler for retrying loading after a timeout or error
  export const handleRetry = (loadingTimeout, handleLoadBoxes) => () => {
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
    }
    handleLoadBoxes();
  };
  
  // Handler for box click events
  export const handleBoxClick = (setSelectedBox, setTargetBox, mode) => (box) => {
    if (mode === 'attack') {
      setTargetBox(box);
    } else {
      setSelectedBox(box);
    }
  };
  
  // Handler for box double-click events
  export const handleBoxDoubleClick = (setIsChallengeOpen, setSelectedBox) => (box) => {
    setSelectedBox(box);
    setIsChallengeOpen(true);
  };
  
  // Handler for box drag events
  export const handleBoxDrag = (updateBox) => (id, newPosition) => {
    updateBox(id, { x: newPosition.x, y: newPosition.y });
  };
  
  // Handler for attack button click
  export const handleAttack = (setIsAttackModalOpen) => () => {
    setIsAttackModalOpen(true);
  };
  
  // Handler for confirming an attack
  export const handleConfirmAttack = (selectedBox, targetBox, setIsAttackModalOpen) => () => {
    // Implement attack logic here
    console.log(`Attacking from ${selectedBox.id} to ${targetBox.id}`);
    setIsAttackModalOpen(false);
  };
  
  // Add any additional event handlers as needed