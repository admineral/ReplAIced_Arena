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
    <div className="relative h-screen w-full overflow-hidden">
      {/* Video Background */}
      <video 
        ref={videoRef}
        autoPlay 
        loop 
        muted 
        playsInline
        className="absolute z-0 w-auto min-w-full min-h-full max-w-none object-cover"
      >
        <source src="/gen3.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Content Overlay */}
      <div className={`relative z-10 flex flex-col items-start justify-between h-full text-white bg-gradient-to-r from-black via-black/70 to-transparent px-12 py-16 transition-opacity duration-1000 ${isVideoLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <div>
          <h1 className="text-7xl font-bold mb-2">
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
            className="px-8 py-3 bg-blue-600 text-white text-lg font-semibold rounded-full hover:bg-blue-700 transition duration-300"
          >
            Enter the Arena
          </button>
        </div>
      </div>
    </div>
  );
}