import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { Nodes, Node } from '../Nodes/NodeSystem';
import AttackLine from '../Attack/AttackLine';
import WebGLErrorHandler from '../Error/WebGLErrorHandler';
import { useMapContext } from '../../contexts/MapContext';
import * as THREE from 'three';
import mapConfig from '../../config/mapConfig';
import { useDrag } from '@use-gesture/react';

const CameraController = () => {
  const { camera } = useThree();
  const { mapPosition, mapZoom } = useMapContext();

  useEffect(() => {
    console.log('CameraController: Updating camera position:', mapPosition);
    camera.position.set(mapPosition.x, mapPosition.y, 100);
    camera.zoom = mapZoom * 50;
    camera.updateProjectionMatrix();
  }, [camera, mapPosition, mapZoom]);

  return null;
};

const AttackManager = ({ activeAttacks, setActiveAttacks }) => {
  useFrame(() => {
    const currentTime = Date.now();
    setActiveAttacks(prevAttacks => 
      prevAttacks.filter(attack => currentTime - attack.startTime < attack.duration)
    );
  });

  return (
    <>
      {activeAttacks.map((attack) => (
        <AttackLine
          key={attack.id}
          attackerId={attack.attackerId}
          targetId={attack.targetId}
          duration={attack.duration}
          startTime={attack.startTime}
          color="red"
          dashSize={2}
          gapSize={1}
        />
      ))}
    </>
  );
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
    handleBoxDrag,
    mapPosition,
    mapZoom,
    handleMapPositionChange,
    handleMapZoomChange,
    handleCanvasDrag,
    handleZoom,
    attackReplay
  } = useMapContext();

  const { attackMarkers, currentTime, triggerAttackVisualizationRef } = attackReplay;

  const canvasRef = useRef();
  const [isOverNode, setIsOverNode] = useState(false);
  const dragStartPosition = useRef(null);
  const [activeAttacks, setActiveAttacks] = useState([]);

  // Filter current attacks based on the replay time
  const currentAttacks = useMemo(() => {
    return attackMarkers.filter(attack => attack.time <= currentTime);
  }, [attackMarkers, currentTime]);

  const handleDragStart = useCallback((id, x, y) => {
    dragStartPosition.current = { id, x, y };
    console.log(`Drag start: Box ${id} at (${x}, ${y})`);
  }, []);

  const handleDragEnd = useCallback((id, x, y) => {
    if (dragStartPosition.current && dragStartPosition.current.id === id) {
      const { x: startX, y: startY } = dragStartPosition.current;
      console.log(`Drag end: Box ${id} moved from (${startX}, ${startY}) to (${x}, ${y})`);
      handleBoxDrag(id, x, y);
    }
    dragStartPosition.current = null;
  }, [handleBoxDrag]);

  // Handle canvas dragging
  const bind = useDrag(({ delta: [dx, dy], event }) => {
    if (!isOverNode) {
      event.stopPropagation();
      const dragSpeedFactor = mapConfig.dragSpeed / mapZoom;
      const moveX = mapConfig.invertDragX ? -dx : dx;
      const moveY = mapConfig.invertDragY ? -dy : dy;
      handleCanvasDrag(moveX * dragSpeedFactor, moveY * dragSpeedFactor);
    }
  }, { filterTaps: true });

  // Handle zoom with mouse wheel
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e) => {
      e.preventDefault();
      handleZoom(e.deltaY > 0 ? -1 : 1);
    };

    canvas.addEventListener('wheel', handleWheel);

    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [handleZoom]);

  // Set up attack visualization trigger
  useEffect(() => {
    triggerAttackVisualizationRef.current = (attack) => {
      setActiveAttacks(prevAttacks => [
        ...prevAttacks,
        { ...attack, startTime: Date.now(), duration: 5000 } // 5 seconds duration
      ]);
    };
  }, [triggerAttackVisualizationRef]);

  return (
    <div 
      style={{ 
        width: '100%', 
        height: '100%', 
        touchAction: 'none',
        position: 'relative',
        overflow: 'hidden',
        pointerEvents: 'auto'
      }}
    >
      <Canvas
        ref={canvasRef}
        orthographic
        camera={{
          zoom: mapConfig.initialZoom * 50,
          position: [mapConfig.initialPosition.x, mapConfig.initialPosition.y, 100]
        }}
        style={{ width: '100%', height: '100%' }}
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
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
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
        {/* Render active attack line */}
        {isAttacking && selectedBox && targetBox && (
          <AttackLine
            attackerId={selectedBox.id}
            targetId={targetBox.id}
          />
        )}
        {/* Render attack lines for replay */}
        {currentAttacks.map((attack) => (
          <AttackLine
            key={attack.id}
            attackerId={attack.attackerId}
            targetId={attack.targetId}
            color="red"
            dashSize={2}
            gapSize={1}
          />
        ))}
        {/* Render active attacks */}
        <AttackManager activeAttacks={activeAttacks} setActiveAttacks={setActiveAttacks} />
      </Canvas>
    </div>
  );
};

export default MapCanvas;