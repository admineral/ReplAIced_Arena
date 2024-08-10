import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import orbitsData from '../../../data/orbits.json';
import { OrbitSettingsForm } from "./OrbitSettingsForm";

interface Orbit {
  name: string;
  systemMessage: string;
  temperature: number;
  secret: string;
  secretWrapper: string;
}

const orbits: { [key: string]: Orbit } = orbitsData;

interface ComponentLeftProps {
  id: string;
  systemMessage: string;
  temperature: number;
  onSendMessage: (id: string, message: string) => void;
}

export default function ComponentLeft({ id, systemMessage, temperature, onSendMessage }: ComponentLeftProps) {
  const [password, setPassword] = useState('');
  const [secretText, setSecretText] = useState('');
  const [hacked, setHacked] = useState(false);
  const [flashRed, setFlashRed] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handlePasswordSubmit = (e?: React.FormEvent) => {
    e?.preventDefault(); // Prevent form submission if called from form onSubmit
    const secret = orbits[id]?.secret;
    if (password.trim() === secret) {
      setHacked(true);
      setSecretText('Hacked!');
      setTimeout(() => {
        alert('Success!');
        setShowSettings(false);
      }, 500);
    } else {
      setFlashRed(true);
      setTimeout(() => setFlashRed(false), 1000);
    }
    setPassword('');
  };

  const handleSecretClick = () => {
    if (window.confirm("Are you sure you want to reveal the secret?")) {
      const secret = orbits[id]?.secret;
      setSecretText(secret);
      setTimeout(() => {
        setSecretText('');
      }, 3000);
    }
  };

  const handleSettingsClick = () => {
    setShowSettings(!showSettings);
  };

  const handleOrbitUpdate = (id: string, updatedOrbit: Orbit) => {
    // Here you would typically update the orbit data
    // For now, we'll just log the update
    console.log(`Updating orbit ${id}:`, updatedOrbit);
    setShowSettings(false);
  };

  const KeyAnimation = () => (
    <div className="relative w-full h-full perspective-1000">
      {/* 3D Rotating Key */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ rotateY: 0, z: 100 }}
        animate={{ 
          rotateY: 360, 
          z: [100, 0, 100],
          scale: [1, 1.2, 1]
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity, 
          repeatType: "loop", 
          ease: "easeInOut" 
        }}
      >
        <svg className={`w-32 h-32 ${hacked ? 'text-green-500' : flashRed ? 'text-red-500' : 'text-blue-500'} drop-shadow-2xl`} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
        </svg>
      </motion.div>

      {/* Multiple 3D Rotating Rings */}
      {[0, 1, 2, 3].map((index) => (
        <motion.div
          key={index}
          className={`absolute inset-0 border-2 ${hacked ? 'border-green-500' : flashRed ? 'border-red-500' : `border-blue-${400 - index * 100}`} rounded-full`}
          initial={{ rotateX: index * 45, rotateY: index * 45 }}
          animate={{ rotateX: 360 + index * 45, rotateY: 360 + index * 45 }}
          transition={{ 
            duration: 8 - index, 
            repeat: Infinity, 
            repeatType: "loop", 
            ease: "linear" 
          }}
        />
      ))}

      {/* Secret Text */}
      {secretText && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span 
            className={`text-${hacked ? 'green' : 'blue'}-500 font-bold text-xl`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
          >
            {secretText}
          </motion.span>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto bg-gray-900 text-white p-6 rounded-xl shadow-lg">
      <div className="flex items-center justify-between w-full mb-6">
        <h2 className="text-2xl font-bold text-blue-400">{orbits[id].name}</h2>
        <button 
          onClick={handleSettingsClick}
          className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors duration-200"
        >
          {showSettings ? <AiOutlineEyeInvisible className="h-6 w-6" /> : <AiOutlineEye className="h-6 w-6" />}
        </button>
      </div>
      <div className="relative w-full aspect-square mb-6">
        <div className={`absolute inset-0 ${showSettings ? 'hidden' : 'block'}`} onClick={handleSecretClick}>
          <KeyAnimation />
        </div>
        <div className={`absolute inset-0 ${showSettings ? 'block' : 'hidden'}`}>
          <OrbitSettingsForm 
            id={id} 
            onUpdate={handleOrbitUpdate}
            onClose={handleSettingsClick}
            onCancel={handleSettingsClick}
          />
        </div>
      </div>
      {!showSettings && (
        <form onSubmit={handlePasswordSubmit} className="w-full space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="password"
              className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter password"
              value={password}
              onChange={handlePasswordChange}
            />
          </div>
          <button
            type="submit"
            className={`w-full py-2 font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-opacity-75 transition duration-300 ease-in-out transform hover:scale-105 ${
              hacked ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' : 
              flashRed ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' : 
              'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
            }`}
          >
            {hacked ? 'Hacked!' : 'Submit Password'}
          </button>
        </form>
      )}
    </div>
  );
}