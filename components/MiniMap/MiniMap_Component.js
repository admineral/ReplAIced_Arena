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
 * - disableHoverEnlarge: Boolean to disable hover-to-enlarge feature
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
import React, { useState, useRef, useCallback } from 'react';
import mapConfig from '../../config/mapConfig';

const MiniMap = ({ 
    boxes, 
    mapSize, 
    currentPosition, 
    currentZoom,
    onPositionChange,
    onZoomChange,
    miniMapSize = 150,
    miniMapZoom = 1,
    boxSize = 3,
    padding = 5,
    backgroundColor = 'rgba(0, 0, 0, 0.5)',
    borderColor = 'white',
    viewRectColor = 'yellow',
    disableHoverEnlarge = false
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const miniMapRef = useRef(null);
    const worldSize = mapSize * mapConfig.worldSize;
    const effectiveMiniMapSize = disableHoverEnlarge ? miniMapSize : (isHovered ? miniMapSize * 1.5 : miniMapSize);

    const scalePosition = useCallback((value) => {
        return ((value + worldSize / 2) / worldSize) * (effectiveMiniMapSize - 2 * padding) + padding;
    }, [worldSize, effectiveMiniMapSize, padding]);

    const inverseScalePosition = useCallback((value) => {
        return ((value - padding) / (effectiveMiniMapSize - 2 * padding) * worldSize) - worldSize / 2;
    }, [worldSize, effectiveMiniMapSize, padding]);

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

    // Calculate the visible area rectangle
    const visibleAreaSize = mapSize / currentZoom;
    const visibleAreaWidth = (visibleAreaSize / worldSize) * (effectiveMiniMapSize - 2 * padding);
    const visibleAreaHeight = visibleAreaWidth;
    const visibleAreaX = scalePosition(currentPosition.x) - visibleAreaWidth / 2;
    const visibleAreaY = scalePosition(-currentPosition.y) - visibleAreaHeight / 2;

    const handleMouseEnter = () => {
        if (!disableHoverEnlarge) {
            setIsHovered(true);
        }
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        setIsDragging(false);
    };

    const updatePosition = useCallback((e) => {
        if (!miniMapRef.current) return;
        const rect = miniMapRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left - padding;
        const y = e.clientY - rect.top - padding;
        const newX = inverseScalePosition(x);
        const newY = -inverseScalePosition(y);
        onPositionChange({ x: newX, y: newY });
    }, [inverseScalePosition, onPositionChange, padding]);

    const handleMouseDown = (e) => {
        setIsDragging(true);
        updatePosition(e);
    };

    const handleMouseMove = (e) => {
        if (isDragging) {
            updatePosition(e);
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleDoubleClick = (e) => {
        updatePosition(e);
        onZoomChange(currentZoom * 1.5);
    };

    const handleReset = (e) => {
        e.stopPropagation();
        e.preventDefault();
        onPositionChange({ x: 0, y: 0 });
        onZoomChange(1);
    };

    return (
        <div 
            ref={miniMapRef}
            style={{ 
                width: effectiveMiniMapSize, 
                height: effectiveMiniMapSize, 
                backgroundColor: backgroundColor, 
                border: `1px solid ${borderColor}`, 
                position: 'relative',
                transition: disableHoverEnlarge ? 'none' : 'all 0.3s ease',
                cursor: isDragging ? 'grabbing' : 'grab'
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onDoubleClick={handleDoubleClick}
        >
            {boxes.map((box) => (
                <div
                    key={box.id}
                    style={{
                        position: 'absolute',
                        left: `${scalePosition(box.x)}px`,
                        top: `${scalePosition(-box.y)}px`,
                        width: isHovered ? boxSize * 1.5 : boxSize,
                        height: isHovered ? boxSize * 1.5 : boxSize,
                        backgroundColor: getBoxColor(box.type),
                        transform: 'translate(-50%, -50%)',
                        transition: 'all 0.3s ease',
                    }}
                />
            ))}
            <div style={{
                position: 'absolute',
                left: `${visibleAreaX}px`,
                top: `${visibleAreaY}px`,
                width: `${visibleAreaWidth}px`,
                height: `${visibleAreaHeight}px`,
                border: `2px solid ${viewRectColor}`,
                pointerEvents: 'none',
                transition: 'all 0.3s ease',
            }} />
            <button
                style={{
                    position: 'absolute',
                    top: '5px',
                    right: '5px',
                    background: 'rgba(255, 255, 255, 0.7)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    opacity: isHovered ? 1 : 0.6,
                }}
                onClick={handleReset}
            >
                ↻
            </button>
        </div>
    );
};

export default MiniMap;