'use client'

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import Login from '../../components/Auth/Login';
import Link from 'next/link';
import { FaBars, FaTimes, FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';

interface LandingPageNavbarProps {
  activeSection: string;
  scrollToSection: (sectionId: string) => void;
}

export default function LandingPageNavbar({ activeSection, scrollToSection }: LandingPageNavbarProps) {
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleGoToProfile = () => {
    router.push('/Profile');
    setShowMobileMenu(false);
  };

  const handleGoToSettings = () => {
    router.push('/Settings');
    setShowMobileMenu(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setShowMobileMenu(false);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

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
          {/* Logo and desktop navigation */}
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
          {/* Desktop profile / login */}
          <div className="hidden md:block">
            {user ? (
              <button 
                onClick={() => router.push('/Profile')}
                className="focus:outline-none transition-transform duration-300 transform hover:scale-110"
              >
                <Image
                  src={user.photoURL || '/default-avatar.png'}
                  alt="Profile"
                  width={50}
                  height={50}
                  className="rounded-full border-2 border-blue-500 shadow-lg"
                />
              </button>
            ) : (
              <Login />
            )}
          </div>
          {/* Mobile menu button */}
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
      {/* Mobile menu */}
      <div className={`md:hidden fixed top-0 right-0 h-full w-64 bg-gray-900 bg-opacity-95 transform ${showMobileMenu ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out overflow-y-auto`}>
        <div className="flex flex-col h-full">
          <div className="flex justify-end p-4">
            <button onClick={toggleMobileMenu} className="text-white text-2xl">
              <FaTimes />
            </button>
          </div>
          <div className="px-2 pt-2 pb-3 space-y-1 flex-grow">
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
          </div>
          {user && (
            <>
              <div className="border-t border-gray-700 my-2"></div>
              <div className="px-2 pb-3 space-y-1">
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
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}