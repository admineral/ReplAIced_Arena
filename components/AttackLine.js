import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { QuadraticBezierLine } from '@react-three/drei';
import * as THREE from 'three';

const AttackLine = ({ start, end, duration = 5 }) => {
  const ref = useRef();
  const mid = useMemo(() => new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5), [start, end]);
  const control = useMemo(() => new THREE.Vector3(mid.x, mid.y + 2, mid.z), [mid]);

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