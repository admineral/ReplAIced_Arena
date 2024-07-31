/****************************************************************************
 * components/MiniMap/MiniMap_Component.js
 * 
 * MiniMap Component for AI Security Map
 * 
 * This component renders a small overview map of all nodes (boxes) in the 
 * AI Security Map application. It provides a quick visual reference of the 
 * entire map layout and node positions.
 * 
 * Context:
 * - Part of the AI Security Map application's UI
 * - Typically displayed in a corner of the main view
 * 
 * Props:
 * - boxes: Array of box objects, each containing id, x, y, and type properties
 * - mapSize: Number representing the size of the main map
 * 
 * Key Features:
 * 1. Scales node positions from the main map to fit within the minimap
 * 2. Represents each node as a small colored dot
 * 3. Uses different colors for different node types (AI models)
 * 4. Provides a fixed-size overview regardless of the main map's zoom level
 * 
 * Helper Functions:
 * - scalePosition: Scales a coordinate from the main map to the minimap
 * - getBoxColor: Determines the color of a node based on its type
 * 
 * Note: This component uses inline styles for positioning and appearance.
 * Consider using a CSS-in-JS solution or external stylesheet for more complex styling needs.
 ****************************************************************************/



import React from 'react';

const MiniMap = ({ boxes, mapSize }) => {
    const miniMapSize = 150;
    const boxSize = 3;
    const padding = 5;

    const scalePosition = (value) => {
        // Map [-mapSize/2, mapSize/2] to [padding, miniMapSize - padding]
        return ((value + mapSize / 2) / mapSize) * (miniMapSize - 2 * padding) + padding;
    };

    const getBoxColor = (type) => {
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
        <div style={{ 
            width: miniMapSize, 
            height: miniMapSize, 
            backgroundColor: 'rgba(0, 0, 0, 0.5)', 
            border: '1px solid white', 
            position: 'relative',
        }}>
            {boxes.map((box) => (
                <div
                    key={box.id}
                    style={{
                        position: 'absolute',
                        left: `${scalePosition(box.x)}px`,
                        top: `${scalePosition(-box.y)}px`, // Invert Y-axis
                        width: boxSize,
                        height: boxSize,
                        backgroundColor: getBoxColor(box.type),
                        transform: 'translate(-50%, -50%)', // Center the dot on its position
                    }}
                />
            ))}
        </div>
    );
};

export default MiniMap;