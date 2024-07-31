/****************************************************************************
 * components/Modals/ChallengeModal.js
 * 
 * Challenge Modal Component for AI Security Map
 * 
 * This component renders a modal dialog that displays challenge information
 * for a selected node in the AI Security Map application. It uses Framer Motion
 * for entrance and exit animations.
 * 
 * Context:
 * - Part of the AI Security Map application's UI
 * - Used within the ModalManager component
 * 
 * Props:
 * - isOpen: Boolean to control the visibility of the modal
 * - onClose: Function to be called when the modal is closed
 * - challenge: Object containing challenge information (type, description, difficulty)
 * 
 * Key Features:
 * 1. Animated entrance and exit using Framer Motion
 * 2. Displays challenge type, description, and difficulty
 * 3. Responsive design with a fixed width and centered layout
 * 4. Close button to dismiss the modal
 * 
 * Note: This component uses Tailwind CSS for styling. Ensure that Tailwind CSS
 * is properly configured in your project for the styles to take effect.
 ****************************************************************************/



import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ChallengeModal = ({ isOpen, onClose, challenge }) => {
    if (!challenge) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
                >
                    <motion.div
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        className="bg-gray-800 rounded-lg p-6 w-96"
                    >
                        <h2 className="text-2xl text-white mb-4">{challenge.type} Challenge</h2>
                        <p className="text-white mb-4">{challenge.challenge}</p>
                        <p className="text-white mb-4">Difficulty: {challenge.difficulty}</p>
                        <button
                            onClick={onClose}
                            className="bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600"
                        >
                            Close
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ChallengeModal;