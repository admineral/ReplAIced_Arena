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