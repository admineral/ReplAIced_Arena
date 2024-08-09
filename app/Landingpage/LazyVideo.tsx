import React, { useRef, useEffect, useState } from 'react';

const videos = [
  '/gen3.webm',
  '/gen3_2.webm',
  '/gen3_3.webm',
  // Add more video paths here as needed
  '/gen3_4.webm',
  '/gen3_5.webm',
  '/gen3_6.webm',
  // ... and so on
];

const LazyVideo: React.FC = () => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Choose a random video on initial load
    const randomIndex = Math.floor(Math.random() * videos.length);
    const selectedVideo = videos[randomIndex];
    console.log(`Selected video: ${selectedVideo}`);

    const video = videoRef.current;
    if (!video) return;

    // Set the video source
    video.src = selectedVideo;

    const handleCanPlay = () => {
      setIsVideoLoaded(true);
      video.play().catch(error => console.error('Auto-play failed:', error));
    };

    video.addEventListener('canplay', handleCanPlay);

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, []);

  return (
    <video 
      ref={videoRef}
      autoPlay 
      loop 
      muted 
      playsInline
      className={`fixed z-0 w-auto min-w-full min-h-full max-w-none object-cover transition-opacity duration-1000 ${isVideoLoaded ? 'opacity-100' : 'opacity-0'}`}
    >
      Your browser does not support the video tag.
    </video>
  );
};

export default LazyVideo;