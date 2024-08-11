'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaChevronLeft, FaSave, FaTrash, FaEye, FaCheck, FaUndo, FaChevronDown, FaChevronUp, FaCog, FaMap, FaMinus, FaPlus } from 'react-icons/fa';
import AdvancedMiniMap from '../../../components/MiniMap/AdvancedMiniMap';
import { useMapContext } from '../../../contexts/MapContext';
import { db } from '../../../firebase-config';
import { collection, getDocs, addDoc, deleteDoc, doc, setDoc, getDoc, DocumentData } from 'firebase/firestore';
import { useAuth } from '../../../contexts/AuthContext';
import ConfigApplyModal from './ConfigApplyModal';
import { writeBoxesToFirestore } from '../../../services/firestore';

interface Box {
  id: string;
  type: string;
  x: number;
  y: number;
  difficulty: 'easy' | 'medium' | 'hard';
  systemPrompt: string;
  secretWord: string;
}

interface Attack {
  // Define attack properties here
}

interface MapConfig {
  id: string;
  name: string;
  timestamp: number;
  boxes: Box[];
  attacks: Attack[];
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

interface MapSettings {
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

const modelLogos: { [key: string]: string } = {
  default: '/default-logo.png',
  openai: '/openai-logo.png',
  gemini: '/gemini-logo.png',
  claude: '/claude-logo.png',
  meta: '/meta-logo.png',
};

const MapConfigPage: React.FC = () => {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const { boxes, loadBoxesFromFirebase, clearAllBoxes, setBoxes, attacks } = useMapContext();
  const [configs, setConfigs] = useState<MapConfig[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [expandedBoxes, setExpandedBoxes] = useState<string[]>([]);
  const [mapSettings, setMapSettings] = useState<MapSettings>({
    worldSize: 5,
    minBoxDistance: 2,
    initialPosition: { x: 0, y: 0 },
    initialZoom: 1.3,
    minZoom: 0.3,
    maxZoom: 1.6,
    zoomStep: 0.05,
    mapSize: 70,
    panLimit: 3,
    dragSpeed: 0.02,
    invertDragX: true,
    invertDragY: false,
    miniMapSize: 300,
    miniMapMinZoom: 0.5,
    miniMapMaxZoom: 4,
    miniMapZoomStep: 0.5,
    miniMapSpeedFactor: 0.5,
    toolbox: {
      size: 50,
      padding: 10,
      iconSize: 30,
      borderRadius: 10,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      hoverBackgroundColor: 'rgba(255, 255, 255, 0.1)',
      activeBackgroundColor: 'rgba(0, 128, 255, 0.5)',
      iconColor: 'white',
      position: { x: 10, y: 10 },
    },
  });
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<MapConfig | null>(null);

  const loadConfigs = async (): Promise<void> => {
    setIsLoading(true);
    const configsCollection = collection(db, 'mapConfigs');
    const configsSnapshot = await getDocs(configsCollection);
    const configsList = configsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as MapConfig));
    setConfigs(configsList);

    const currentConfigDoc = await getDoc(doc(db, 'currentMapConfig', 'current'));
    if (currentConfigDoc.exists()) {
      const currentConfig = currentConfigDoc.data() as MapConfig;
      if (JSON.stringify(currentConfig.boxes) !== JSON.stringify(boxes)) {
        setBoxes(currentConfig.boxes);
      }
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (!user || !isAdmin) {
      router.push('/AdminDashboard');
    } else {
      const initializeData = async (): Promise<void> => {
        await loadConfigs();
        if (configs.length === 0) {
          await loadBoxesFromFirebase();
        }
      };
      initializeData();
    }
  }, [user, isAdmin, router, loadBoxesFromFirebase, configs.length]);

  useEffect(() => {
    const loadMapSettings = async (): Promise<void> => {
      const mapSettingsDoc = await getDoc(doc(db, 'mapSettings', 'current'));
      if (mapSettingsDoc.exists()) {
        setMapSettings(mapSettingsDoc.data() as MapSettings);
      }
    };
    loadMapSettings();
  }, []);

