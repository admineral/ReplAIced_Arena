'use client'

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { User } from 'firebase/auth';
import { FaBars, FaTimes, FaUser, FaCog, FaSignOutAlt, FaHome, FaGamepad, FaListOl } from 'react-icons/fa';

interface NavbarProps {
  user?: User | null;
}

export default function Navbar({ user: propUser }: NavbarProps) {
  const { user: contextUser, logout } = useAuth();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Use the prop user if provided, otherwise use the context user
  const user = propUser ?? contextUser;

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

  const handleProfileMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShowProfileDropdown(true);
  };

  const handleProfileMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShowProfileDropdown(false);
    }, 300); // 300ms delay before closing
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

  const navItems = [
    { href: '/', text: 'Home', icon: FaHome },
    { href: '/Arena', text: 'Arena', icon: FaGamepad },
    { href: '/GlobalRank', text: 'Ranklist', icon: FaListOl },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo and nav items */}
          <div className="flex items-center">
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
                <Link 
                  key={item.href} 
                  href={item.href} 
                  className={`
                    px-4 py-2 rounded-full text-sm font-medium
                    transition-all duration-300 ease-in-out
                    ${pathname === item.href 
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50' 
                      : 'text-gray-300 hover:bg-blue-400 hover:text-white hover:shadow-md hover:shadow-blue-400/50'}
                    flex items-center space-x-2
                    border border-transparent hover:border-blue-300
                    transform hover:scale-105
                  `}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.text}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop profile dropdown */}
          <div className="hidden md:block">
            {user ? (
              <div 
                className="relative" 
                ref={dropdownRef}
                onMouseEnter={handleProfileMouseEnter}
                onMouseLeave={handleProfileMouseLeave}
              >
                <button
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <Image
                    src={user.photoURL || '/default-avatar.png'}
                    alt="Profile"
                    width={40}
                    height={40}
                    className="rounded-full border-2 border-blue-500 shadow-lg"
                  />
                </button>
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 border border-gray-700">
                    <Link 
                      href="/Profile"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center"
                    >
                      <FaUser className="mr-2" />
                      <span>Profile</span>
                    </Link>
                    <Link 
                      href="/Settings"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center"
                    >
                      <FaCog className="mr-2" />
                      <span>Settings</span>
                    </Link>
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
              <Link 
                href="/Login"
                className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded transition-colors text-white font-medium"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            {!user && (
              <Link 
                href="/Login"
                className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded transition-colors text-white font-medium mr-4"
              >
                Login
              </Link>
            )}
            <button
              onClick={toggleMobileMenu}
              className="text-white text-2xl focus:outline-none"
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
              <Link 
                key={item.href} 
                href={item.href}
                className={`
                  flex items-center space-x-2
                  px-3 py-2 rounded-md text-base font-medium
                  ${pathname === item.href 
                    ? 'bg-blue-500 text-white shadow-inner' 
                    : 'text-gray-300 hover:bg-blue-400 hover:text-white'}
                  transition-colors duration-300
                `}
                onClick={toggleMobileMenu}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.text}</span>
              </Link>
            ))}
          </div>
          {user && (
            <>
              <div className="border-t border-gray-700 my-2"></div>
              <div className="px-2 pb-3 space-y-1">
                <Link 
                  href="/Profile"
                  className="flex items-center w-full px-3 py-2 text-base font-medium text-white hover:bg-gray-700 transition-colors duration-300"
                  onClick={toggleMobileMenu}
                >
                  <FaUser className="mr-2" />
                  <span>Profile</span>
                </Link>
                <Link 
                  href="/Settings"
                  className="flex items-center w-full px-3 py-2 text-base font-medium text-white hover:bg-gray-700 transition-colors duration-300"
                  onClick={toggleMobileMenu}
                >
                  <FaCog className="mr-2" />
                  <span>Settings</span>
                </Link>
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