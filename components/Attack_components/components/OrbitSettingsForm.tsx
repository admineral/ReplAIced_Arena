import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getBoxConfig, updateBoxConfig } from '../../../services/firestore'; // Import both functions

const modelOptions = [
  { id: 'default', name: 'Default', logo: '/default-logo.png' },
  { id: 'openai', name: 'OpenAI', logo: '/openai-logo.png' },
  { id: 'gemini', name: 'Gemini', logo: '/gemini-logo.png' },
  { id: 'claude', name: 'Claude', logo: '/claude-logo.png' },
  { id: 'meta', name: 'Meta', logo: '/meta-logo.png' },
];

interface OrbitConfig {
  name: string;
  systemPrompt: string;
  secretWord: string;
  difficulty: string;
  type: string;
  temperature: number;
}

interface OrbitSettingsFormProps {
  orbitId: string;
  onClose: () => void;
  combinedSystemPrompt: string; // Added combinedSystemPrompt prop
}

const OrbitSettingsForm: React.FC<OrbitSettingsFormProps> = ({ orbitId, onClose, combinedSystemPrompt }) => {
  const [config, setConfig] = useState<OrbitConfig>({
    name: '',
    systemPrompt: '',
    secretWord: '',
    difficulty: 'medium',
    type: 'default',
    temperature: 0.7,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrbitConfig = async () => {
      setIsLoading(true);
      try {
        const fetchedConfig = await getBoxConfig(orbitId);
        if (fetchedConfig) {
          setConfig(fetchedConfig);
        } else {
          setError('Failed to fetch orbit configuration');
        }
      } catch (err) {
        setError('An error occurred while fetching the configuration');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrbitConfig();
  }, [orbitId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setConfig(prevConfig => ({ ...prevConfig, [name]: value }));
  };

  const handleModelSelect = (modelId: string) => {
    setConfig(prevConfig => ({ ...prevConfig, type: modelId }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await updateBoxConfig(orbitId, config);
      console.log('Configuration updated successfully');
      onClose();
    } catch (err) {
      setError('Failed to update orbit configuration');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-white h-full flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 h-full flex items-center justify-center">{error}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full overflow-y-auto bg-gray-800 text-white p-4"
    >
      <h2 className="text-2xl font-bold mb-6 text-center">Edit Orbit Configuration</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-white mb-2" htmlFor="name">Orbit Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={config.name}
            onChange={handleChange}
            className="w-full bg-gray-700 text-white rounded px-3 py-2"
          />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-center">Select AI Model</h3>
          <div className="flex flex-wrap justify-center gap-2">
            {modelOptions.map((model) => (
              <button
                key={model.id}
                type="button"
                onClick={() => handleModelSelect(model.id)}
                className={`flex flex-col items-center p-2 rounded-lg transition-all ${
                  config.type === model.id ? 'bg-blue-600' : 'hover:bg-gray-700'
                }`}
              >
                <div className="w-10 h-10 rounded-full overflow-hidden mb-1">
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

        <div>
          <label className="block text-white mb-2" htmlFor="systemPrompt">System Prompt</label>
          <textarea
            id="systemPrompt"
            name="systemPrompt"
            value={config.systemPrompt}
            onChange={handleChange}
            className="w-full bg-gray-700 text-white rounded px-3 py-2"
            rows={3}
          />
        </div>

        <div>
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

        <div>
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

        <div>
          <label className="block text-white mb-2" htmlFor="temperature">Temperature</label>
          <input
            type="number"
            id="temperature"
            name="temperature"
            value={config.temperature}
            onChange={handleChange}
            step="0.1"
            min="0"
            max="1"
            className="w-full bg-gray-700 text-white rounded px-3 py-2"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
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
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default OrbitSettingsForm;