import { useState, useCallback, useEffect } from 'react';

const useAttackManager = (boxes, mode, setMode, setTooltip) => {
  const [selectedBox, setSelectedBox] = useState(null);
  const [targetBox, setTargetBox] = useState(null);
  const [isAttacking, setIsAttacking] = useState(false);
  const [isAttackModeAvailable, setIsAttackModeAvailable] = useState(false);

  useEffect(() => {
    setIsAttackModeAvailable(boxes.length >= 2);
    
    if (mode === 'attack' && boxes.length < 2) {
      setMode('create');
      setTooltip('You need at least 2 boxes to enable attack mode. Add another box.');
    }
  }, [boxes, mode, setMode, setTooltip]);

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