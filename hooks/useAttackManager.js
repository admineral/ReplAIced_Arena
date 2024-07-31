import { useState, useCallback } from 'react';

const useAttackManager = () => {
  const [selectedBox, setSelectedBox] = useState(null);
  const [targetBox, setTargetBox] = useState(null);
  const [isAttacking, setIsAttacking] = useState(false);

  const initiateAttack = useCallback((attacker, target) => {
    setSelectedBox(attacker);
    setTargetBox(target);
    setIsAttacking(true);
  }, []);

  const confirmAttack = useCallback(() => {
    // Implement attack logic here
    console.log(`Attacking from ${selectedBox.type} to ${targetBox.type}`);
    setIsAttacking(false);
    setSelectedBox(null);
    setTargetBox(null);
  }, [selectedBox, targetBox]);

  return { selectedBox, targetBox, isAttacking, initiateAttack, confirmAttack };
};

export default useAttackManager;