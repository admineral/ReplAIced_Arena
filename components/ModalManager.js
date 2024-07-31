import React from 'react';
import ChallengeModal from './ChallengeModal';
import BoxConfigForm from './BoxConfigForm';
import AttackConfirmationModal from './AttackConfirmationModal';

const ModalManager = ({
  isConfigOpen,
  isChallengeOpen,
  isAttackModalOpen,
  selectedBox,
  targetBox,
  onConfigUpdate,
  onAttackConfirm,
  setIsConfigOpen,
  setIsChallengeOpen,
  setIsAttackModalOpen
}) => {
  return (
    <>
      {isConfigOpen && selectedBox && (
        <BoxConfigForm
          box={selectedBox}
          onUpdate={onConfigUpdate}
          onClose={() => setIsConfigOpen(false)}
        />
      )}
      <ChallengeModal
        isOpen={isChallengeOpen}
        onClose={() => setIsChallengeOpen(false)}
        challenge={selectedBox}
      />
      {isAttackModalOpen && selectedBox && targetBox && (
        <AttackConfirmationModal
          selectedBox={selectedBox}
          targetBox={targetBox}
          onConfirm={onAttackConfirm}
          onClose={() => setIsAttackModalOpen(false)}
        />
      )}
    </>
  );
};

export default ModalManager;