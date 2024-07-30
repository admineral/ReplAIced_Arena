"use client"
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { v4 as uuidv4 } from 'uuid';
import MiniMap from './MiniMap';
import ChallengeModal from './ChallengeModal';
import BoxConfigForm from './BoxConfigForm';
import { Nodes, Node } from './NodeSystem';
import AttackLine from './AttackLine';

const MAP_SIZE = 10;

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
  const [targetBox, setTargetBox] = useState(null);
  const [mode, setMode] = useState('create');
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isChallengeOpen, setIsChallengeOpen] = useState(false);
  const [isAttacking, setIsAttacking] = useState(false);
  const [isAttackModalOpen, setIsAttackModalOpen] = useState(false);
  const [tooltip, setTooltip] = useState('');
  const nodeRefs = useRef({});
  const [connections, setConnections] = useState([]);
  const [isAttackModeAvailable, setIsAttackModeAvailable] = useState(false);

  const addBox = useCallback(() => {
    const newBox = {
      id: uuidv4(),
      x: (Math.random() * MAP_SIZE - MAP_SIZE / 2) * 0.9,
      y: (Math.random() * MAP_SIZE - MAP_SIZE / 2) * 0.9,
      type: 'openai',
      challenge: 'New AI Challenge',
      difficulty: 'medium',
    };
    console.log('Adding new box:', newBox);
    setBoxes(prevBoxes => [...prevBoxes, newBox]);
  }, []);

  useEffect(() => {
    const newConnections = boxes.map((box, index) => ({
      from: box.id,
      to: index < boxes.length - 1 ? boxes[index + 1].id : null
    })).filter(conn => conn.to !== null);
    setConnections(newConnections);
    setIsAttackModeAvailable(boxes.length >= 2);
    
    if (mode === 'attack' && boxes.length < 2) {
      setMode('create');
      setTooltip('You need at least 2 boxes to enable attack mode. Add another box.');
    }
    console.log('Boxes updated:', boxes);
    console.log('Connections updated:', newConnections);
    console.log('Attack mode available:', boxes.length >= 2);
  }, [boxes, mode]);

  const handleBoxClick = useCallback((box) => {
    console.log('Box clicked:', box);
    if (mode === 'preview') {
      setSelectedBox(box);
      setIsChallengeOpen(true);
    } else if (mode === 'attack') {
      if (!selectedBox) {
        setSelectedBox(box);
        setTooltip('Now select a target node to attack');
      } else if (selectedBox.id !== box.id) {
        setTargetBox(box);
        setTooltip('Click the Attack button to initiate');
      }
    } else if (mode === 'create') {
      setSelectedBox(box.id === selectedBox?.id ? null : box);
    }
  }, [mode, selectedBox]);

  const handleBoxDoubleClick = useCallback((box) => {
    console.log('Box double-clicked:', box);
    if (mode === 'create') {
      setSelectedBox(box);
      setIsConfigOpen(true);
    }
  }, [mode]);

  const updateBoxConfig = useCallback((updatedBox) => {
    console.log('Updating box config:', updatedBox);
    setBoxes(prevBoxes => prevBoxes.map(box => 
      box.id === updatedBox.id ? updatedBox : box
    ));
    setIsConfigOpen(false);
    setSelectedBox(null);
  }, []);

  const updateBoxPosition = useCallback((id, x, y) => {
    setBoxes(prevBoxes => prevBoxes.map(box => {
      if (box.id === id) {
        const constrainedX = Math.max(Math.min(x, MAP_SIZE / 2), -MAP_SIZE / 2);
        const constrainedY = Math.max(Math.min(y, MAP_SIZE / 2), -MAP_SIZE / 2);
        console.log(`Box ${id} position updated:`, { x: constrainedX, y: constrainedY });
        return { ...box, x: constrainedX, y: constrainedY };
      }
      return box;
    }));
  }, []);

  const handleAttack = useCallback(() => {
    if (selectedBox && targetBox) {
      console.log('Initiating attack:', { from: selectedBox, to: targetBox });
      setIsAttackModalOpen(true);
    }
  }, [selectedBox, targetBox]);

  const confirmAttack = useCallback(() => {
    setIsAttacking(true);
    setIsAttackModalOpen(false);
    console.log(`Attacking from ${selectedBox.type} to ${targetBox.type}`);
    setTimeout(() => {
      setIsAttacking(false);
      setSelectedBox(null);
      setTargetBox(null);
      setTooltip('Select a node to start a new attack');
    }, 5000); 
  }, [selectedBox, targetBox]);

  const switchMode = useCallback((newMode) => {
    console.log('Switching mode to:', newMode);
    if (newMode === 'attack' && !isAttackModeAvailable) {
      setTooltip('You need at least 2 boxes to enable attack mode. Add another box.');
      return;
    }
    setMode(newMode);
    setSelectedBox(null);
    setTargetBox(null);
    setIsAttacking(false);
    setTooltip(newMode === 'attack' ? 'Select a node to start the attack' : '');
  }, [isAttackModeAvailable]);

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
              color={
                box.id === selectedBox?.id ? 'yellow' :
                box.id === targetBox?.id ? 'red' :
                box.type === 'openai' ? 'green' :
                box.type === 'claude' ? 'blue' : 'gray'
              }
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
          {isAttacking && selectedBox && targetBox && (
            <AttackLine
              start={new THREE.Vector3(selectedBox.x, selectedBox.y, 0)}
              end={new THREE.Vector3(targetBox.x, targetBox.y, 0)}
              duration={12}
            />
          )}
        </Nodes>
      </Canvas>
      <div className="absolute bottom-4 right-4">
        <MiniMap boxes={boxes} mapSize={MAP_SIZE} />
      </div>
      <div className="absolute top-0 left-0 right-0 flex justify-center space-x-4 p-4 bg-gray-800 bg-opacity-50">
        <button
          onClick={() => switchMode('create')}
          className={`px-6 py-3 rounded-t-lg font-bold text-white transition-colors duration-300 ${
            mode === 'create' ? 'bg-green-500' : 'bg-gray-600 hover:bg-green-400'
          }`}
        >
          Create
        </button>
        <button
          onClick={() => switchMode('preview')}
          className={`px-6 py-3 rounded-t-lg font-bold text-white transition-colors duration-300 ${
            mode === 'preview' ? 'bg-blue-500' : 'bg-gray-600 hover:bg-blue-400'
          }`}
        >
          Preview
        </button>
        <button
          onClick={() => switchMode('attack')}
          className={`px-6 py-3 rounded-t-lg font-bold text-white transition-colors duration-300 ${
            mode === 'attack' ? 'bg-red-500' : 'bg-gray-600 hover:bg-red-400'
          } ${!isAttackModeAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!isAttackModeAvailable}
        >
          Attack
        </button>
      </div>
      {(mode === 'create' || (mode === 'attack' && boxes.length < 2)) && (
        <button
          onClick={addBox}
          className="absolute top-20 left-4 bg-green-500 text-white rounded-full px-4 py-2 shadow-lg hover:bg-green-600 transition-colors duration-300"
        >
          Add Box
        </button>
      )}
      {mode === 'attack' && selectedBox && targetBox && (
        <button
          onClick={handleAttack}
          className="absolute top-20 left-4 bg-red-500 text-white rounded-full px-4 py-2 shadow-lg hover:bg-red-600 transition-colors duration-300"
        >
          Attack
        </button>
      )}
      {tooltip && (
        <div className="absolute bottom-4 left-4 bg-gray-800 text-white p-2 rounded-lg">
          {tooltip}
        </div>
      )}
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
      {isAttackModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Confirm Attack</h2>
            <p>Are you sure you want to attack from {selectedBox.type} to {targetBox.type}?</p>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setIsAttackModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmAttack}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Confirm Attack
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AISecurityMap;