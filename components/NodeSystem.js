import * as THREE from 'three'
import React, { createContext, useMemo, useRef, useState, useContext, useLayoutEffect, forwardRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { QuadraticBezierLine, Text } from '@react-three/drei'
import { useDrag } from '@use-gesture/react'

const context = createContext()

const Circle = forwardRef(({ children, opacity = 1, radius = 0.05, segments = 32, color = '#ff1050', ...props }, ref) => (
  <mesh ref={ref} {...props}>
    <circleGeometry args={[radius, segments]} />
    <meshBasicMaterial transparent={opacity < 1} opacity={opacity} color={color} />
    {children}
  </mesh>
))

export function Nodes({ children }) {
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

  useFrame((_, delta) => {
    if (group.current) {
      group.current.children.forEach((group) => {
        if (group.children[0] && group.children[0].material && group.children[0].material.uniforms) {
          group.children[0].material.uniforms.dashOffset.value -= delta * 10
        }
      })
    }
  })

  return (
    <context.Provider value={set}>
      <group ref={group}>
        {lines.map((line, index) => (
          <group key={index}>
            <QuadraticBezierLine {...line} color="white" dashed dashScale={50} gapSize={20} />
            <QuadraticBezierLine {...line} color="white" lineWidth={0.5} transparent opacity={0.1} />
          </group>
        ))}
      </group>
      {children}
      {lines.map(({ start, end }, index) => (
        <group key={index} position-z={1}>
          <Circle position={start} />
          <Circle position={end} />
        </group>
      ))}
    </context.Provider>
  )
}

export const Node = forwardRef(({ color = 'black', name, connectedTo = [], position = [0, 0, 0], onClick, onDoubleClick, onDrag, mode, ...props }, ref) => {
  const set = useContext(context)
  const { size, camera } = useThree()
  const [pos, setPos] = useState(() => new THREE.Vector3(...position))
  const state = useMemo(() => ({ position: pos, connectedTo }), [pos, connectedTo])
  useLayoutEffect(() => {
    set((nodes) => [...nodes, state])
    return () => void set((nodes) => nodes.filter((n) => n !== state))
  }, [state, pos, set])
  const [hovered, setHovered] = useState(false)
  useEffect(() => void (document.body.style.cursor = hovered ? 'grab' : 'auto'), [hovered])
  const bind = useDrag(({ down, xy: [x, y] }) => {
    if (mode === 'create') {
      document.body.style.cursor = down ? 'grabbing' : 'grab'
      const newPos = new THREE.Vector3((x / size.width) * 2 - 1, -(y / size.height) * 2 + 1, 0)
        .unproject(camera)
        .multiply({ x: 1, y: 1, z: 0 })
        .clone()
      setPos(newPos)
      onDrag(newPos.x, newPos.y)  // Call onDrag with new position
    }
  })
  return (
    <Circle ref={ref} {...bind()} opacity={0.2} radius={0.5} color={color} position={pos} {...props} onClick={onClick} onDoubleClick={onDoubleClick}>
      <Circle
        radius={0.25}
        position={[0, 0, 0.1]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        color={hovered ? '#ff1050' : color}>
        <Text position={[0, 0, 1]} fontSize={0.25}>
          {name}
        </Text>
      </Circle>
    </Circle>
  )
})