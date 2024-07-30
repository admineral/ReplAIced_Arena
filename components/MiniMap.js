import React from 'react';

const MiniMap = ({ boxes, mapSize }) => {
    const miniMapSize = 150;
    const boxSize = 3;
    const padding = 5;

    const scalePosition = (value) => {
        // Map [-mapSize/2, mapSize/2] to [padding, miniMapSize - padding]
        return ((value + mapSize / 2) / mapSize) * (miniMapSize - 2 * padding) + padding;
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
                        backgroundColor: box.type === 'openai' ? 'green' : box.type === 'claude' ? 'blue' : 'red',
                        transform: 'translate(-50%, -50%)', // Center the dot on its position
                    }}
                />
            ))}
        </div>
    );
};

export default MiniMap;