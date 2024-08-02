/****************************************************************************
 * components/Modals/BoxConfigFormModal.js
 * 
 * Box Configuration Form Modal for AI Security Map
 * 
 * This component renders a modal dialog with a form for configuring the 
 * properties of a box (node) in the AI Security Map application. It allows
 * users to modify the model type, challenge description, and difficulty level.
 * 
 * Context:
 * - Part of the AI Security Map application's UI
 * - Used within the ModalManager component
 * 
 * Props:
 * - box: Object containing current box configuration
 * - onUpdate: Function to be called with updated box configuration
 * - onClose: Function to be called when the modal is closed
 * 
 * Key Features:
 * 1. Form for editing box properties (type, challenge, difficulty)
 * 2. Initializes form with current box configuration
 * 3. Handles form submission and updates box configuration
 * 4. Responsive design with a centered layout
 * 5. Cancel and Save buttons for user actions
 * 
 * State:
 * - config: Object holding the current form state (type, challenge, difficulty)
 * 
 * Note: This component uses Tailwind CSS for styling. Ensure that Tailwind CSS
 * is properly configured in your project for the styles to take effect.
 ****************************************************************************/


import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const modelOptions = [
  { id: 'default', name: 'Default', logo: '/default-logo.png' },
  { id: 'openai', name: 'OpenAI', logo: '/openai-logo.png' },
  { id: 'gemini', name: 'Gemini', logo: '/gemini-logo.png' },
  { id: 'claude', name: 'Claude', logo: '/claude-logo.png' },
  { id: 'meta', name: 'Meta', logo: '/meta-logo.png' },
];

const BoxConfigFormModal = ({ box, onUpdate, onClose }) => {
    const [config, setConfig] = useState({
        type: 'default',
        challenge: '',
        difficulty: 'medium',
        systemPrompt: '',
        secretWord: ''
    });

    useEffect(() => {
        if (box) {
            setConfig({
                type: box.type || 'default',
                challenge: box.challenge || '',
                difficulty: box.difficulty || 'medium',
                systemPrompt: box.systemPrompt || '',
                secretWord: box.secretWord || ''
            });
        }
    }, [box]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setConfig(prevConfig => ({ ...prevConfig, [name]: value }));
    };

    const handleModelSelect = (modelId) => {
        setConfig(prevConfig => ({ ...prevConfig, type: modelId }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdate({ ...box, ...config });
        onClose();
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            >
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -50, opacity: 0 }}
                    className="bg-gray-800 rounded-lg p-6 w-full max-w-md text-white"
                >
                    <h2 className="text-2xl font-bold mb-6 text-center">Edit Box Configuration</h2>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-4 text-center">Select AI Model</h3>
                            <div className="flex justify-between items-center">
                                {modelOptions.map((model) => (
                                    <button
                                        key={model.id}
                                        type="button"
                                        onClick={() => handleModelSelect(model.id)}
                                        className={`flex flex-col items-center p-2 rounded-lg transition-all ${
                                            config.type === model.id
                                                ? 'bg-blue-600'
                                                : 'hover:bg-gray-700'
                                        }`}
                                    >
                                        <div className="w-12 h-12 rounded-full overflow-hidden mb-1">
                                            <img 
                                                src={model.logo} 
                                                alt={model.name} 
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <span className="text-xs">{model.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-white mb-2" htmlFor="systemPrompt">System Prompt</label>
                            <textarea
                                id="systemPrompt"
                                name="systemPrompt"
                                value={config.systemPrompt}
                                onChange={handleChange}
                                className="w-full bg-gray-700 text-white rounded px-3 py-2"
                                rows="3"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-white mb-2" htmlFor="secretWord">Secret Word</label>
                            <input
                                type="text"
                                id="secretWord"
                                name="secretWord"
                                value={config.secretWord}
                                onChange={handleChange}
                                className="w-full bg-gray-700 text-white rounded px-3 py-2"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-white mb-2" htmlFor="difficulty">Difficulty</label>
                            <select
                                id="difficulty"
                                name="difficulty"
                                value={config.difficulty}
                                onChange={handleChange}
                                className="w-full bg-gray-700 text-white rounded px-3 py-2"
                            >
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-600 rounded-md text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default BoxConfigFormModal;