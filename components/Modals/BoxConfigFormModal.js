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

const BoxConfigForm = ({ box, onUpdate, onClose }) => {
    const [config, setConfig] = useState({
        type: 'default',
        challenge: '',
        difficulty: 'medium'
    });

    useEffect(() => {
        if (box) {
            setConfig({
                type: box.type || 'default',
                challenge: box.challenge || '',
                difficulty: box.difficulty || 'medium'
            });
        }
    }, [box]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setConfig(prevConfig => ({ ...prevConfig, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdate({ ...box, ...config });
        onClose(); // Close the modal after updating
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <div className="mb-4">
                    <label className="block text-white mb-2" htmlFor="type">Model Type</label>
                    <select
                        id="type"
                        name="type"
                        value={config.type}
                        onChange={handleChange}
                        className="w-full bg-gray-700 text-white rounded px-3 py-2"
                    >
                        <option value="default">Default</option>
                        <option value="openai">OpenAI</option>
                        <option value="gemini">Gemini</option>
                        <option value="claude">Claude</option>
                        <option value="orbit">Orbit</option>
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block text-white mb-2" htmlFor="challenge">Challenge</label>
                    <textarea
                        id="challenge"
                        name="challenge"
                        value={config.challenge}
                        onChange={handleChange}
                        className="w-full bg-gray-700 text-white rounded px-3 py-2"
                        rows="3"
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

                <div className="flex justify-between">
                    <button
                        type="submit"
                        className="bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600"
                    >
                        Save
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-red-500 text-white rounded px-4 py-2 hover:bg-red-600"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BoxConfigForm;