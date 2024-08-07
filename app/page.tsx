'use client'

import React, { useState, useEffect, useRef } from 'react';
import AISecurityMap from '../components/Map/AISecurityMap';

export default function App() {
  const [showMap, setShowMap] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlayThrough = () => {
      setIsVideoLoaded(true);
    };

    video.addEventListener('canplaythrough', handleCanPlayThrough);

    return () => {
      video.removeEventListener('canplaythrough', handleCanPlayThrough);
    };
  }, []);

  const handleGetStarted = () => {
    setShowMap(true);
  };

  if (showMap) {
    return (
      <div className="App">
        <AISecurityMap />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-black">
      {/* Video Background */}
      <video 
        ref={videoRef}
        autoPlay 
        loop 
        muted 
        playsInline
        className="fixed z-0 w-auto min-w-full min-h-full max-w-none object-cover"
      >
        <source src="/gen3.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Content Overlay */}
      <div className={`relative z-10 min-h-screen text-white transition-opacity duration-1000 ${isVideoLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex flex-col items-start justify-between min-h-screen px-8 md:px-16 lg:px-24 py-16 bg-gradient-to-r from-black via-black/70 to-transparent">
          <div>
            <h1 className="text-6xl md:text-8xl font-bold mb-2 animate-pulse">
              Repl<span className="text-blue-500 inline-block transform hover:scale-110 transition-transform duration-200 ease-in-out">AI</span>ced
            </h1>
            <p className="text-2xl font-light">AI Security Challenge Arena</p>
          </div>
          <div className="max-w-md">
            <p className="text-xl mb-8">
              Challenge AI models. Expose vulnerabilities. Redefine security.
            </p>
            <button 
              onClick={handleGetStarted}
              className="px-8 py-3 bg-blue-600 text-white text-lg font-semibold rounded-full hover:bg-blue-700 transition duration-300 animate-bounce"
            >
              Enter the Arena
            </button>
          </div>
        </div>

        {/* Additional scrollable content */}
        <div className="bg-gradient-to-b from-black via-gray-900 to-blue-900">
          <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24 py-24 space-y-40">
            <section className="flex flex-col md:flex-row items-center justify-between">
              <div className="md:w-1/2 mb-8 md:mb-0">
                <h2 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 animate-text">Redefining AI Security</h2>
                <p className="text-xl text-gray-300 leading-relaxed">
                  In the rapidly evolving AI landscape, Replaced emerges as a cutting-edge platform designed to address critical security challenges. We've created an innovative arena where AI models become strategic assets in a competitive environment.
                </p>
              </div>
              <div className="md:w-1/2 flex justify-center">
                <div className="w-72 h-72 bg-blue-500 bg-opacity-20 rounded-full flex items-center justify-center animate-spin-slow">
                  <span className="text-7xl transform hover:scale-150 transition-transform duration-300">🔐</span>
                </div>
              </div>
            </section>

            <section className="space-y-16">
              <h2 className="text-5xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 animate-text">Key Features</h2>
              <div className="grid md:grid-cols-2 gap-12">
                {[
                  { title: "Dynamic Challenge Map", icon: "🗺️", description: "Navigate through a landscape of AI models with varying difficulty levels." },
                  { title: "Competitive Gameplay", icon: "🏆", description: "Launch attacks, bypass defenses, and earn points for successful breaches." },
                  { title: "Advanced Security Tools", icon: "🛡️", description: "Utilize cutting-edge features like Similarity Search filters to defend against threats." },
                  { title: "Global Leaderboard", icon: "📊", description: "Compete on a visible rank list that highlights top performers." }
                ].map((feature, index) => (
                  <div key={index} className="bg-gray-800 bg-opacity-50 p-8 rounded-2xl backdrop-filter backdrop-blur-lg transform hover:scale-105 transition-all duration-300 hover:shadow-neon">
                    <div className="text-5xl mb-6 animate-bounce-slow">{feature.icon}</div>
                    <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
                    <p className="text-gray-300">{feature.description}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="text-center relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-20 blur-3xl -z-10"></div>
              <h2 className="text-5xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 animate-text">Join the AI Security Revolution</h2>
              <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
                Be part of a community that's setting new standards in AI security. Together, we'll drive innovation and contribute to a safer, more resilient AI ecosystem.
              </p>
              <button 
                onClick={handleGetStarted}
                className="px-12 py-4 bg-blue-600 text-white text-xl font-semibold rounded-full hover:bg-blue-700 transition duration-300 transform hover:scale-110 hover:rotate-3 animate-pulse"
              >
                Get Started Now
              </button>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}