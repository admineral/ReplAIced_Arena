'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { FaBars, FaTimes, FaUser, FaSignOutAlt, FaChevronDown } from 'react-icons/fa';

interface ArenaNavbarProps {
  mode: string;
  switchMode: (mode: string) => void;
  isAttackModeAvailable: boolean;
  myBoxIds: string[]; // New prop
}

const ArenaNavbar: React.FC<ArenaNavbarProps> = ({ 
  mode, 
  switchMode, 
  isAttackModeAvailable,
  myBoxIds // New prop
}) => {
  const { user, logout } = useAuth();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hasBox = myBoxIds.length > 0; // New line

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleGoToProfile = () => {
    router.push('/Profile');
    setShowProfileDropdown(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setShowProfileDropdown(false);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleLogin = () => {
    router.push('/Login');
  };

  return (
    <nav className="bg-gray-800 bg-opacity-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">
          {/* Logo */}
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

          {/* Desktop menu */}
          <div className="hidden sm:block sm:ml-6">
            <div className="flex space-x-4">
              {user && !hasBox && ( // Modified condition
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

          {/* Profile and mobile menu button */}
          <div className="flex items-center">
            {/* Profile dropdown for desktop */}
            <div className="hidden sm:block ml-3 relative" ref={dropdownRef}>
              {user ? (
                <div 
                  className="relative"
                  onMouseEnter={() => setShowProfileDropdown(true)}
                  onMouseLeave={() => setShowProfileDropdown(false)}
                >
                  <button className="flex items-center focus:outline-none">
                    <Image
                      src={user.photoURL || '/default-avatar.png'}
                      alt="Profile"
                      width={32}
                      height={32}
                      className="rounded-full border-2 border-blue-500 shadow-lg"
                    />
                    <FaChevronDown className={`ml-2 text-white transition-opacity duration-300 ${showProfileDropdown ? 'opacity-100' : 'opacity-0'}`} />
                  </button>
                  {showProfileDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 border border-gray-700">
                      <button
                        onClick={handleGoToProfile}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center"
                      >
                        <FaUser className="mr-2" />
                        <span>Profile</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center"
                      >
                        <FaSignOutAlt className="mr-2" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleLogin}
                  className="bg-blue-600 px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                >
                  Login
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="sm:hidden ml-3">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                {showMobileMenu ? <FaTimes /> : <FaBars />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`sm:hidden fixed top-0 right-0 h-full w-64 bg-gray-900 bg-opacity-95 transform ${showMobileMenu ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out overflow-y-auto`}>
        <div className="flex flex-col h-full">
          <div className="flex justify-end p-4">
            <button onClick={() => setShowMobileMenu(false)} className="text-white text-2xl">
              <FaTimes />
            </button>
          </div>
          <div className="px-2 pt-2 pb-3 space-y-1 flex-grow">
            {user && !hasBox && ( // Modified condition
              <button
                onClick={() => {
                  switchMode('create');
                  setShowMobileMenu(false);
                }}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                  mode === 'create' ? 'bg-green-500 text-white' : 'text-gray-300 hover:bg-green-400 hover:text-white'
                }`}
              >
                Create
              </button>
            )}
            <button
              onClick={() => {
                switchMode('preview');
                setShowMobileMenu(false);
              }}
              className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                mode === 'preview' ? 'bg-blue-500 text-white' : 'text-gray-300 hover:bg-blue-400 hover:text-white'
              }`}
            >
              Preview
            </button>
            {user && (
              <button
                onClick={() => {
                  switchMode('attack');
                  setShowMobileMenu(false);
                }}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                  mode === 'attack' ? 'bg-red-500 text-white' : 'text-gray-300 hover:bg-red-400 hover:text-white'
                } ${!isAttackModeAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!isAttackModeAvailable}
              >
                Attack
              </button>
            )}
          </div>
          {user ? (
            <>
              <div className="border-t border-gray-700 my-2"></div>
              <div className="px-2 pb-3 space-y-1">
                <button
                  onClick={() => {
                    handleGoToProfile();
                    setShowMobileMenu(false);
                  }}
                  className="flex items-center w-full px-3 py-2 text-base font-medium text-white hover:bg-gray-700 transition-colors duration-300"
                >
                  <FaUser className="mr-2" />
                  <span>Profile</span>
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    setShowMobileMenu(false);
                  }}
                  className="flex items-center w-full px-3 py-2 text-base font-medium text-white hover:bg-red-600 transition-colors duration-300"
                >
                  <FaSignOutAlt className="mr-2" />
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <div className="px-2 pb-3">
              <button
                onClick={() => {
                  handleLogin();
                  setShowMobileMenu(false);
                }}
                className="flex items-center w-full px-3 py-2 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-300 rounded-md"
              >
                Login
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default ArenaNavbar;