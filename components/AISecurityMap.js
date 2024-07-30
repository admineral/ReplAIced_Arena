"use client"
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { v4 as uuidv4 } from 'uuid';
import MiniMap from './MiniMap';
import ChallengeModal from './ChallengeModal';
import BoxConfigForm from './BoxConfigForm';
import { Nodes, Node } from './NodeSystem';

const MAP_SIZE = 20;

const WebGLErrorHandler = () => {
  const { gl } = useThree();
  const [hasWebGLError, setHasWebGLError] = useState(false);

  useEffect(() => {
    if (!gl || !gl.canvas) return;

    const handleContextLost = (event) => {
      event.preventDefault();
      console.error('WebGL context lost');
      setHasWebGLError(true);
    };

    const handleContextRestored = () => {
      console.log('WebGL context restored');
      setHasWebGLError(false);
    };

    gl.canvas.addEventListener('webglcontextlost', handleContextLost);
    gl.canvas.addEventListener('webglcontextrestored', handleContextRestored);

    return () => {
      if (gl && gl.canvas) {
        gl.canvas.removeEventListener('webglcontextlost', handleContextLost);
        gl.canvas.removeEventListener('webglcontextrestored', handleContextRestored);
      }
    };
  }, [gl]);

  if (hasWebGLError) {
    return (
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        zIndex: 1000
      }}>
        <p>WebGL context lost. Please refresh the page or try a different browser.</p>
      </div>
    );
  }

  return null;
};

const AISecurityMap = () => {
  const [boxes, setBoxes] = useState([]);
  const [selectedBox, setSelectedBox] = useState(null);
  const [mode, setMode] = useState('create');
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isChallengeOpen, setIsChallengeOpen] = useState(false);
  const nodeRefs = useRef({});
  const [connections, setConnections] = useState([]);

  const addBox = useCallback(() => {
    const newBox = {
      id: uuidv4(),
      x: Math.random() * MAP_SIZE - MAP_SIZE / 2,
      y: Math.random() * MAP_SIZE - MAP_SIZE / 2,
      type: 'openai',
      challenge: 'New AI Challenge',
      difficulty: 'medium',
    };
    setBoxes(prevBoxes => [...prevBoxes, newBox]);
  }, []);

  useEffect(() => {
    const newConnections = boxes.map((box, index) => ({
      from: box.id,
      to: index < boxes.length - 1 ? boxes[index + 1].id : null
    })).filter(conn => conn.to !== null);
    setConnections(newConnections);
  }, [boxes]);

  const handleBoxClick = useCallback((box) => {
    if (mode === 'preview') {
      setSelectedBox(box);
      setIsChallengeOpen(true);
    } else {
      setSelectedBox(box.id === selectedBox?.id ? null : box);
    }
  }, [mode, selectedBox]);

  const handleBoxDoubleClick = useCallback((box) => {
    if (mode === 'create') {
      setSelectedBox(box);
      setIsConfigOpen(true);
    }
  }, [mode]);

  const updateBoxConfig = useCallback((updatedBox) => {
    setBoxes(prevBoxes => prevBoxes.map(box => 
      box.id === updatedBox.id ? updatedBox : box
    ));
    setIsConfigOpen(false);
    setSelectedBox(null);
  }, []);

  const updateBoxPosition = useCallback((id, x, y) => {
    setBoxes(prevBoxes => prevBoxes.map(box => 
      box.id === id ? { ...box, x, y } : box
    ));
  }, []);

  return (
    <div className="w-screen h-screen relative bg-gray-900">
      <Canvas orthographic camera={{ zoom: 50, position: [0, 0, 100] }}>
        <WebGLErrorHandler />
        <ambientLight />
        <Nodes>
          {boxes.map((box) => (
            <Node
              key={box.id}
              ref={el => nodeRefs.current[box.id] = el}
              name={box.type}
              color={box.type === 'openai' ? 'green' : box.type === 'claude' ? 'blue' : 'red'}
              position={[box.x, box.y, 0]}
              connectedTo={connections
                .filter(conn => conn.from === box.id)
                .map(conn => nodeRefs.current[conn.to])
                .filter(Boolean)}
              onClick={() => handleBoxClick(box)}
              onDoubleClick={() => handleBoxDoubleClick(box)}
              onDrag={(x, y) => updateBoxPosition(box.id, x, y)}
              mode={mode}
            />
          ))}
        </Nodes>
      </Canvas>
      <div className="absolute bottom-4 right-4">
        <MiniMap boxes={boxes} mapSize={MAP_SIZE} />
      </div>
      <div className="absolute top-4 right-4 flex flex-col space-y-2">
        <button
          onClick={addBox}
          className="bg-green-500 text-white rounded-full px-4 py-2 shadow-lg hover:bg-green-600 transition-colors duration-300"
        >
          Add Box
        </button>
        <button
          onClick={() => setMode(mode === 'create' ? 'preview' : 'create')}
          className="bg-blue-500 text-white rounded-full px-4 py-2 shadow-lg hover:bg-blue-600 transition-colors duration-300"
        >
          {mode === 'create' ? 'Switch to Preview' : 'Switch to Create'}
        </button>
      </div>
      {isConfigOpen && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <BoxConfigForm
            box={selectedBox}
            onUpdate={updateBoxConfig}
            onClose={() => {
              setIsConfigOpen(false);
              setSelectedBox(null);
            }}
          />
        </div>
      )}
      <ChallengeModal
        isOpen={isChallengeOpen}
        onClose={() => {
          setIsChallengeOpen(false);
          setSelectedBox(null);
        }}
        challenge={selectedBox}
      />
    </div>
  );
};

export default AISecurityMap;