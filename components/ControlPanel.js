import React from 'react';

const ControlPanel = ({ mode, switchMode, addBox, isAttackModeAvailable, selectedModel, setSelectedModel }) => {
  return (
    <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 bg-gray-800 bg-opacity-50">
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