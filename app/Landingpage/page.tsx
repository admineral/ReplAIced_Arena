'use client'

import React, { useState, useEffect, useRef } from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isHighQualityLoaded, setIsHighQualityLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVideoLoaded(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlayThrough = () => {
      if (video.src.includes('gen3.mp4')) {
        setIsHighQualityLoaded(true);
      }
    };

    video.addEventListener('canplaythrough', handleCanPlayThrough);

    return () => {
      video.removeEventListener('canplaythrough', handleCanPlayThrough);
    };
  }, []);

  useEffect(() => {
    if (isVideoLoaded && !isHighQualityLoaded) {
      const highQualityVideo = new Audio('/gen3.mp4');
      highQualityVideo.addEventListener('canplaythrough', () => {
        if (videoRef.current) {
          videoRef.current.src = '/gen3.mp4';
        }
      });
    }
  }, [isVideoLoaded, isHighQualityLoaded]);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Video Background */}
      <video 
        ref={videoRef}
        autoPlay 
        loop 
        muted 
        playsInline
        onLoadedData={() => setIsVideoLoaded(true)}
        className="absolute z-0 w-auto min-w-full min-h-full max-w-none object-cover"
      >
        <source src="/gen3-2.mp4" type="video/mp4" />
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
            onClick={onGetStarted}
            className="px-8 py-3 bg-blue-600 text-white text-lg font-semibold rounded-full hover:bg-blue-700 transition duration-300"
          >
            Enter the Arena
          </button>
        </div>
      </div>
    </div>
  );
}