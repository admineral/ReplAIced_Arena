/**
 * ControlPanel Component
 * 
 * Context: Main control interface for the Arena page in the application.
 * Global Purpose: Provides user controls for interacting with the AI Security Map.
 * Local Purpose: Manages mode switching, box creation, reloading, and user authentication actions.
 * Key Features:
 * - Implements mode switching between 'create', 'preview', and 'attack' modes
 * - Provides controls for creating new boxes, reloading existing boxes, and clearing all boxes
 * - Displays user authentication status and provides login/logout functionality
 * - Offers navigation to homepage and user profile
 * - Implements a dropdown menu for authenticated users
 * - Handles confirmation for destructive actions (e.g., clearing all boxes)
 * - Provides visual feedback for loading states
 * - Implements responsive design for various screen sizes
 * - Integrates with Next.js routing for navigation
 * - Uses Firebase authentication via AuthContext
 * - Conditionally renders controls based on user authentication and current mode
 */


'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import DeleteConfirmationModal from '../Modals/DeleteConfirmationModal';

interface ControlPanelProps {
  mode: string;
  switchMode: (mode: string) => void;
  openCreateBoxModal: () => void;
  reloadBoxes: () => void;
  clearAllBoxes: () => void;
  isAttackModeAvailable: boolean;
  isLoading: boolean;
  setLastUpdateTime: (date: Date) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ 
  mode, 
  switchMode, 
  openCreateBoxModal,
  reloadBoxes,
  clearAllBoxes,
  isAttackModeAvailable, 
  isLoading,
  setLastUpdateTime
}) => {
  const { user, logout } = useAuth();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleReload = () => {
    reloadBoxes();
    setLastUpdateTime(new Date());
  };

  const handleClearAllBoxes = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    clearAllBoxes();
    setIsDeleteModalOpen(false);
  };

  const handleGoToHomepage = () => {
    router.push('/');
  };

  const handleProfileClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleGoToProfile = () => {
    router.push('/Profile');
    setShowDropdown(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setShowDropdown(false);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleLogin = () => {
    router.push('/Login');
  };

  return (
    <>
      <div className="flex justify-between items-center p-4 bg-gray-800 bg-opacity-50">
        <div className="flex space-x-4 items-center">
          <button
            onClick={handleGoToHomepage}
            className="bg-gray-600 text-white rounded-full px-4 py-2 shadow-lg hover:bg-gray-700 transition-colors duration-300"
          >
            Go Back to Homepage
          </button>
          {user && (
            <button
              onClick={() => switchMode('create')}
              className={`px-6 py-3 rounded-lg font-bold text-white transition-colors duration-300 ${
                mode === 'create' ? 'bg-green-500' : 'bg-gray-600 hover:bg-green-400'
              }`}
            >
              Create
            </button>
          )}
          <button
            onClick={() => switchMode('preview')}
            className={`px-6 py-3 rounded-lg font-bold text-white transition-colors duration-300 ${
              mode === 'preview' ? 'bg-blue-500' : 'bg-gray-600 hover:bg-blue-400'
            }`}
          >
            Preview
          </button>
          {user && (
            <button
              onClick={() => switchMode('attack')}
              className={`px-6 py-3 rounded-lg font-bold text-white transition-colors duration-300 ${
                mode === 'attack' ? 'bg-red-500' : 'bg-gray-600 hover:bg-red-400'
              } ${!isAttackModeAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!isAttackModeAvailable}
            >
              Attack
            </button>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {mode === 'create' && user && (
            <button
              onClick={openCreateBoxModal}
              className="bg-green-500 text-white rounded-full px-4 py-2 shadow-lg hover:bg-green-600 transition-colors duration-300"
            >
              Add Box
            </button>
          )}
          <button
            onClick={handleReload}
            disabled={isLoading}
            className={`bg-blue-500 text-white rounded-full p-2 shadow-lg hover:bg-blue-600 transition-colors duration-300 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title="Reload boxes"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
          </button>
          {mode === 'create' && user && (
            <button
              onClick={handleClearAllBoxes}
              className="bg-red-500 text-white rounded-full p-2 shadow-lg hover:bg-red-600 transition-colors duration-300"
              title="Clear All Boxes"
            >
              <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
          <div className="relative" ref={dropdownRef}>
            {user ? (
              <button 
                onClick={handleProfileClick}
                className="focus:outline-none transition-transform duration-300 transform hover:scale-110"
              >
                <Image
                  src={user.photoURL || '/default-avatar.png'}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="rounded-full border-2 border-blue-500 shadow-lg"
                />
              </button>
            ) : (
              <button
                onClick={handleLogin}
                className="px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-full hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Login
              </button>
            )}
            {user && showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl py-2 backdrop-filter backdrop-blur-lg bg-opacity-90">
                <button
                  onClick={handleGoToProfile}
                  className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-blue-600 transition-colors duration-200"
                >
                  Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-red-600 transition-colors duration-200 rounded-b-lg"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};

export default ControlPanel;