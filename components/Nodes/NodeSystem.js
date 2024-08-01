/****************************************************************************
 * components/NodeSystem.js
 * 
 * Node System for AI Security Map
 * 
 * This file defines the components for rendering and managing nodes (boxes) 
 * and their connections in the 3D space of the AI Security Map.
 * 
 * Context:
 * - Part of the AI Security Map application
 * - Used within the MapCanvas component
 * - Utilizes Three.js for 3D rendering
 * 
 * Key Components:
 * 1. Circle: A reusable circular mesh component
 * 2. Nodes: Manages the rendering of nodes and their connections
 * 3. Node: Individual node component with drag functionality
 * 
 * Functionalities:
 * - Rendering nodes with different colors based on AI model type
 * - Handling node interactions (click, double-click, drag)
 * - Drawing connections between nodes
 * - Loading and applying textures for node icons
 * 
 * Note: This component relies heavily on react-three-fiber and @react-three/drei
 * for 3D rendering within React.
 ****************************************************************************/

import * as THREE from 'three'
import React, { createContext, useMemo, useRef, useState, useContext, useLayoutEffect, forwardRef, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { QuadraticBezierLine, Text } from '@react-three/drei'
import { useDrag } from '@use-gesture/react'
import mapConfig from '../../config/mapConfig'

const context = createContext()

const Circle = forwardRef(({ children, opacity = 1, radius = 0.05, segments = 32, color = '#ff1050', ...props }, ref) => (
  <mesh ref={ref} {...props}>
    <circleGeometry args={[radius, segments]} />
    <meshBasicMaterial transparent={opacity < 1} opacity={opacity} color={color} />
    {children}
  </mesh>
))

export function Nodes({ children, setIsOverNode }) {
  const group = useRef()
  const [nodes, set] = useState([])
  const [lines, setLines] = useState([])

  useEffect(() => {
    const newLines = []
    for (let node of nodes) {
      if (node.connectedTo) {
        node.connectedTo
          .map((ref) => {
            if (ref.current && node.position) {
              return [node.position, ref.current.position]
            }
            return null
          })
          .filter(Boolean)
          .forEach(([start, end]) => {
            newLines.push({
              start: start.clone().add({ x: 0.35, y: 0, z: 0 }),
              end: end.clone().add({ x: -0.35, y: 0, z: 0 })
            })
          })
      }
    }
    setLines(newLines)
  }, [nodes])

  return (
    <context.Provider value={{ set, setIsOverNode }}>
      <group ref={group}>
        {lines.map((line, index) => (
          <group key={index}>
            <QuadraticBezierLine {...line} color="white" dashed dashScale={50} gapSize={20} />
            <QuadraticBezierLine {...line} color="white" lineWidth={0.5} transparent opacity={0.1} />
          </group>
        ))}
        {children}
        {lines.map(({ start, end }, index) => (
          <group key={index} position-z={1}>
            <Circle position={start} />
            <Circle position={end} />
          </group>
        ))}
      </group>
    </context.Provider>
  )
}

export const Node = forwardRef(({ id, position, color, name, connectedTo = [], onClick, onDoubleClick, onDragStart, onDragEnd, mode, modelType, setIsOverNode, ...props }, ref) => {
  const { set } = useContext(context)
  const { size, camera } = useThree()
  const [pos, setPos] = useState(() => new THREE.Vector3(...position))
  const state = useMemo(() => ({ position: pos, connectedTo }), [pos, connectedTo])
  
  useLayoutEffect(() => {
    set((nodes) => [...nodes, state])
    return () => void set((nodes) => nodes.filter((n) => n !== state))
  }, [state, set])

  useEffect(() => {
    setPos(new THREE.Vector3(...position))
  }, [position])

  const [hovered, setHovered] = useState(false)
  useEffect(() => void (document.body.style.cursor = hovered ? 'grab' : 'auto'), [hovered])

  const bind = useDrag(({ active, xy: [x, y], first, last }) => {
    if (mode === 'create') {
      document.body.style.cursor = active ? 'grabbing' : 'grab'
      const vec = new THREE.Vector3(
        (x / size.width) * 2 - 1,
        -(y / size.height) * 2 + 1,
        0
      )
      vec.unproject(camera)
      const newPos = new THREE.Vector3(vec.x, vec.y, 0)
      setPos(newPos)
      
      if (first) {
        onDragStart(id, newPos.x, newPos.y)
      }
      if (last) {
        onDragEnd(id, newPos.x, newPos.y)
      }
    }
  }, { filterTaps: true })

  const texture = useMemo(() => {
    const loader = new THREE.TextureLoader()
    switch (modelType) {
      case 'openai':
        return loader.load('/openai-logo.png')
      case 'gemini':
        return loader.load('/gemini-logo.png')
      case 'claude':
        return loader.load('/claude-logo.png')
      case 'meta':
        return loader.load('/meta-logo.png')
      default:
        return loader.load('/default-logo.png')
    }
  }, [modelType])

  return (
    <group position={pos}>
      <mesh 
        ref={ref} 
        {...bind()}
        onClick={(e) => { e.stopPropagation(); onClick(id); }}
        onDoubleClick={(e) => { e.stopPropagation(); onDoubleClick(id); }}
        onPointerOver={() => { setHovered(true); setIsOverNode(true); }}
        onPointerOut={() => { setHovered(false); setIsOverNode(false); }}
      >
        <circleGeometry args={[0.5, 32]} />
        <meshBasicMaterial color={color} opacity={0.2} transparent />
      </mesh>
      <mesh position={[0, 0, 0.1]}>
        <circleGeometry args={[0.25, 32]} />
        <meshBasicMaterial map={texture} transparent />
      </mesh>
    </group>
  )
})