"use client"

import React, { useState } from 'react';
import Maze from '../components/Maze';

export default function Home() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    return (
        <div className="flex flex-col min-h-screen bg-gray-900 text-green-400">
            <header className="w-full p-6 flex justify-between items-center bg-gray-800 border-b border-green-500">
                <h1 className="text-4xl font-bold tracking-wider">ReplAIced</h1>
                <button 
                    className="px-4 py-2 bg-green-600 text-black font-semibold rounded hover:bg-green-500 transition-colors"
                    onClick={() => setIsLoggedIn(!isLoggedIn)}
                >
                    {isLoggedIn ? 'Logout' : 'Login'}
                </button>
            </header>
            <main className="flex-grow flex flex-col items-center justify-center p-8">
                <h2 className="text-2xl mb-6">Welcome to the AI Maze Challenge</h2>
                <Maze />
                <div className="mt-8 text-center">
                    <p className="mb-4">Navigate through the maze to discover the secrets of AI!</p>
                    <a href="#" className="text-green-400 hover:text-green-300 underline">Learn more about ReplAIced</a>
                </div>
            </main>
            <footer className="w-full p-4 bg-gray-800 text-center border-t border-green-500">
                <p>&copy; 2024 ReplAIced - Embracing the AI Revolution</p>
            </footer>
        </div>
    );
}