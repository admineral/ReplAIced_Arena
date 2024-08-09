/**
 * General Navbar Component
 * 
 * Context: Core navigation component used across the application, except for the landing page.
 * Global Purpose: Provides consistent top-level navigation and user authentication status display.
 * Local Purpose: Renders navigation links and user authentication controls.
 * Key Features:
 * - Displays main navigation links (Home, Arena, About)
 * - Shows user authentication status
 * - Provides login/logout functionality
 * - Displays user profile information when logged in
 * - Implements a dropdown menu for authenticated users with profile and settings options
 * - Handles outside clicks to close the dropdown
 * - Responsive design with hamburger menu for mobile views
 * - Integrates with Next.js routing for smooth navigation
 * - Uses Firebase authentication via AuthContext
 */

'use client'

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { User } from 'firebase/auth';
import { FaBars, FaTimes, FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';

interface NavbarProps {
  user?: User | null;
}

export default function Navbar({ user: propUser }: NavbarProps) {
  const { user: contextUser, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Use the prop user if provided, otherwise use the context user
  const user = propUser ?? contextUser;

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

  const handleLogout = async () => {
    try {
      await logout();
      setShowDropdown(false);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const navItems = [
    { href: '/', text: 'Home' },
    { href: '/Arena', text: 'Arena' },
    { href: '/About', text: 'About' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <div className="md:hidden mr-4">
              <button
                onClick={toggleMobileMenu}
                className="text-white text-2xl focus:outline-none"
              >
                {showMobileMenu ? <FaTimes /> : <FaBars />}
              </button>
            </div>
            <Link href="/" className="flex-shrink-0">
              <Image
                src="/default-logo.png"
                alt="Logo"
                width={50}
                height={50}
                className="rounded-full"
              />
            </Link>
            <div className="hidden md:flex ml-10 items-baseline space-x-4">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  {item.text}
                </Link>
              ))}
            </div>
          </div>
          <div className="relative" ref={dropdownRef}>
            {user ? (
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
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
              <Link 
                href="/Login"
                className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded transition-colors text-white font-medium"
              >
                Login
              </Link>
            )}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl py-2 backdrop-filter backdrop-blur-lg bg-opacity-90">
                <Link href="/Profile" className="flex items-center px-4 py-2 text-sm text-white hover:bg-blue-600 transition-colors duration-200">
                  <FaUser className="mr-2" />
                  <span>Profile</span>
                </Link>
                <Link href="/Settings" className="flex items-center px-4 py-2 text-sm text-white hover:bg-blue-600 transition-colors duration-200">
                  <FaCog className="mr-2" />
                  <span>Settings</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-white hover:bg-red-600 transition-colors duration-200"
                >
                  <FaSignOutAlt className="mr-2" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Mobile menu */}
      {showMobileMenu && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-900 bg-opacity-95">
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-700 transition-colors duration-300"
                onClick={toggleMobileMenu}
              >
                {item.text}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}