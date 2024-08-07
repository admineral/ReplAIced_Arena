'use client'

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
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
    <nav className="bg-gray-800 text-white p-4 relative z-10">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-xl font-bold">ReplAIced</Link>
          <Link href="/" className="hover:text-blue-300 transition-colors">Home</Link>
          <Link href="/Arena" className="hover:text-blue-300 transition-colors">Arena</Link>
          <Link href="/About" className="hover:text-blue-300 transition-colors">About</Link>
        </div>
        <div className="relative" ref={dropdownRef}>
          {user ? (
            <>
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 focus:outline-none"
              >
                <Image
                  src={user.photoURL || '/default-avatar.png'}
                  alt="Profile"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <span>{user.displayName || 'User'}</span>
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-md shadow-xl z-20">
                  <Link href="/Profile" className="block px-4 py-2 text-sm hover:bg-gray-600">Profile</Link>
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-600"
                  >
                    Logout
                  </button>
                </div>
              )}
            </>
          ) : (
            <Link 
              href="/Login"
              className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded transition-colors"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}