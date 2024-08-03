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
    <div className="fixed inset-x-0 bottom-8 flex justify-center items-center z-50 pointer-events-none">
      <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg max-w-md text-center">
        <p className="text-xl font-bold mb-2">{steps[step]}</p>
        {step === 2 && (
          <p className="text-sm">
            Attacking from {selectedBox?.type} to {targetBox?.type}
          </p>
        )}
      </div>
    </div>
  );
};

export default AttackGuidedTour;