  const saveCurrentConfig = async (): Promise<void> => {
    const name = prompt('Enter a name for this configuration:');
    if (name && name.trim()) {
      setIsLoading(true);
      const boxCoordinates = boxes.reduce((acc: { [key: string]: { x: number; y: number } }, box: { id: string; x: number; y: number }) => {
        acc[box.id] = { x: box.x, y: box.y };
        return acc;
      }, {} as { [key: string]: { x: number; y: number } });

      const newConfig: Omit<MapConfig, 'id'> = {
        name: name.trim(),
        timestamp: Date.now(),
        boxes,
        attacks: attacks || [],
        boxCoordinates,
        worldSize: mapSettings.worldSize,
        minBoxDistance: mapSettings.minBoxDistance,
        initialPosition: mapSettings.initialPosition,
        initialZoom: mapSettings.initialZoom,
        minZoom: mapSettings.minZoom,
        maxZoom: mapSettings.maxZoom,
        zoomStep: mapSettings.zoomStep,
        mapSize: mapSettings.mapSize,
        panLimit: mapSettings.panLimit,
        dragSpeed: mapSettings.dragSpeed,
        invertDragX: mapSettings.invertDragX,
        invertDragY: mapSettings.invertDragY,
        miniMapSize: mapSettings.miniMapSize,
        miniMapMinZoom: mapSettings.miniMapMinZoom,
        miniMapMaxZoom: mapSettings.miniMapMaxZoom,
        miniMapZoomStep: mapSettings.miniMapZoomStep,
        miniMapSpeedFactor: mapSettings.miniMapSpeedFactor,
        toolbox: mapSettings.toolbox,
      };
      try {
        const docRef = await addDoc(collection(db, 'mapConfigs'), newConfig);
        const savedConfig = { id: docRef.id, ...newConfig };
        setConfigs(prevConfigs => [...prevConfigs, savedConfig]);
        setSelectedConfig(savedConfig);
        alert('Configuration saved successfully!');
      } catch (error) {
        console.error("Error saving configuration:", error);
        if (error instanceof Error) {
          alert(`Failed to save configuration: ${error.message}`);
        } else {
          alert("Failed to save configuration. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    } else if (name !== null) {
      alert("Please enter a valid name for the configuration.");
    }
  };

  const deleteConfig = async (configId: string): Promise<void> => {
    await deleteDoc(doc(db, 'mapConfigs', configId));
    setConfigs(configs.filter(config => config.id !== configId));
    if (selectedConfig?.id === configId) {
      setSelectedConfig(null);
    }
  };

  const previewConfig = (config: MapConfig): void => {
    setSelectedConfig(config);
    setBoxes(config.boxes);
  };

  const applyConfig = async (config: MapConfig): Promise<void> => {
    setIsLoading(true);
    try {
      const configStillExists = configs.some(c => c.id === config.id);
      if (!configStillExists) {
        throw new Error("Selected configuration no longer exists.");
      }
      await setDoc(doc(db, 'currentMapConfig', 'current'), config);
      await writeBoxesToFirestore(config.boxes);
      setBoxes(config.boxes);
      alert('Configuration applied successfully!');
    } catch (error) {
      console.error("Error applying configuration:", error);
      alert("Failed to apply configuration. Please try again.");
    }
    setIsLoading(false);
  };

  const resetToLive = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await loadBoxesFromFirebase();
      setSelectedConfig(null);
    } catch (error) {
      console.error("Error resetting to live configuration:", error);
      alert("Failed to reset to live configuration. Please try again.");
    }
    setIsLoading(false);
  };

  const toggleBoxExpansion = (boxId: string): void => {
    setExpandedBoxes(prev =>
      prev.includes(boxId)
        ? prev.filter(id => id !== boxId)
        : [...prev, boxId]
    );
  };

  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setMapSettings(prev => {
      const keys = name.split('.');
      const newSettings = { ...prev };
      let current: any = newSettings;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value;
      return newSettings;
    });
  };

