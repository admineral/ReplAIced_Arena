'use client'

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import Login from '../../components/Auth/Login';

interface LandingPageNavbarProps {
  activeSection: string;
  scrollToSection: (sectionId: string) => void;
}

export default function LandingPageNavbar({ activeSection, scrollToSection }: LandingPageNavbarProps) {
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const router = useRouter();

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

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black to-transparent h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button 
              onClick={() => scrollToSection('home')}
              className="text-white text-2xl hover:text-blue-500 transition-colors duration-300"
              title="Home"
            >
              🏠
            </button>
            <div className="ml-10 flex items-baseline space-x-4">
              {['about', 'features', 'join'].map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeSection === section ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  } transition-colors duration-300`}
                >
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </button>
              ))}
            </div>
          </div>
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
              <Login />
            )}
            {showDropdown && (
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
    </nav>
  );
}