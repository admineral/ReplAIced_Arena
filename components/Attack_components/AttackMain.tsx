"use client"

import React, { useState, useEffect } from 'react';
import Chat from "./components/Chat";
import { callOpenai } from './api';
import orbitsData from '../../data/orbits.json';

type Orbit = {
  name: string;
  systemMessage: string;
  temperature: number;
  secret: string;
  secretWrapper: string;
};

const orbits: { [key: string]: Orbit } = orbitsData;
const orbitIds = Object.keys(orbits);

export default function AttackMain() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [activeOrbitId, setActiveOrbitId] = useState<string>(orbitIds[0]);
  const [isPasswordMode, setIsPasswordMode] = useState(true);

  useEffect(() => {
    setMessages([]);
    setIsPasswordMode(true);
  }, [activeOrbitId]);

  const handleSendMessage = async (message: string) => {
    console.log(`Sending message to orbit ID: ${activeOrbitId}`);
    const userMessage = { role: 'user', content: message };
    setMessages([...messages, userMessage]);

    try {
      await callOpenai(activeOrbitId, [...messages, userMessage], (accumulatedMessage: string) => {
        const assistantMessage = { role: 'assistant', content: accumulatedMessage };
        setMessages((prevMessages) => {
          const newMessages = [...prevMessages];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage && lastMessage.role === 'assistant') {
            lastMessage.content = accumulatedMessage;
          } else {
            newMessages.push(assistantMessage);
          }
          return newMessages;
        });
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handlePasswordSubmit = async (password: string): Promise<boolean> => {
    const isCorrect = password === orbits[activeOrbitId].secret;
    if (isCorrect) {
      setIsPasswordMode(false);
      setMessages([...messages, { role: 'system', content: 'Access granted. You may now chat with the AI.' }]);
    } else {
      setMessages([...messages, { role: 'system', content: 'Incorrect password. Please try again.' }]);
    }
    return isCorrect;
  };

  const handleNextOrbit = () => {
    const currentIndex = orbitIds.indexOf(activeOrbitId);
    const nextIndex = (currentIndex + 1) % orbitIds.length;
    setActiveOrbitId(orbitIds[nextIndex]);
    console.log(`Switched to orbit ID: ${orbitIds[nextIndex]}`);
  };

  const getSystemMessageWithSecret = (id: string) => {
    const orbit = orbits[id];
    return `${orbit.systemMessage} ${orbit.secretWrapper.replace("(secret)", orbit.secret)}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4 relative">
      <button
        className="absolute top-4 right-4 px-6 py-3 bg-green-700 text-white font-semibold rounded-lg shadow-md hover:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-opacity-75 transition duration-300 ease-in-out transform hover:scale-105"
        onClick={handleNextOrbit}
      >
        Next Orbit
      </button>
      <div className="w-full max-w-md">
        <Chat 
          messages={messages}
          onSendMessage={handleSendMessage}
          onPasswordSubmit={handlePasswordSubmit}
          isPasswordMode={isPasswordMode}
          activeOrbitId={activeOrbitId}
          systemMessage={getSystemMessageWithSecret(activeOrbitId)}
          temperature={orbits[activeOrbitId].temperature}
        />
      </div>
    </div>
  );
}