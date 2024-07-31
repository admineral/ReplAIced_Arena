import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Nodes, Node } from './NodeSystem';
import AttackLine from './AttackLine';
import WebGLErrorHandler from './Error/WebGLErrorHandler';
import { useMapContext } from '../contexts/MapContext';
import * as THREE from 'three';
import mapConfig from '../config/mapConfig';
import { useDrag } from '@use-gesture/react';

const CameraController = () => {
  const { camera } = useThree();
  const { mapControls } = useMapContext();
  const { position, zoom } = mapControls;

  useEffect(() => {
    camera.position.set(position.x, position.y, 100);
    camera.zoom = zoom * 50;
    camera.updateProjectionMatrix();
  }, [camera, position, zoom]);

  return null;
};

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
    handleDrag: handleBoxDrag,
    mapControls
  } = useMapContext();

  const canvasRef = useRef();
  const [isOverNode, setIsOverNode] = useState(false);

  const bind = useDrag(({ delta: [dx, dy], event }) => {
    if (!isOverNode) {
      event.stopPropagation();
      const dragSpeedFactor = mapConfig.dragSpeed / mapControls.zoom;
      const moveX = mapConfig.invertDragX ? -dx : dx;
      const moveY = mapConfig.invertDragY ? -dy : dy;
      mapControls.handleDrag(moveX * dragSpeedFactor, moveY * dragSpeedFactor);
      console.log(`Dragging map: Movement (${dx}, ${dy})`);
    }
  }, { filterTaps: true });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e) => {
      e.preventDefault();
      mapControls.handleZoom(e.deltaY > 0 ? -1 : 1);
    };

    canvas.addEventListener('wheel', handleWheel);

    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [mapControls]);

  return (
    <Canvas
      ref={canvasRef}
      orthographic
      camera={{
        zoom: mapConfig.initialZoom * 50,
        position: [mapConfig.initialPosition.x, mapConfig.initialPosition.y, 100]
      }}
      {...bind()}
    >
      <WebGLErrorHandler />
      <CameraController />
      <ambientLight />
      <Nodes setIsOverNode={setIsOverNode}>
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
            mode={mode}
            onClick={() => handleBoxClick(box.id)}
            onDoubleClick={() => handleBoxDoubleClick(box.id)}
            onDrag={handleBoxDrag}
            color={
              box.id === selectedBox?.id ? 'yellow' :
              box.id === targetBox?.id ? 'red' :
              box.type === 'openai' ? 'green' :
              box.type === 'gemini' ? 'purple' :
              box.type === 'claude' ? 'blue' :
              box.type === 'meta' ? 'orange' :
              'gray'
            }
            setIsOverNode={setIsOverNode}
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