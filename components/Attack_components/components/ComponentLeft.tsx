import { useState } from 'react';
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
  const [secretText, setSecretText] = useState('*****');
  const [hacked, setHacked] = useState(false);
  const [flashRed, setFlashRed] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handlePasswordSubmit = () => {
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
      setTimeout(() => setFlashRed(false), 1000); // Reset flashRed after 1 second
    }
    setPassword('');
  };

  const handleSecretClick = () => {
    if (window.confirm("Are you sure you want to reveal the secret?")) {
      const secret = orbits[id]?.secret;
      setSecretText(secret);

      setTimeout(() => {
        setSecretText('*****');
      }, 3000);
    }
  };

  const handleSettingsClick = () => {
    setShowSettings(!showSettings);
  };

  return (
    <div className="flex flex-col items-center mb-8 w-full md:w-2/3 bg-gray-800 text-white p-4 rounded-lg shadow-md">
      <div className="flex items-center mb-4">
        <h2 className="text-xl font-bold">{orbits[id].name}</h2>
        <button onClick={handleSettingsClick} className="ml-2">
          {showSettings ? <AiOutlineEyeInvisible className="h-6 w-6" /> : <AiOutlineEye className="h-6 w-6" />}
        </button>
      </div>
      <div className="relative w-full max-w-md h-96 mb-4 transform transition-transform">
        <div className={`absolute inset-0 flex items-center justify-center ${showSettings ? 'hidden' : 'block'}`} onClick={handleSecretClick}>
          <div className={`absolute w-96 h-96 border-4 ${hacked ? 'bg-green-500' : flashRed ? 'animate-pulse bg-red-500' : 'border-gray-700'} rounded-full`}></div>
          <div className={`absolute w-80 h-80 border-4 ${hacked ? 'bg-green-500' : flashRed ? 'animate-pulse bg-red-500' : 'border-gray-700'} rounded-full`}></div>
          <div className={`absolute w-64 h-64 border-4 ${hacked ? 'bg-green-500' : flashRed ? 'animate-pulse bg-red-500' : 'border-gray-700'} rounded-full`}></div>
          <div className={`absolute w-48 h-48 border-4 ${hacked ? 'bg-green-500' : flashRed ? 'animate-pulse bg-red-500' : 'border-red-700'} rounded-full flex items-center justify-center`}>
            <span className={`text-${hacked ? 'white' : 'red-700'} font-bold`}>{secretText}</span>
          </div>
        </div>
        <div className={`absolute inset-0 flex items-center justify-center ${showSettings ? 'block' : 'hidden'}`}>
          <OrbitSettingsForm id={id} onCancel={handleSettingsClick} />
        </div>
      </div>
      {!showSettings && (
        <>
          <input
            className="mb-4 w-full max-w-md p-2 border border-gray-700 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter password:"
            value={password}
            onChange={handlePasswordChange}
            onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
          />
          <button
            className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-300 ease-in-out transform hover:scale-105"
            onClick={handlePasswordSubmit}
          >
            Submit Password
          </button>
        </>
      )}
    </div>
  );
}