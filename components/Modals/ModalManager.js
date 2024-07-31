/****************************************************************************
 * components/Modals/ModalManager.js
 * 
 * Modal Manager Component for AI Security Map
 * 
 * This component manages the rendering of various modal dialogs used in the 
 * AI Security Map application. It conditionally renders the appropriate modal 
 * based on the current application state.
 * 
 * Context:
 * - Part of the AI Security Map application's UI
 * - Used within the main AISecurityMap component
 * 
 * Managed Modals:
 * 1. BoxConfigForm: For configuring box (node) properties
 * 2. ChallengeModal: For displaying challenge information
 * 3. AttackConfirmationModal: For confirming attack actions
 * 
 * Props:
 * - isConfigOpen: Boolean to control BoxConfigForm visibility
 * - isChallengeOpen: Boolean to control ChallengeModal visibility
 * - isAttackModalOpen: Boolean to control AttackConfirmationModal visibility
 * - selectedBox: Currently selected box data
 * - targetBox: Target box data for attack
 * - onConfigUpdate: Function to handle box configuration updates
 * - onAttackConfirm: Function to handle attack confirmation
 * - setIsConfigOpen: Function to update BoxConfigForm visibility
 * - setIsChallengeOpen: Function to update ChallengeModal visibility
 * - setIsAttackModalOpen: Function to update AttackConfirmationModal visibility
 * 
 * Note: This component doesn't manage the state of modal visibility itself,
 * but rather receives this state as props and passes it down to child components.
 ****************************************************************************/



import React from 'react';
import ChallengeModal from './ChallengeModal';
import BoxConfigForm from './BoxConfigFormModal';
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