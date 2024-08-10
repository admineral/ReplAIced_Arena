"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Chat from "./components/Chat";
import { callOpenai } from './api';
import { getBoxConfig } from '../../services/firestore';
import Modal from './Modal'; // Make sure this path is correct

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
  const router = useRouter();
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [orbitConfig, setOrbitConfig] = useState<OrbitConfig | null>(null);
  const [isPasswordMode, setIsPasswordMode] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isResponding, setIsResponding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRetryModalOpen, setIsRetryModalOpen] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (attackerId && attackerBoxId && defenderId && defenderBoxId) {
      checkBoxAvailability();
    } else {
      setError("Missing attack parameters");
      setIsLoading(false);
    }
  }, [attackerId, attackerBoxId, defenderId, defenderBoxId]);

  const checkBoxAvailability = async () => {
    if (!attackerId || !attackerBoxId || !defenderId || !defenderBoxId) {
      setError('Missing required parameters');
      setIsLoading(false);
      return;
    }

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
      setIsRetryModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (retryCount < 2) { // Allow 3 attempts (0, 1, 2)
      setRetryCount(prevCount => prevCount + 1);
      setIsRetryModalOpen(false);
      setTimeout(checkBoxAvailability, 2000); // Retry after 2 seconds
    } else {
      setError('The box you are trying to attack is not available. Please try again later.');
      setIsRetryModalOpen(false);
      router.push('/'); // Redirect to home page or wherever appropriate
    }
  };

  const handleCancel = () => {
    setIsRetryModalOpen(false);
    router.push('/'); // Redirect to home page or wherever appropriate
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

      // Final update with the complete response
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
    return <div>Loading attack data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4 relative">
      {orbitConfig ? (
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
      ) : (
        <div>Error: Could not load orbit configuration</div>
      )}
      <Modal 
        isOpen={isRetryModalOpen} 
        onClose={handleCancel}
        title="Box Not Available"
      >
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-300 mb-4">
            The box you're trying to attack is still being created. Please retry again in a moment.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Retry Now
            </button>
          </div>
          <p className="text-sm text-gray-400 mt-4">
            Attempt {retryCount + 1} of 3
          </p>
        </div>
      </Modal>
    </div>
  );
}