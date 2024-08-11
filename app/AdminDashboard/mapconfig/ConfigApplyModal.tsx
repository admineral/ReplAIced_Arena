import React from 'react';
import { FaCheck, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import AdvancedMiniMap from '../../../components/MiniMap/AdvancedMiniMap';

interface Box {
  id: string;
  type: string;
  x: number;
  y: number;
  difficulty: 'easy' | 'medium' | 'hard';
  systemPrompt: string;
  secretWord: string;
}

interface MapConfig {
  id: string;
  name: string;
  timestamp: number;
  boxes: Box[];
  attacks: any[]; // Replace 'any' with the actual Attack type if available
  boxCoordinates: { [key: string]: { x: number; y: number } };
  worldSize: number;
  minBoxDistance: number;
  initialPosition: { x: number; y: number };
  initialZoom: number;
  minZoom: number;
  maxZoom: number;
  zoomStep: number;
  mapSize: number;
  panLimit: number;
  dragSpeed: number;
  invertDragX: boolean;
  invertDragY: boolean;
  miniMapSize: number;
  miniMapMinZoom: number;
  miniMapMaxZoom: number;
  miniMapZoomStep: number;
  miniMapSpeedFactor: number;
  toolbox: {
    size: number;
    padding: number;
    iconSize: number;
    borderRadius: number;
    backgroundColor: string;
    hoverBackgroundColor: string;
    activeBackgroundColor: string;
    iconColor: string;
    position: { x: number; y: number };
  };
}

interface ConfigApplyModalProps {
  config: MapConfig;
  onApply: () => void;
  onCancel: () => void;
}

const modelOptions = [
  { id: 'default', name: 'Default', logo: '/default-logo.png' },
  { id: 'openai', name: 'OpenAI', logo: '/openai-logo.png' },
  { id: 'gemini', name: 'Gemini', logo: '/gemini-logo.png' },
  { id: 'claude', name: 'Claude', logo: '/claude-logo.png' },
  { id: 'meta', name: 'Meta', logo: '/meta-logo.png' },
];

const ConfigApplyModal: React.FC<ConfigApplyModalProps> = ({ config, onApply, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden w-full max-w-4xl">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FaExclamationTriangle className="mr-2 text-yellow-400" />
            Apply Configuration: {config.name}
          </h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Map Preview</h3>
            <AdvancedMiniMap 
              containerClassName="w-full aspect-square max-w-sm mx-auto mb-4"
              boxes={config.boxes}
              worldSize={config.worldSize}
              initialZoom={config.initialZoom}
              minZoom={config.minZoom}
              maxZoom={config.maxZoom}
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Configuration Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>World Size:</strong> {config.worldSize}</p>
                <p><strong>Min Box Distance:</strong> {config.minBoxDistance}</p>
                <p><strong>Initial Zoom:</strong> {config.initialZoom}</p>
                <p><strong>Zoom Range:</strong> {config.minZoom} - {config.maxZoom}</p>
                <p><strong>Zoom Step:</strong> {config.zoomStep}</p>
              </div>
              <div>
                <p><strong>Map Size:</strong> {config.mapSize}</p>
                <p><strong>Pan Limit:</strong> {config.panLimit}</p>
                <p><strong>Drag Speed:</strong> {config.dragSpeed}</p>
                <p><strong>Invert Drag X:</strong> {config.invertDragX ? 'Yes' : 'No'}</p>
                <p><strong>Invert Drag Y:</strong> {config.invertDragY ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Boxes</h3>
          <p className="text-sm mb-2">Total Boxes: {config.boxes.length}</p>
          <div className="max-h-60 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {config.boxes.map(box => (
              <div key={box.id} className="bg-gray-700 rounded-lg p-3 flex items-center space-x-3">
                {modelOptions.find(model => model.id === box.type) && (
                  <img 
                    src={modelOptions.find(model => model.id === box.type)!.logo}
                    alt={box.type}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <div>
                  <p className="font-semibold">{box.id}</p>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      box.difficulty === 'easy' ? 'bg-green-500' :
                      box.difficulty === 'medium' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}>
                      {box.difficulty}
                    </span>
                    <span className="text-xs text-gray-400">Type: {box.type}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="p-6 border-t border-gray-700 flex justify-between">
          <button
            onClick={onCancel}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors"
          >
            <FaTimes className="mr-2" />
            Cancel
          </button>
          <button
            onClick={onApply}
            className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-full hover:bg-yellow-700 transition-colors"
          >
            <FaCheck className="mr-2" />
            Apply Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigApplyModal;