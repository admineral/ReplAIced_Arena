/****************************************************************************
 * components/ControlPanel.js
 * 
 * Control Panel Component for AI Security Map
 * 
 * This component renders the control panel for the AI Security Map application.
 * It provides buttons for switching between different modes (create, preview, 
 * attack) and controls for adding new boxes in create mode.
 * 
 * Context:
 * - Part of the AI Security Map application's user interface
 * - Typically rendered at the top of the main view
 * 
 * Props:
 * - mode: Current application mode (create, preview, attack)
 * - switchMode: Function to change the current mode
 * - addBox: Function to add a new box to the map
 * - isAttackModeAvailable: Boolean indicating if attack mode can be enabled
 * - selectedModel: Currently selected AI model for new boxes
 * - setSelectedModel: Function to update the selected model
 * 
 * Key Functionalities:
 * 1. Mode switching buttons (Create, Preview, Attack)
 * 2. Model selection dropdown (in Create mode)
 * 3. Add Box button (in Create mode)
 * 4. Visual feedback for current mode and button states
 * 
 ****************************************************************************/




import React from 'react';

const ControlPanel = ({ mode, switchMode, addBox, isAttackModeAvailable, selectedModel, setSelectedModel }) => {
  return (
    <div className="flex justify-between items-center p-4 bg-gray-800 bg-opacity-50">
      <div className="flex space-x-4">
        <button
          onClick={() => switchMode('create')}
          className={`px-6 py-3 rounded-lg font-bold text-white transition-colors duration-300 ${
            mode === 'create' ? 'bg-green-500' : 'bg-gray-600 hover:bg-green-400'
          }`}
        >
          Create
        </button>
        <button
          onClick={() => switchMode('preview')}
          className={`px-6 py-3 rounded-lg font-bold text-white transition-colors duration-300 ${
            mode === 'preview' ? 'bg-blue-500' : 'bg-gray-600 hover:bg-blue-400'
          }`}
        >
          Preview
        </button>
        <button
          onClick={() => switchMode('attack')}
          className={`px-6 py-3 rounded-lg font-bold text-white transition-colors duration-300 ${
            mode === 'attack' ? 'bg-red-500' : 'bg-gray-600 hover:bg-red-400'
          } ${!isAttackModeAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!isAttackModeAvailable}
        >
          Attack
        </button>
      </div>
      {mode === 'create' && (
        <div className="flex items-center space-x-2">
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-white text-gray-800 rounded-lg px-3 py-2 shadow-lg"
          >
            <option value="default">Default</option>
            <option value="openai">OpenAI</option>
            <option value="gemini">Gemini</option>
            <option value="claude">Claude</option>
            <option value="meta">Meta</option>
          </select>
          <button
            onClick={addBox}
            className="bg-green-500 text-white rounded-full px-4 py-2 shadow-lg hover:bg-green-600 transition-colors duration-300"
          >
            Add Box
          </button>
        </div>
      )}
    </div>
  );
};

export default ControlPanel;