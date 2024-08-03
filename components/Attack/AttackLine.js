import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { QuadraticBezierLine } from '@react-three/drei';
import * as THREE from 'three';
import { useMapContext } from '../../contexts/MapContext';

const AttackLine = ({ attackerId, targetId, duration = 5000, startTime }) => {
  const ref = useRef();
  const { boxes } = useMapContext();
  const [progress, setProgress] = useState(0);
  
  const start = useMemo(() => {
    const attacker = boxes.find(box => box.id === attackerId);
    return attacker ? new THREE.Vector3(attacker.x, attacker.y, attacker.z || 0) : null;
  }, [boxes, attackerId]);

  const end = useMemo(() => {
    const target = boxes.find(box => box.id === targetId);
    return target ? new THREE.Vector3(target.x, target.y, target.z || 0) : null;
  }, [boxes, targetId]);

  const mid = useMemo(() => {
    if (start && end) {
      return new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    }
    return null;
  }, [start, end]);

  const control = useMemo(() => {
    if (mid) {
      return new THREE.Vector3(mid.x, mid.y + 2, mid.z);
    }
    return null;
  }, [mid]);

  useFrame(() => {
    if (ref.current) {
      ref.current.material.dashOffset -= 0.1; // Adjust speed here

      const elapsedTime = Date.now() - startTime;
      const newProgress = Math.min(elapsedTime / duration, 1);
      setProgress(newProgress);
    }
  });

  if (!start || !end || !mid || !control || progress >= 1) {
    return null;
  }

  return (
    <group>
      <QuadraticBezierLine
        ref={ref}
        start={start}
        end={end}
        mid={control}
        color="red"
        lineWidth={2}
        dashed
        dashScale={50}
        gapSize={20}
        segments={50}
        progress={progress}
      />
      <QuadraticBezierLine
        start={start}
        end={end}
        mid={control}
        color="red"
        lineWidth={0.5}
        transparent
        opacity={0.1}
      />
    </group>
  );
};

export default AttackLine;