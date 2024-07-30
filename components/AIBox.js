import React, { useState, useEffect, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { useDrag } from '@use-gesture/react';
import * as THREE from 'three';

const CIRCLE_RADIUS = 0.5;
const SEGMENTS = 32;

const AIBox = ({ box, isSelected, onClick, onDoubleClick, onDragEnd, mode }) => {
  const { size, camera } = useThree();
  const [pos, setPos] = useState(() => new THREE.Vector3(box.x, box.y, 0));
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    document.body.style.cursor = hovered ? 'grab' : 'auto';
  }, [hovered]);

  const bind = useDrag(({ down, xy: [x, y] }) => {
    if (mode === 'create') {
      document.body.style.cursor = down ? 'grabbing' : 'grab';
      const newPos = new THREE.Vector3((x / size.width) * 2 - 1, -(y / size.height) * 2 + 1, 0)
        .unproject(camera)
        .multiply({ x: 1, y: 1, z: 0 })
        .clone();
      setPos(newPos);
      onDragEnd(box.id, newPos.x, newPos.y);
    }
  });

  const circleGeometry = useMemo(() => new THREE.CircleGeometry(CIRCLE_RADIUS, SEGMENTS), []);

  return (
    <group position={pos} {...bind()}>
      <mesh
        onClick={() => onClick(box)}
        onDoubleClick={() => onDoubleClick(box)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <primitive object={circleGeometry} />
        <meshBasicMaterial color={isSelected ? 'blue' : (hovered ? '#ff1050' : 'gray')} />
      </mesh>
      <Text position={[0, 0, 0.1]} fontSize={0.2} color="white" anchorX="center" anchorY="middle">
        {box.type}
      </Text>
    </group>
  );
};

export default AIBox;