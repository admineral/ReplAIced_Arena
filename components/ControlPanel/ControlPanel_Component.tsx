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
import Link from 'next/link';
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
  const [showMobileMenu, setShowMobileMenu] = useState(false);
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
      <nav className="bg-gray-800 bg-opacity-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="relative flex items-center justify-between h-16">
            <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
              {/* Mobile menu button */}
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                aria-controls="mobile-menu"
                aria-expanded="false"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                <span className="sr-only">Open main menu</span>
                {/* Icon when menu is closed */}
                <svg className={`${showMobileMenu ? 'hidden' : 'block'} h-6 w-6`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                {/* Icon when menu is open */}
                <svg className={`${showMobileMenu ? 'block' : 'hidden'} h-6 w-6`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/">
                  <Image
                    src="/default-logo.png"
                    alt="Logo"
                    width={40}
                    height={40}
                    className="block h-8 w-auto"
                  />
                </Link>
              </div>
              <div className="hidden sm:block sm:ml-6">
                <div className="flex space-x-4">
                  {user && (
                    <button
                      onClick={() => switchMode('create')}
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        mode === 'create' ? 'bg-green-500 text-white' : 'text-gray-300 hover:bg-green-400 hover:text-white'
                      }`}
                    >
                      Create
                    </button>
                  )}
                  <button
                    onClick={() => switchMode('preview')}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      mode === 'preview' ? 'bg-blue-500 text-white' : 'text-gray-300 hover:bg-blue-400 hover:text-white'
                    }`}
                  >
                    Preview
                  </button>
                  {user && (
                    <button
                      onClick={() => switchMode('attack')}
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        mode === 'attack' ? 'bg-red-500 text-white' : 'text-gray-300 hover:bg-red-400 hover:text-white'
                      } ${!isAttackModeAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={!isAttackModeAvailable}
                    >
                      Attack
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
              {mode === 'create' && user && (
                <button
                  onClick={openCreateBoxModal}
                  className="bg-green-500 text-white rounded-full p-2 mr-2 shadow-lg hover:bg-green-600 transition-colors duration-300"
                  title="Add Box"
                >
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              )}
              <button
                onClick={handleReload}
                disabled={isLoading}
                className={`bg-blue-500 text-white rounded-full p-2 mr-2 shadow-lg hover:bg-blue-600 transition-colors duration-300 ${
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
                  className="bg-red-500 text-white rounded-full p-2 mr-2 shadow-lg hover:bg-red-600 transition-colors duration-300"
                  title="Clear All Boxes"
                >
                  <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
              <div className="ml-3 relative" ref={dropdownRef}>
                {user ? (
                  <button 
                    onClick={handleProfileClick}
                    className="bg-gray-800 flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                  >
                    <span className="sr-only">Open user menu</span>
                    <Image
                      src={user.photoURL || '/default-avatar.png'}
                      alt="Profile"
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  </button>
                ) : (
                  <button
                    onClick={handleLogin}
                    className="bg-blue-600 px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                  >
                    Login
                  </button>
                )}
                {user && showDropdown && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <button
                      onClick={handleGoToProfile}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`${showMobileMenu ? 'block' : 'hidden'} sm:hidden`} id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {user && (
              <button
                onClick={() => switchMode('create')}
                className={`block px-3 py-2 rounded-md text-base font-medium w-full text-left ${
                  mode === 'create' ? 'bg-green-500 text-white' : 'text-gray-300 hover:bg-green-400 hover:text-white'
                }`}
              >
                Create
              </button>
            )}
            <button
              onClick={() => switchMode('preview')}
              className={`block px-3 py-2 rounded-md text-base font-medium w-full text-left ${
                mode === 'preview' ? 'bg-blue-500 text-white' : 'text-gray-300 hover:bg-blue-400 hover:text-white'
              }`}
            >
              Preview
            </button>
            {user && (
              <button
                onClick={() => switchMode('attack')}
                className={`block px-3 py-2 rounded-md text-base font-medium w-full text-left ${
                  mode === 'attack' ? 'bg-red-500 text-white' : 'text-gray-300 hover:bg-red-400 hover:text-white'
                } ${!isAttackModeAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!isAttackModeAvailable}
              >
                Attack
              </button>
            )}
          </div>
        </div>
      </nav>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};

export default ControlPanel;