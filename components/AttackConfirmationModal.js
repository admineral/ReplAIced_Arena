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