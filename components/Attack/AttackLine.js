/****************************************************************************
 * components/AttackLine.js
 * 
 * Attack Line Component for AI Security Map
 * 
 * This component renders an animated attack line between two points in the 
 * 3D space of the AI Security Map. It uses a quadratic bezier curve to create
 * an arched line effect.
 * 
 * Context:
 * - Part of the AI Security Map application's 3D visualization
 * - Used within the MapCanvas component during attack animations
 * 
 * Props:
 * - start: THREE.Vector3 representing the starting point of the line
 * - end: THREE.Vector3 representing the ending point of the line
 * - duration: Number of seconds the line should persist before being removed
 * 
 * Key Functionalities:
 * 1. Rendering a dashed, animated line between two points
 * 2. Creating an arched effect using a quadratic bezier curve
 * 3. Animating the line dash offset for a moving effect
 * 4. Auto-removing the line after a specified duration
 * 
 * Note: This component relies on @react-three/fiber and @react-three/drei
 * for 3D rendering within React. Ensure these dependencies are installed
 * and properly configured in your project.
 ****************************************************************************/


// components/Attack/AttackLine.js

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { QuadraticBezierLine } from '@react-three/drei';
import * as THREE from 'three';
import { useMapContext } from '../../contexts/MapContext';

const AttackLine = ({ attackerId, targetId, duration = 5 }) => {
  const ref = useRef();
  const { boxes } = useMapContext();
  
  const start = useMemo(() => {
    const attacker = boxes.find(box => box.id === attackerId);
    return attacker ? new THREE.Vector3(attacker.x, attacker.y, attacker.z) : null;
  }, [boxes, attackerId]);

  const end = useMemo(() => {
    const target = boxes.find(box => box.id === targetId);
    return target ? new THREE.Vector3(target.x, target.y, target.z) : null;
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

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.material.dashOffset -= delta * 10; // Adjust speed here
    }
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      if (ref.current) {
        ref.current.parent.remove(ref.current);
      }
    }, duration * 1000);

    return () => clearTimeout(timer);
  }, [duration]);

  if (!start || !end || !mid || !control) {
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