'use client'

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import Login from '../../components/Auth/Login';
import Link from 'next/link';
import { FaBars, FaTimes, FaUser, FaCog, FaSignOutAlt, FaChevronDown } from 'react-icons/fa';

interface LandingPageNavbarProps {
  activeSection: string;
  scrollToSection: (sectionId: string) => void;
}

export default function LandingPageNavbar({ activeSection, scrollToSection }: LandingPageNavbarProps) {
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState<boolean>(false);
  const { user, logout } = useAuth();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleGoToProfile = () => {
    router.push('/Profile');
    setShowMobileMenu(false);
    setShowProfileDropdown(false);
  };

  const handleGoToSettings = () => {
    router.push('/Settings');
    setShowMobileMenu(false);
    setShowProfileDropdown(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setShowMobileMenu(false);
      setShowProfileDropdown(false);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
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
    };
  }, []);

  const navItems = [
    { id: 'about', text: 'About' },
    { id: 'features', text: 'Features' },
    { id: 'join', text: 'Join' },
    { id: 'globalRank', text: 'Global Rank', href: '/GlobalRank' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <button 
              onClick={() => scrollToSection('home')}
              className="focus:outline-none transition-transform duration-300 transform hover:scale-110"
              title="Home"
            >
              <Image
                src="/default-logo.png"
                alt="Logo"
                width={50}
                height={50}
                className="rounded-full"
              />
            </button>
            <div className="hidden md:flex ml-10 items-baseline space-x-4">
              {navItems.map((item) => (
                item.href ? (
                  <Link key={item.id} href={item.href} passHref>
                    <span className={`px-3 py-2 rounded-md text-base font-medium ${
                      activeSection === item.id ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    } transition-colors duration-300 cursor-pointer`}>
                      {item.text}
                    </span>
                  </Link>
                ) : (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`px-3 py-2 rounded-md text-base font-medium ${
                      activeSection === item.id ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    } transition-colors duration-300`}
                  >
                    {item.text}
                  </button>
                )
              ))}
            </div>
          </div>
          <div className="flex items-center">
            <div className="hidden md:block">
              {user ? (
                <div 
                  className="relative" 
                  ref={dropdownRef}
                  onMouseEnter={() => setShowProfileDropdown(true)}
                  onMouseLeave={() => setShowProfileDropdown(false)}
                >
                  <button 
                    className="focus:outline-none transition-transform duration-300 transform hover:scale-110 flex items-center"
                  >
                    <Image
                      src={user.photoURL || '/default-avatar.png'}
                      alt="Profile"
                      width={50}
                      height={50}
                      className="rounded-full border-2 border-blue-500 shadow-lg"
                    />
                    <FaChevronDown className={`ml-2 text-white transition-opacity duration-300 ${showProfileDropdown ? 'opacity-100' : 'opacity-0'}`} />
                  </button>
                  {showProfileDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-md shadow-lg py-1">
                      <button
                        onClick={handleGoToProfile}
                        className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-800 transition-colors duration-300"
                      >
                        <FaUser className="inline-block mr-2" />
                        Profile
                      </button>
                      <button
                        onClick={handleGoToSettings}
                        className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-800 transition-colors duration-300"
                      >
                        <FaCog className="inline-block mr-2" />
                        Settings
                      </button>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-red-600 transition-colors duration-300"
                      >
                        <FaSignOutAlt className="inline-block mr-2" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Login />
              )}
            </div>
            <div className="md:hidden flex items-center">
              {!user && <Login />}
              <button
                onClick={toggleMobileMenu}
                className="ml-4 text-white text-2xl focus:outline-none"
              >
                {showMobileMenu ? <FaTimes /> : <FaBars />}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className={`md:hidden fixed top-0 right-0 h-full w-64 bg-gray-900 bg-opacity-95 transform ${showMobileMenu ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out`}>
        <div className="flex justify-end p-4">
          <button onClick={toggleMobileMenu} className="text-white text-2xl">
            <FaTimes />
          </button>
        </div>
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navItems.map((item) => (
            item.href ? (
              <Link key={item.id} href={item.href} passHref>
                <span 
                  className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-700 transition-colors duration-300 cursor-pointer"
                  onClick={toggleMobileMenu}
                >
                  {item.text}
                </span>
              </Link>
            ) : (
              <button
                key={item.id}
                onClick={() => {
                  scrollToSection(item.id);
                  toggleMobileMenu();
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-700 transition-colors duration-300"
              >
                {item.text}
              </button>
            )
          ))}
          {user && (
            <>
              <button
                onClick={handleGoToProfile}
                className="flex items-center w-full px-3 py-2 text-base font-medium text-white hover:bg-gray-700 transition-colors duration-300"
              >
                <FaUser className="mr-2" />
                <span>Profile</span>
              </button>
              <button
                onClick={handleGoToSettings}
                className="flex items-center w-full px-3 py-2 text-base font-medium text-white hover:bg-gray-700 transition-colors duration-300"
              >
                <FaCog className="mr-2" />
                <span>Settings</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-3 py-2 text-base font-medium text-white hover:bg-red-600 transition-colors duration-300"
              >
                <FaSignOutAlt className="mr-2" />
                <span>Logout</span>
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}