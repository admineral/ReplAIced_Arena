import React, { useState, FormEvent, KeyboardEvent, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoSend, IoChevronDown, IoChevronUp } from 'react-icons/io5';
import { FaCog } from 'react-icons/fa';
import ComponentLeft from './ComponentLeft';

interface ChatProps {
  messages: { role: string; content: string }[];
  onSendMessage: (message: string) => void;
  isPasswordMode: boolean;
  activeOrbitId: string;
  systemMessage: string;
  temperature: number;
  onPasswordSubmit: (password: string) => Promise<boolean>;
  orbitName: string;
  isResponding: boolean;
  combinedSystemPrompt: string;
}

const MiniatureAnimation = () => (
  <div className="relative w-8 h-8">
    <div className="absolute inset-0 flex items-center justify-center text-blue-500">
      <FaCog size={20} />
    </div>
  </div>
);

export default function Chat({
  messages,
  onSendMessage,
  isPasswordMode,
  activeOrbitId,
  systemMessage,
  temperature,
  onPasswordSubmit,
  orbitName,
  isResponding,
  combinedSystemPrompt,
}: ChatProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimationMinimized, setIsAnimationMinimized] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (chatRef.current) {
        const { scrollTop } = chatRef.current;
        if (scrollTop > 50 && !isAnimationMinimized) {
          setIsAnimationMinimized(true);
        }
      }
    };

    const chatElement = chatRef.current;
    if (chatElement) {
      chatElement.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (chatElement) {
        chatElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, [isAnimationMinimized]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim() && !isResponding) {
      if (isPasswordMode && !isAnimationMinimized) {
        const isCorrect = await onPasswordSubmit(input.trim());
        setPasswordStatus(isCorrect ? 'success' : 'error');
        if (isCorrect) {
          setTimeout(() => {
            setIsAnimationMinimized(true);
          }, 1000);
        }
      } else {
        onSendMessage(input.trim());
      }
      setInput('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent<HTMLFormElement>);
    }
  };

  const handleMinimize = () => {
    setIsAnimationMinimized(true);
  };

  const handleMaximize = () => {
    setIsAnimationMinimized(false);
    chatRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full max-w-md mx-auto bg-gray-900 rounded-lg shadow-lg overflow-hidden border border-blue-500 flex flex-col" style={{ height: '80vh' }}>
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-white text-lg font-semibold">Chat</h2>
      </div>
      <div ref={chatRef} className="p-4 flex-grow overflow-y-auto bg-gray-800 flex flex-col">
        {!isAnimationMinimized ? (
          <div className="relative mb-4">
            <ComponentLeft
              id={activeOrbitId}
              systemMessage={systemMessage}
              temperature={temperature}
              onSendMessage={(id, message) => {}}
              orbitName={orbitName}
              onMinimize={handleMinimize}
              combinedSystemPrompt={combinedSystemPrompt}
            />
            <button
              className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-gray-700 text-white p-2 rounded-full hover:bg-gray-600 transition-colors duration-300"
              onClick={handleMinimize}
            >
              <IoChevronDown size={20} />
            </button>
          </div>
        ) : (
          <div 
            className="mb-4 bg-gray-800 p-3 rounded-lg flex items-center justify-between shadow-lg hover:bg-gray-700 transition-colors duration-300 cursor-pointer" 
            onClick={handleMaximize}
          >
            <div className="flex items-center space-x-3">
              <MiniatureAnimation />
              <div className="flex items-center space-x-2">
                <span className="text-gray-400 font-medium cursor-pointer hover:text-blue-400 transition-colors duration-300">Click here to enter secret</span>
              </div>
            </div>
            <IoChevronUp size={20} className="text-gray-400" />
          </div>
        )}
        {messages.map((message, index) => (
          <div key={index} className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block p-3 rounded-lg ${
              message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'
            }`}>
              {message.content}
            </span>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="p-4 bg-gray-900 border-t border-gray-800">
        <div className="flex items-center space-x-2">
          <input
            type={isPasswordMode && !isAnimationMinimized ? "password" : "text"}
            className="flex-grow p-2 bg-gray-800 text-white rounded-l-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={isPasswordMode && !isAnimationMinimized ? "Enter password..." : "Type your message..."}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isResponding}
          />
          <button
            type="submit"
            className="p-2 bg-blue-600 text-white rounded-r-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out"
            disabled={isLoading}
          >
            {isPasswordMode && !isAnimationMinimized ? (
              <FaCog className={`w-5 h-5 ${isLoading ? 'animate-pulse' : ''}`} />
            ) : (
              <IoSend className={`w-5 h-5 ${isLoading ? 'animate-pulse' : ''}`} />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}