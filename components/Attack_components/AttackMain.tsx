"use client"

import React, { useState, useEffect } from 'react';
import Chat from "./components/Chat";
import { callOpenai } from './api';
import { getBoxConfig } from '../../services/firestore';

interface AttackMainProps {
  attackerId?: string;
  attackerBoxId?: string;
  defenderId?: string;
  defenderBoxId?: string;
}

interface OrbitConfig {
  id: string;
  name: string;
  systemPrompt: string;
  secretWord: string;
  secretSentence: string;
  difficulty: string;
  type: string;
  temperature?: number;
  combinedSystemPrompt: string;
}

export default function AttackMain({ 
  attackerId, 
  attackerBoxId, 
  defenderId, 
  defenderBoxId 
}: AttackMainProps) {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [orbitConfig, setOrbitConfig] = useState<OrbitConfig | null>(null);
  const [isPasswordMode, setIsPasswordMode] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isResponding, setIsResponding] = useState(false);

  useEffect(() => {
    if (attackerId && attackerBoxId && defenderId && defenderBoxId) {
      fetchAttackData(attackerId, attackerBoxId, defenderId, defenderBoxId);
    } else {
      console.log("Missing attack parameters");
      setIsLoading(false);
    }
  }, [attackerId, attackerBoxId, defenderId, defenderBoxId]);

  const fetchAttackData = async (attackerId: string, attackerBoxId: string, defenderId: string, defenderBoxId: string) => {
    setIsLoading(true);
    try {
      const boxConfig = await getBoxConfig(defenderBoxId);
      if (boxConfig) {
        setOrbitConfig(boxConfig as OrbitConfig);
        console.log("Orbit configuration set:", boxConfig);
      } else {
        throw new Error("Box configuration not found");
      }
    } catch (error) {
      console.error('Error fetching attack data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setMessages([]);
    setIsPasswordMode(true);
  }, [orbitConfig]);

  const handleSendMessage = async (message: string) => {
    if (!orbitConfig || isResponding) return;
    
    setIsResponding(true);
    try {
      setMessages(prevMessages => [...prevMessages, { role: 'user', content: message }]);
      
      // Add a placeholder for the AI response
      setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: '' }]);

      const aiResponse = await callOpenai(
        defenderBoxId || '', 
        [...messages, { role: 'user', content: message }], 
        orbitConfig,
        (partialResponse: string) => {
          // Update the AI's response as chunks are received
          setMessages(prevMessages => {
            const updatedMessages = [...prevMessages];
            updatedMessages[updatedMessages.length - 1].content = partialResponse;
            return updatedMessages;
          });
        }
      );

      // Final update with the complete response (optional, as the streaming updates should have already filled this)
      setMessages(prevMessages => {
        const updatedMessages = [...prevMessages];
        updatedMessages[updatedMessages.length - 1].content = aiResponse;
        return updatedMessages;
      });
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prevMessages => [...prevMessages, { role: 'system', content: 'Error: Unable to get response from AI.' }]);
    } finally {
      setIsResponding(false);
    }
  };

  const handlePasswordSubmit = async (password: string): Promise<boolean> => {
    if (!orbitConfig) return false;

    const isCorrect = password.toLowerCase() === orbitConfig.secretWord.toLowerCase();
    if (isCorrect) {
      setIsPasswordMode(false);
      setMessages([...messages, { role: 'system', content: 'Access granted. You may now chat with the AI.' }]);
    } else {
      setMessages([...messages, { role: 'system', content: 'Incorrect password. Please try again.' }]);
    }
    return isCorrect;
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!orbitConfig) {
    return <div>Error: Could not load orbit configuration</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4 relative">
      <div className="w-full max-w-md">
        <Chat 
          messages={messages}
          onSendMessage={handleSendMessage}
          onPasswordSubmit={handlePasswordSubmit}
          isPasswordMode={isPasswordMode}
          activeOrbitId={defenderBoxId || ''}
          systemMessage={orbitConfig.combinedSystemPrompt}
          temperature={orbitConfig.temperature || 0.7}
          orbitName={orbitConfig.name || 'Unknown Orbit'}
          isResponding={isResponding}
        />
      </div>
    </div>
  );
}