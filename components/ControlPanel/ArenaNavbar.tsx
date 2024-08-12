'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { FaBars, FaTimes, FaUser, FaSignOutAlt, FaUserCog } from 'react-icons/fa';
import { User } from 'firebase/auth';

interface ArenaNavbarProps {
  mode: string;
  switchMode: (mode: string) => void;
  isAttackModeAvailable: boolean;
  isAdmin: boolean;
  user: User | null;
}

const ArenaNavbar: React.FC<ArenaNavbarProps> = ({ 
  mode, 
  switchMode, 
  isAttackModeAvailable,
  isAdmin,
  user
}) => {
  const { logout } = useAuth();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleProfileMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShowProfileDropdown(true);
  };

  const handleProfileMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShowProfileDropdown(false);
    }, 3000);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
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

  const renderNavButtons = () => {
    if (!user) {
      return null; // No buttons for non-logged-in users
    }

    if (isAdmin) {
      // For admin users, show all buttons
      return (
        <>
          <button
            onClick={() => switchMode('create')}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              mode === 'create' ? 'bg-green-500 text-white' : 'text-gray-300 hover:bg-green-400 hover:text-white'
            }`}
          >
            Create
          </button>
          <button
            onClick={() => switchMode('preview')}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              mode === 'preview' ? 'bg-blue-500 text-white' : 'text-gray-300 hover:bg-blue-400 hover:text-white'
            }`}
          >
            Preview
          </button>
          <button
            onClick={() => switchMode('attack')}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              mode === 'attack' ? 'bg-red-500 text-white' : 'text-gray-300 hover:bg-red-400 hover:text-white'
            } ${!isAttackModeAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!isAttackModeAvailable}
          >
            Attack
          </button>
        </>
      );
    } else {
      // For non-admin logged-in users, show only the Arena button
      return (
        <button
          onClick={() => switchMode('preview')}
          className={`px-3 py-2 rounded-md text-sm font-medium ${
            mode === 'preview' ? 'bg-blue-500 text-white' : 'text-gray-300 hover:bg-blue-400 hover:text-white'
          }`}
        >
          Arena
        </button>
      );
    }
  };

  return (
    <nav className="bg-gray-800 bg-opacity-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">
          {/* Logo and Title */}
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
            <span className="text-white font-bold ml-2 text-lg hidden sm:block">ReplAIced</span>
            <span className="text-white font-bold ml-2 text-lg sm:hidden">ReplAIced</span>
          </div>

          {/* Desktop menu */}
          <div className="hidden sm:block sm:ml-6">
            <div className="flex space-x-4">
              {renderNavButtons()}
            </div>
          </div>

          {/* Profile dropdown */}
          <div className="hidden sm:ml-6 sm:block">
            <div className="flex items-center">
              {user ? (
                <div className="ml-3 relative">
                  <div>
                    <button
                      className="bg-gray-800 flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                      onMouseEnter={handleProfileMouseEnter}
                      onMouseLeave={handleProfileMouseLeave}
                    >
                      <span className="sr-only">Open user menu</span>
                      <Image
                        className="h-8 w-8 rounded-full"
                        src={user.photoURL || "/default-avatar.png"}
                        alt=""
                        width={32}
                        height={32}
                      />
                    </button>
                  </div>
                  {showProfileDropdown && (
                    <div
                      className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="user-menu"
                      ref={dropdownRef}
                      onMouseEnter={handleProfileMouseEnter}
                      onMouseLeave={handleProfileMouseLeave}
                    >
                      <button
                        onClick={handleGoToProfile}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Your Profile
                      </button>
                      {isAdmin && (
                        <Link 
                          href="/AdminDashboard"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign out
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

      {/* Mobile menu */}
      <div className={`sm:hidden fixed top-0 right-0 h-full w-64 bg-gray-900 bg-opacity-95 transform ${showMobileMenu ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out overflow-y-auto`}>
        <div className="flex flex-col h-full">
          <div className="flex justify-end p-4">
            <button onClick={() => setShowMobileMenu(false)} className="text-white text-2xl">
              <FaTimes />
            </button>
          </div>
          <div className="px-2 pt-2 pb-3 space-y-1 flex-grow">
            {renderNavButtons()}
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
                {isAdmin && (
                  <Link 
                    href="/AdminDashboard"
                    className="flex items-center w-full px-3 py-2 text-base font-medium text-white hover:bg-gray-700 transition-colors duration-300"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <FaUserCog className="mr-2" />
                    <span>Admin Dashboard</span>
                  </Link>
                )}
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