  const adjustValue = (name: string, increment: number) => {
    setMapSettings(prev => {
      const keys = name.split('.');
      const newSettings = { ...prev };
      let current: any = newSettings;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      const currentValue = current[keys[keys.length - 1]];
      current[keys[keys.length - 1]] = typeof currentValue === 'number' 
        ? Number((currentValue + increment).toFixed(2))
        : currentValue;
      return newSettings;
    });
  };

  const handleConfigSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await setDoc(doc(db, 'mapSettings', 'current'), mapSettings);
      alert('Map settings updated successfully!');
    } catch (error) {
      console.error("Error updating map settings:", error);
      alert("Failed to update map settings. Please try again.");
    }
    setIsLoading(false);
  };

  const handleApplyConfig = (config: MapConfig) => {
    setSelectedConfig(config);
    setShowApplyModal(true);
  };

  const confirmApplyConfig = async () => {
    if (selectedConfig) {
      await applyConfig(selectedConfig);
      setShowApplyModal(false);
    }
  };

  const cancelApplyConfig = () => {
    setShowApplyModal(false);
  };

  useEffect(() => {
    if (configs.length > 0) {
      const lastConfig = document.querySelector('.saved-configs-list li:last-child');
      lastConfig?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [configs.length]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen bg-gray-900 text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-blue-900 text-white pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold flex items-center">
            <FaMap className="mr-3 text-blue-400" />
            Map Configuration
          </h1>
          <button
            onClick={() => router.push('/AdminDashboard')}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-500 transition duration-150 ease-in-out"
          >
            <FaChevronLeft className="mr-2" />
            Back to Dashboard
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FaEye className="mr-2 text-blue-400" />
                Map Preview
              </h2>
            </div>
            <div className="p-6">
              <AdvancedMiniMap 
                containerClassName="w-full aspect-square max-w-2xl mx-auto"
              />
              <div className="mt-6 flex justify-between">
                <button
                  onClick={saveCurrentConfig}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
                >
                  <FaSave className="mr-2" />
                  Save Configuration
                </button>
                <button
                  onClick={resetToLive}
                  className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-full hover:bg-yellow-700 transition-colors"
                >
                  <FaUndo className="mr-2" />
                  Reset to Live
                </button>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FaCog className="mr-2 text-blue-400" />
                Saved Configurations
              </h2>
            </div>
            <div className="p-6">
              <ul className="space-y-4 saved-configs-list">
                {configs.map(config => (
                  <li key={config.id} className={`bg-gray-700 rounded-lg overflow-hidden ${selectedConfig?.id === config.id ? 'border-2 border-blue-500' : ''}`}>
                    <div className="p-4 flex items-center justify-between">
                      <span className="font-semibold">{config.name}</span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApplyConfig(config)}
                          className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => deleteConfig(config.id)}
                          className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FaCog className="mr-2 text-blue-400" />
              Available Boxes
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boxes.map((box: Box) => (
              <div key={box.id} className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105">
                <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-between">
                  <div className="flex items-center">
                    <img src={modelLogos[box.type] || modelLogos.default} alt={box.type} className="w-12 h-12 rounded-full mr-3 border-2 border-white" />
                    <span className="font-bold text-lg text-white">{box.id}</span>
                  </div>
                  <button onClick={() => toggleBoxExpansion(box.id)} className="text-white hover:text-yellow-300 transition-colors">
                    {expandedBoxes.includes(box.id) ? <FaChevronUp size={20} /> : <FaChevronDown size={20} />}
                  </button>
                </div>
                <div className={`p-4 ${expandedBoxes.includes(box.id) ? 'block' : 'hidden'}`}>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-blue-300">Type:</span>
                      <span className="text-white">{box.type}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-blue-300">Position:</span>
                      <span className="text-white">X: {box.x.toFixed(2)}, Y: {box.y.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-blue-300">Difficulty:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        box.difficulty === 'easy' ? 'bg-green-500 text-white' :
                        box.difficulty === 'medium' ? 'bg-yellow-500 text-gray-900' :
                        'bg-red-500 text-white'
                      }`}>
                        {box.difficulty.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-blue-300">System Prompt:</span>
                      <p className="mt-1 text-white bg-gray-700 p-2 rounded">{box.systemPrompt}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-blue-300">Secret Word:</span>
                      <span className="text-white bg-gray-700 px-2 py-1 rounded">{box.secretWord}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FaCog className="mr-2 text-blue-400" />
              Edit Map Configuration
            </h2>
          </div>
          <div className="p-6">
            <form onSubmit={handleConfigSubmit} className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(mapSettings).map(([key, value]) => {
                  if (typeof value === 'object' && value !== null) {
                    return (
                      <div key={key} className="col-span-full">
                        <h3 className="text-lg font-semibold mb-2 capitalize">{key}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {Object.entries(value).map(([subKey, subValue]) => (
                            <div key={`${key}.${subKey}`} className="space-y-2">
                              <label htmlFor={`${key}.${subKey}`} className="block text-sm font-medium text-gray-300 capitalize">
                                {subKey.replace(/([A-Z])/g, ' $1').trim()}
                              </label>
                              {typeof subValue === 'boolean' ? (
                                <input
                                  type="checkbox"
                                  id={`${key}.${subKey}`}
                                  name={`${key}.${subKey}`}
                                  checked={subValue}
                                  onChange={handleConfigChange}
                                  className="form-checkbox h-5 w-5 text-blue-600"
                                />
                              ) : (
                                <div className="flex items-center">
                                  <button
                                    type="button"
                                    onClick={() => adjustValue(`${key}.${subKey}`, typeof subValue === 'number' ? -1 : 0)}
                                    className="p-2 bg-gray-700 rounded-l-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  >
                                    <FaMinus className="text-white" />
                                  </button>
                                  <input
                                    type={typeof subValue === 'number' ? 'number' : 'text'}
                                    id={`${key}.${subKey}`}
                                    name={`${key}.${subKey}`}
                                    value={typeof subValue === 'number' ? subValue.toString() : (subValue as string)}
                                    onChange={handleConfigChange}
                                    step={typeof subValue === 'number' ? '0.01' : undefined}
                                    className="flex-grow px-3 py-2 bg-gray-700 text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => adjustValue(`${key}.${subKey}`, typeof subValue === 'number' ? 1 : 0)}
                                    className="p-2 bg-gray-700 rounded-r-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  >
                                    <FaPlus className="text-white" />
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div key={key} className="space-y-2">
                        <label htmlFor={key} className="block text-sm font-medium text-gray-300 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </label>
                        {typeof value === 'boolean' ? (
                          <input
                            type="checkbox"
                            id={key}
                            name={key}
                            checked={value}
                            onChange={handleConfigChange}
                            className="form-checkbox h-5 w-5 text-blue-600"
                          />
                        ) : (
                          <div className="flex items-center">
                            <button
                              type="button"
                              onClick={() => adjustValue(key, typeof value === 'number' ? -1 : 0)}
                              className="p-2 bg-gray-700 rounded-l-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <FaMinus className="text-white" />
                            </button>
                            <input
                              type={typeof value === 'number' ? 'number' : 'text'}
                              id={key}
                              name={key}
                              value={typeof value === 'number' ? value.toString() : (value as string)}
                              onChange={handleConfigChange}
                              step={typeof value === 'number' ? '0.01' : undefined}
                              className="flex-grow px-3 py-2 bg-gray-700 text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                              type="button"
                              onClick={() => adjustValue(key, typeof value === 'number' ? 1 : 0)}
                              className="p-2 bg-gray-700 rounded-r-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <FaPlus className="text-white" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  }
                })}
              </div>
              <div className="mt-6">
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  <FaSave className="mr-2" />
                  Save Map Configuration
                </button>
              </div>
            </form>
          </div>
        </div>

        {showApplyModal && selectedConfig && (
          <ConfigApplyModal
            config={selectedConfig}
            onApply={confirmApplyConfig}
            onCancel={cancelApplyConfig}
          />
        )}
      </div>
    </div>
  );
};

export default MapConfigPage;