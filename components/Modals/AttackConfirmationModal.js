/****************************************************************************
 * components/Modals/AttackConfirmationModal.js
 * 
 * Attack Confirmation Modal for AI Security Map
 * 
 * This component renders a modal dialog that asks for confirmation before 
 * initiating an attack in the AI Security Map application. It displays the 
 * types of the selected (attacker) and target boxes, and provides options 
 * to confirm or cancel the attack.
 * 
 * Context:
 * - Part of the AI Security Map application's UI
 * - Used within the ModalManager component
 * 
 * Props:
 * - selectedBox: Object containing information about the attacking box
 * - targetBox: Object containing information about the target box
 * - onConfirm: Function to be called when the attack is confirmed
 * - onClose: Function to be called when the modal is closed or attack is cancelled
 * 
 * Key Features:
 * 1. Displays a confirmation message with attacker and target types
 * 2. Provides "Cancel" and "Confirm Attack" buttons
 * 3. Responsive design with a centered layout
 * 4. Uses a semi-transparent overlay to focus attention on the modal
 * 
 * Note: This component uses Tailwind CSS for styling. Ensure that Tailwind CSS
 * is properly configured in your project for the styles to take effect.
 ****************************************************************************/




import React from 'react';

const AttackConfirmationModal = ({ selectedBox, targetBox, onConfirm, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Confirm Attack</h2>
        <p>Are you sure you want to attack from {selectedBox.type} to {targetBox.type}?</p>
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Confirm Attack
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttackConfirmationModal;