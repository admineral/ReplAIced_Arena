import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import orbitsData from '../../../data/orbits.json';
import OrbitSettingsForm from "./OrbitSettingsForm";

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
  orbitName: string;
  onMinimize: () => void;
}

export default function ComponentLeft({ id, systemMessage, temperature, onSendMessage, orbitName, onMinimize }: ComponentLeftProps) {
  const [secretText, setSecretText] = useState('');
  const [hacked, setHacked] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

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
        <svg className={`w-32 h-32 ${hacked ? 'text-green-500' : 'text-blue-500'} drop-shadow-2xl`} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
        </svg>
      </motion.div>

      {/* Multiple 3D Rotating Rings */}
      {[0, 1, 2, 3].map((index) => (
        <motion.div
          key={index}
          className={`absolute inset-0 border-2 ${hacked ? 'border-green-500' : `border-blue-${400 - index * 100}`} rounded-full`}
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
        <h2 className="text-2xl font-bold text-blue-400">{orbitName}</h2>
        <div className="flex space-x-2">
          <button 
            onClick={handleSettingsClick}
            className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors duration-200"
          >
            {showSettings ? <AiOutlineEyeInvisible className="h-6 w-6" /> : <AiOutlineEye className="h-6 w-6" />}
          </button>
        </div>
      </div>
      <div className="relative w-full aspect-square mb-6">
        <div className={`absolute inset-0 ${showSettings ? 'hidden' : 'block'}`} onClick={handleSecretClick}>
          <KeyAnimation />
        </div>
        <div className={`absolute inset-0 ${showSettings ? 'block' : 'hidden'}`}>
          <OrbitSettingsForm 
            orbitId={id}
            onClose={handleSettingsClick}
          />
        </div>
      </div>
    </div>
  );
}