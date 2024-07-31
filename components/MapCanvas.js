import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Nodes, Node } from './NodeSystem';
import AttackLine from './AttackLine';
import WebGLErrorHandler from './Error/WebGLErrorHandler';
import { useMapContext } from '../contexts/MapContext';
import * as THREE from 'three';

const MapCanvas = () => {
  const {
    boxes,
    connections,
    selectedBox,
    targetBox,
    isAttacking,
    mode,
    handleBoxClick,
    handleBoxDoubleClick,
    handleDrag,
  } = useMapContext();

  return (
    <Canvas orthographic camera={{ zoom: 50, position: [0, 0, 100] }}>
      <WebGLErrorHandler />
      <ambientLight />
      <Nodes>
        {boxes.map((box) => (
          <Node
            key={box.id}
            id={box.id}
            position={[box.x, box.y, 0]}
            modelType={box.type}
            connectedTo={connections
              .filter(conn => conn.from === box.id)
              .map(conn => boxes.find(b => b.id === conn.to))
              .filter(Boolean)}
            onDrag={handleDrag}
            mode={mode}
            onClick={() => handleBoxClick(box.id)}
            onDoubleClick={() => handleBoxDoubleClick(box.id)}
            color={
              box.id === selectedBox?.id ? 'yellow' :
              box.id === targetBox?.id ? 'red' :
              box.type === 'openai' ? 'green' :
              box.type === 'gemini' ? 'purple' :
              box.type === 'claude' ? 'blue' :
              box.type === 'meta' ? 'orange' :
              'gray'
            }
          />
        ))}
      </Nodes>
      {isAttacking && selectedBox && targetBox && (
        <AttackLine
          start={new THREE.Vector3(selectedBox.x, selectedBox.y, 0)}
          end={new THREE.Vector3(targetBox.x, targetBox.y, 0)}
        />
      )}
    </Canvas>
  );
};

export default MapCanvas;