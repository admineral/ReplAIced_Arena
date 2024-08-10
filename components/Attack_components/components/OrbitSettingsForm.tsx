import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { AiOutlineEyeInvisible } from 'react-icons/ai';
import orbitsData from '../../../data/orbits.json';

export interface Orbit {
  name: string;
  systemMessage: string;
  temperature: number;
  secret: string;
  secretWrapper: string;
}

interface OrbitsData {
  [key: string]: Orbit;
}

const typedOrbitsData: OrbitsData = orbitsData;

const modelOptions = [
  { id: 'default', name: 'Default', logo: '/default-logo.png' },
  { id: 'openai', name: 'OpenAI', logo: '/openai-logo.png' },
  { id: 'gemini', name: 'Gemini', logo: '/gemini-logo.png' },
  { id: 'claude', name: 'Claude', logo: '/claude-logo.png' },
  { id: 'meta', name: 'Meta', logo: '/meta-logo.png' },
];

const FormSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  systemMessage: z.string().min(1, { message: "System message is required." }),
  temperature: z.number().min(0).max(1, { message: "Temperature must be between 0 and 1." }),
  secret: z.string().min(1, { message: "Secret is required." }),
  secretWrapper: z.string().min(1, { message: "Secret wrapper is required." }),
});

interface OrbitSettingsFormProps {
  id: string;
  onUpdate: (id: string, data: Orbit) => void;
  onClose: () => void;
  onCancel: () => void;
}

export function OrbitSettingsForm({ id, onUpdate, onClose, onCancel }: OrbitSettingsFormProps) {
  const orbit = typedOrbitsData[id];
  const { control, handleSubmit, setValue, formState: { errors } } = useForm<Orbit>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: orbit.name,
      systemMessage: orbit.systemMessage,
      temperature: orbit.temperature,
      secret: orbit.secret,
      secretWrapper: orbit.secretWrapper,
    },
  });

  const onSubmit = (data: Orbit) => {
    onUpdate(id, data);
    onClose();
  };

  const handleModelSelect = (modelId: string) => {
    // This is a placeholder. You might want to update this based on how you want to handle model selection.
    console.log(`Selected model: ${modelId}`);
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
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-blue-400">Orbit Settings</h2>
            <button onClick={onCancel} type="button" className="text-gray-400 hover:text-gray-200 transition-colors">
              <AiOutlineEyeInvisible className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 text-center">Select AI Model</h3>
              <div className="flex justify-between items-center">
                {modelOptions.map((model) => (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => handleModelSelect(model.id)}
                    className={`flex flex-col items-center p-2 rounded-lg transition-all ${
                      orbit.name === model.name ? 'bg-blue-600' : 'hover:bg-gray-700'
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

            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-gray-300">Name</label>
                  <input
                    {...field}
                    className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-200 sm:text-sm"
                  />
                  {errors.name && <p className="mt-2 text-sm text-red-400">{errors.name.message}</p>}
                </div>
              )}
            />

            <Controller
              name="systemMessage"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-gray-300">System Message</label>
                  <textarea
                    {...field}
                    rows={3}
                    className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-200 sm:text-sm"
                  />
                  {errors.systemMessage && <p className="mt-2 text-sm text-red-400">{errors.systemMessage.message}</p>}
                </div>
              )}
            />

            <Controller
              name="temperature"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-gray-300">Temperature</label>
                  <input
                    {...field}
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-200 sm:text-sm"
                  />
                  {errors.temperature && <p className="mt-2 text-sm text-red-400">{errors.temperature.message}</p>}
                </div>
              )}
            />

            <Controller
              name="secret"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-gray-300">Secret Word</label>
                  <input
                    {...field}
                    className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-200 sm:text-sm"
                  />
                  {errors.secret && <p className="mt-2 text-sm text-red-400">{errors.secret.message}</p>}
                </div>
              )}
            />

            <Controller
              name="secretWrapper"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-gray-300">Secret Wrapper</label>
                  <input
                    {...field}
                    className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-200 sm:text-sm"
                  />
                  {errors.secretWrapper && <p className="mt-2 text-sm text-red-400">{errors.secretWrapper.message}</p>}
                </div>
              )}
            />

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onCancel}
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
}