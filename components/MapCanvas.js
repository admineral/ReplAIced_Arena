import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Nodes, Node } from './NodeSystem';
import AttackLine from './AttackLine';
import WebGLErrorHandler from './WebGLErrorHandler';

const MapCanvas = ({ 
  boxes, 
  connections, 
  isAttacking, 
  selectedBox, 
  targetBox, 
  updateBoxPosition, 
  mode, 
  onBoxClick, 
  onBoxDoubleClick,
  onDrag
}) => {
  return (
    <Canvas orthographic camera={{ zoom: 50, position: [0, 0, 100] }}>
      <WebGLErrorHandler />
      <ambientLight />
      <Nodes>
        {boxes.map((box) => (
            <Node
  key={box.id}
  id={box.id}
  x={box.x}
  y={box.y}
  modelType={box.type}
  connectedTo={connections
    .filter(conn => conn.from === box.id)
    .map(conn => boxes.find(b => b.id === conn.to))
    .filter(Boolean)}
  onDrag={onDrag}
  mode={mode}
  onClick={() => onBoxClick(box.id)}
  onDoubleClick={() => onBoxDoubleClick(box.id)}
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
          start={[selectedBox.x, selectedBox.y, 0]}
          end={[targetBox.x, targetBox.y, 0]}
        />
      )}
    </Canvas>
  );
};

export default MapCanvas; 