/****************************************************************************
 * hooks/useAttack.js
 * 
 * Attack Management Hook
 * 
 * This custom hook manages the attack state and logic for the AI Security Map.
 * It handles the selection of attacker and target nodes, attack mode availability,
 * and attack confirmation.
 * 
 * Context:
 * - Part of the AI Security Map application
 * - Used in conjunction with MapContext and other custom hooks
 * 
 * Global State:
 * - selectedBox: The currently selected attacker node
 * - targetBox: The currently selected target node
 * - isAttacking: Boolean indicating if an attack is in progress
 * - isAttackModeAvailable: Boolean indicating if attack mode can be enabled
 * 
 * Key Functionalities:
 * 1. Monitors the number of boxes to determine attack mode availability
 * 2. Manages the selection of attacker and target nodes
 * 3. Provides functions to initiate, start, and confirm attacks
 * 4. Updates mode based on the current attack state
 ****************************************************************************/

import { useState, useCallback, useEffect } from 'react';

const useAttackManager = (boxes, mode, setMode) => {
  const [selectedBox, setSelectedBox] = useState(null);
  const [targetBox, setTargetBox] = useState(null);
  const [isAttacking, setIsAttacking] = useState(false);
  const [isAttackModeAvailable, setIsAttackModeAvailable] = useState(false);

  useEffect(() => {
    setIsAttackModeAvailable(boxes.length >= 2);
    
    if (mode === 'attack' && boxes.length < 2) {
      setMode('create');
    }
  }, [boxes, mode, setMode]);

  const initiateAttack = useCallback((attacker, target) => {
    setSelectedBox(attacker);
    setTargetBox(target);
  }, []);

  const startAttackAnimation = useCallback(() => {
    setIsAttacking(true);
  }, []);

  const confirmAttack = useCallback(() => {
    console.log(`Attacking from ${selectedBox.type} to ${targetBox.type}`);
    setIsAttacking(false);
    setSelectedBox(null);
    setTargetBox(null);
  }, [selectedBox, targetBox]);

  return { 
    selectedBox, 
    targetBox, 
    isAttacking, 
    isAttackModeAvailable, 
    initiateAttack,
    startAttackAnimation,
    confirmAttack 
  };
};

export default useAttackManager;