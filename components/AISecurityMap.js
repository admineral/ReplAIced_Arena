"use client"
import React, { useState, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { v4 as uuidv4 } from 'uuid';
import MiniMap from './MiniMap';
import ModalManager from './ModalManager';
import useAttackManager from '../hooks/useAttackManager';
import { Nodes, Node } from './NodeSystem';
import AttackLine from './AttackLine';
import WebGLErrorHandler from './WebGLErrorHandler';

const MAP_SIZE = 20;

const AISecurityMap = () => {
  const [boxes, setBoxes] = useState([]);
  const [connections, setConnections] = useState([]);
  const { selectedBox, targetBox, isAttacking, initiateAttack, confirmAttack } = useAttackManager();
  const [mode, setMode] = useState('create');
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isChallengeOpen, setIsChallengeOpen] = useState(false);
  const [isAttackModalOpen, setIsAttackModalOpen] = useState(false);
  const [tooltip, setTooltip] = useState('');
  const [isAttackModeAvailable, setIsAttackModeAvailable] = useState(false);
  const [selectedModel, setSelectedModel] = useState('default');

  const addBox = useCallback((type) => {
    const newBox = {
      id: uuidv4(),
      x: (Math.random() * MAP_SIZE - MAP_SIZE / 2) * 0.9,
      y: (Math.random() * MAP_SIZE - MAP_SIZE / 2) * 0.9,
      type,
      challenge: 'New AI Challenge',
      difficulty: 'medium',
    };
    setBoxes(prevBoxes => {
      const updatedBoxes = [...prevBoxes, newBox];
      updateConnections(updatedBoxes);
      return updatedBoxes;
    });
  }, []);

  const updateConnections = useCallback((updatedBoxes) => {
    const newConnections = updatedBoxes.map((box, index) => ({
      from: box.id,
      to: index < updatedBoxes.length - 1 ? updatedBoxes[index + 1].id : null
    })).filter(conn => conn.to !== null);
    setConnections(newConnections);
  }, []);

  const updateBox = useCallback((updatedBox) => {
    setBoxes(prevBoxes => prevBoxes.map(box => 
      box.id === updatedBox.id ? { ...box, ...updatedBox } : box
    ));
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

  useEffect(() => {
    setIsAttackModeAvailable(boxes.length >= 2);
    
    if (mode === 'attack' && boxes.length < 2) {
      setMode('create');
      setTooltip('You need at least 2 boxes to enable attack mode. Add another box.');
    }
  }, [boxes, mode]);

  const handleAddBox = useCallback(() => {
    addBox(selectedModel);
  }, [addBox, selectedModel]);

  const handleBoxClick = useCallback((boxId) => {
    const box = boxes.find(b => b.id === boxId);
    if (box) {
      if (mode === 'preview') {
        initiateAttack(box);
        setIsChallengeOpen(true);
      } else if (mode === 'attack') {
        if (!selectedBox) {
          initiateAttack(box);
          setTooltip('Now select a target node to attack');
        } else if (selectedBox.id !== box.id) {
          initiateAttack(selectedBox, box);
          setTooltip('Click the Attack button to initiate');
        } else {
          initiateAttack(null);
          setTooltip('Select a node to start the attack');
        }
      } else if (mode === 'create') {
        initiateAttack(box.id === selectedBox?.id ? null : box);
      }
    }
  }, [mode, selectedBox, boxes, initiateAttack]);

  const handleBoxDoubleClick = useCallback((boxId) => {
    if (mode === 'create') {
      const box = boxes.find(b => b.id === boxId);
      if (box) {
        initiateAttack(box);
        setIsConfigOpen(true);
      }
    }
  }, [mode, boxes, initiateAttack]);

  const handleAttack = useCallback(() => {
    if (selectedBox && targetBox) {
      setIsAttackModalOpen(true);
    }
  }, [selectedBox, targetBox]);

  const handleConfirmAttack = useCallback(() => {
    confirmAttack();
    setIsAttackModalOpen(false);
    setTimeout(() => {
      setTooltip('Select a node to start a new attack');
    }, 5000);
  }, [confirmAttack]);

  const switchMode = useCallback((newMode) => {
    if (newMode === 'attack' && !isAttackModeAvailable) {
      setTooltip('You need at least 2 boxes to enable attack mode. Add another box.');
      return;
    }
    setMode(newMode);
    initiateAttack(null);
    setTooltip(newMode === 'attack' ? 'Select a node to start the attack' : '');
  }, [isAttackModeAvailable, initiateAttack]);

  const handleDrag = useCallback((id, x, y) => {
    updateBoxPosition(id, x, y);
  }, [updateBoxPosition]);

  return (
    <div className="w-screen h-screen relative bg-gray-900">
      <Canvas orthographic camera={{ zoom: 50, position: [0, 0, 100] }}>
        <WebGLErrorHandler />
        <ambientLight />
        <Nodes>
          {boxes.map((box) => (
            <Node
              key={box.id}
              id={box.id}
              position={[box.x, box.y, 0]}
              color={
                box.id === selectedBox?.id ? 'yellow' :
                box.id === targetBox?.id ? 'red' :
                box.type === 'openai' ? 'green' :
                box.type === 'gemini' ? 'purple' :
                box.type === 'claude' ? 'blue' :
                box.type === 'meta' ? 'orange' :
                'gray'
              }
              connectedTo={connections
                .filter(conn => conn.from === box.id)
                .map(conn => boxes.find(b => b.id === conn.to))
                .filter(Boolean)}
              onClick={() => handleBoxClick(box.id)}
              onDoubleClick={() => handleBoxDoubleClick(box.id)}
              onDrag={handleDrag}
              mode={mode}
              modelType={box.type}
            />
          ))}
          {isAttacking && selectedBox && targetBox && (
            <AttackLine
              start={[selectedBox.x, selectedBox.y, 0]}
              end={[targetBox.x, targetBox.y, 0]}
            />
          )}
        </Nodes>
      </Canvas>
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
        <div className="absolute top-20 left-4 flex items-center space-x-2">
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-white text-gray-800 rounded-lg px-3 py-2 shadow-lg"
          >
            <option value="default">Default</option>
            <option value="openai">OpenAI</option>
            <option value="gemini">Gemini</option>
            <option value="claude">Claude</option>
            <option value="meta">Meta</option>
          </select>
          <button
            onClick={handleAddBox}
            className="bg-green-500 text-white rounded-full px-4 py-2 shadow-lg hover:bg-green-600 transition-colors duration-300"
          >
            Add Box
          </button>
        </div>
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
      <MiniMap boxes={boxes} mapSize={MAP_SIZE} />
      <ModalManager
        isConfigOpen={isConfigOpen}
        isChallengeOpen={isChallengeOpen}
        isAttackModalOpen={isAttackModalOpen}
        selectedBox={selectedBox}
        targetBox={targetBox}
        onConfigUpdate={updateBox}
        onAttackConfirm={handleConfirmAttack}
        setIsConfigOpen={setIsConfigOpen}
        setIsChallengeOpen={setIsChallengeOpen}
        setIsAttackModalOpen={setIsAttackModalOpen}
      />
    </div>
  );
};

export default AISecurityMap;