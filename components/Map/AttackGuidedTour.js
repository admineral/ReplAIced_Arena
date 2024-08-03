// components/Map/AttackGuidedTour.js

import React from 'react';

const AttackGuidedTour = ({ step, selectedBox, targetBox, isAttacking }) => {
  const steps = [
    "Select the first box to start the attack.",
    "Now select the target box.",
    "Confirm the attack or select different boxes."
  ];

  if (isAttacking) {
    return null; // Don't render anything during the attack animation
  }

  return (
    <div className="bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg text-center whitespace-nowrap">
      <p className="text-sm font-semibold">{steps[step]}</p>
      {step === 2 && (
        <p className="text-xs mt-1">
          Attacking from {selectedBox?.type} to {targetBox?.type}
        </p>
      )}
    </div>
  );
};

export default AttackGuidedTour;