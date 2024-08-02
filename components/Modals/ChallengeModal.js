/****************************************************************************
 * components/Modals/ChallengeModal.js
 * 
 * Challenge Modal Component for AI Security Map
 * 
 * This component renders an interactive modal dialog for the challenge feature
 * in the AI Security Map application. It displays challenge information and
 * provides a chat-like interface for interaction.
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
 * 3. Interactive chat interface for challenge attempts
 * 4. Responsive design with a larger, more detailed layout
 * 5. Close button to dismiss the modal
 * 
 * Note: This component uses Tailwind CSS for styling. Ensure that Tailwind CSS
 * is properly configured in your project for the styles to take effect.
 ****************************************************************************/

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

const modelLogos = {
  default: '/default-logo.png',
  openai: '/openai-logo.png',
  gemini: '/gemini-logo.png',
  claude: '/claude-logo.png',
  meta: '/meta-logo.png',
};

const difficultyColors = {
  easy: 'bg-green-500',
  medium: 'bg-yellow-500',
  hard: 'bg-red-500',
};

const ChallengeModal = ({ isOpen, onClose, challenge }) => {
    const [chatMessages, setChatMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');

    if (!challenge) return null;

    const handleSendMessage = () => {
        if (inputMessage.trim()) {
            setChatMessages([...chatMessages, { sender: 'User', text: inputMessage }]);
            setInputMessage('');
            // Simulated AI response - replace with actual AI interaction logic
            setTimeout(() => {
                setChatMessages(prev => [...prev, { sender: 'AI', text: 'This is a simulated AI response.' }]);
            }, 1000);
        }
    };

    const renderCreatedBy = (createdBy) => {
        if (typeof createdBy === 'string') {
            return createdBy;
        } else if (typeof createdBy === 'object' && createdBy !== null) {
            return createdBy.displayName || createdBy.uid || 'Unknown';
        }
        return 'Anonymous';
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
                >
                    <motion.div
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -50, opacity: 0 }}
                        className="bg-gray-800 rounded-lg p-6 w-full max-w-3xl text-white shadow-2xl"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center">
                                <div className="w-16 h-16 rounded-full overflow-hidden mr-4 border-2 border-blue-500">
                                    <img 
                                        src={modelLogos[challenge.type] || modelLogos.default} 
                                        alt={`${challenge.type} logo`} 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold">{challenge.type} Challenge</h2>
                                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${difficultyColors[challenge.difficulty.toLowerCase()] || 'bg-gray-500'}`}>
                                        {challenge.difficulty}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-white transition duration-300"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>

                        <div className="bg-gray-700 p-4 rounded-lg mb-4 shadow-inner">
                            <h3 className="text-xl font-semibold mb-2">Challenge Description</h3>
                            <p className="text-gray-300">{challenge.challenge}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-gray-700 p-4 rounded-lg shadow-inner">
                                <h4 className="font-semibold mb-1 text-blue-300">Created By</h4>
                                <p>{renderCreatedBy(challenge.createdBy)}</p>
                            </div>
                            <div className="bg-gray-700 p-4 rounded-lg shadow-inner">
                                <h4 className="font-semibold mb-1 text-blue-300">Created On</h4>
                                <p>{challenge.createdAt ? format(new Date(challenge.createdAt), 'PPP') : 'Unknown'}</p>
                            </div>
                        </div>

                        <div className="bg-gray-700 p-4 rounded-lg mb-4 h-64 overflow-y-auto shadow-inner">
                            <h3 className="text-xl font-semibold mb-2">Interaction</h3>
                            {chatMessages.map((message, index) => (
                                <div key={index} className={`mb-2 ${message.sender === 'User' ? 'text-right' : 'text-left'}`}>
                                    <span className={`inline-block p-2 rounded-lg ${message.sender === 'User' ? 'bg-blue-600' : 'bg-green-600'} text-white shadow-md`}>
                                        {message.text}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="flex mb-4">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                className="flex-grow mr-2 p-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
                                placeholder="Type your message..."
                            />
                            <button
                                onClick={handleSendMessage}
                                className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition duration-300 ease-in-out shadow-md"
                            >
                                Send
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ChallengeModal;