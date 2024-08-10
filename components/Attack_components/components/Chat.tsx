import React, { useState, FormEvent, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoSend } from 'react-icons/io5';
import { FaKey } from 'react-icons/fa';
import ComponentLeft from './ComponentLeft';

interface ChatProps {
  messages: { role: string; content: string }[];
  onSendMessage: (message: string) => void;
  isPasswordMode: boolean;
  activeOrbitId: string;
  systemMessage: string;
  temperature: number;
  onPasswordSubmit: (password: string) => Promise<boolean>;
}

const MiniatureAnimation = () => (
  <div className="relative w-12 h-12">
    {[0, 1, 2].map((index) => (
      <motion.div
        key={index}
        className="absolute inset-0 border-2 border-blue-500 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, delay: index * 0.5, ease: "linear" }}
      />
    ))}
    <motion.div 
      className="absolute inset-0 flex items-center justify-center text-blue-500"
      animate={{ rotate: [0, 360] }}
      transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
    >
      <FaKey size={16} />
    </motion.div>
  </div>
);

export default function Chat({
  messages,
  onSendMessage,
  isPasswordMode,
  activeOrbitId,
  systemMessage,
  temperature,
  onPasswordSubmit
}: ChatProps) {
  const [input, setInput] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimationMinimized, setIsAnimationMinimized] = useState(false);
  const [isChatActive, setIsChatActive] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isPasswordMode && !isAnimationMinimized) {
      setPassword(e.target.value);
    } else {
      setInput(e.target.value);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handlePasswordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handlePasswordSubmit();
    }
  };

  const handlePasswordSubmit = async () => {
    if (password.trim()) {
      setPasswordStatus('idle'); // Reset status before submission
      const isCorrect = await onPasswordSubmit(password.trim());
      setPasswordStatus(isCorrect ? 'success' : 'error');
      setPassword('');
      
      // If password is correct, transition to chat mode
      if (isCorrect) {
        setTimeout(() => {
          setIsAnimationMinimized(true);
          setIsChatActive(true);
        }, 1000); // Delay to show success message
      }
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isPasswordMode && !isAnimationMinimized) {
      await handlePasswordSubmit();
    } else {
      if (input.trim() && !isLoading) {
        setIsLoading(true);
        await onSendMessage(input.trim());
        setInput('');
        setIsLoading(false);
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent<HTMLFormElement>);
    }
  };

  const handleInputFocus = () => {
    setIsAnimationMinimized(true);
    setIsChatActive(true);
  };

  const handleAnimationClick = () => {
    setIsAnimationMinimized(false);
    setIsChatActive(false);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-gray-900 rounded-lg shadow-lg overflow-hidden border border-blue-500 flex flex-col" style={{ height: '80vh' }}>
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-white text-lg font-semibold">Chat</h2>
      </div>
      <div className="p-4 flex-grow overflow-y-auto bg-gray-800 flex flex-col">
        <AnimatePresence>
          {!isAnimationMinimized && (
            <motion.div
              layout
              className="mb-4 cursor-pointer"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <ComponentLeft
                id={activeOrbitId}
                systemMessage={systemMessage}
                temperature={temperature}
                onSendMessage={(id, message) => {}}
              />
            </motion.div>
          )}
        </AnimatePresence>
        {isChatActive && (
          <>
            <motion.div
              layout
              className="mb-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <div className="bg-gray-800 p-3 rounded-lg flex items-center space-x-3 shadow-lg hover:bg-gray-700 transition-colors duration-300" onClick={handleAnimationClick}>
                <MiniatureAnimation />
                <div className="flex-grow relative">
                  <input
                    type={isPasswordMode && !isAnimationMinimized ? "password" : "text"}
                    placeholder={isPasswordMode && !isAnimationMinimized ? "Enter password..." : "Type your message..."}
                    value={isPasswordMode && !isAnimationMinimized ? password : input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    className={`w-full bg-gray-700 text-white px-3 py-2 rounded-full focus:outline-none focus:ring-2 transition-colors duration-300 ${
                      passwordStatus === 'success' ? 'focus:ring-green-500' : 
                      passwordStatus === 'error' ? 'focus:ring-red-500' : 'focus:ring-blue-500'
                    }`}
                  />
                  {passwordStatus !== 'idle' && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                        passwordStatus === 'success' ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {passwordStatus === 'success' ? '✓' : '✗'}
                    </motion.span>
                  )}
                </div>
              </div>
            </motion.div>
            {messages.map((message, index) => (
              <div key={index} className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                <span className={`inline-block p-3 rounded-lg ${
                  message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'
                }`}>
                  {message.content}
                </span>
              </div>
            ))}
          </>
        )}
      </div>
      <form onSubmit={handleSubmit} className="p-4 bg-gray-900 border-t border-gray-800">
        <div className="flex items-center space-x-2">
          <input
            className="flex-grow p-2 bg-gray-800 text-white rounded-l-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your message..."
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
          />
          <button
            type="submit"
            className="p-2 bg-blue-600 text-white rounded-r-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out"
            disabled={isLoading}
          >
            {isPasswordMode && !isAnimationMinimized ? (
              <FaKey className={`w-5 h-5 ${isLoading ? 'animate-pulse' : ''}`} />
            ) : (
              <IoSend className={`w-5 h-5 ${isLoading ? 'animate-pulse' : ''}`} />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}