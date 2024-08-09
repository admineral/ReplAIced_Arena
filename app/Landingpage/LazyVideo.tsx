import React, { useRef, useEffect, useState } from 'react';

const videos = [
  '/gen3.webm',
  '/gen3_2.webm',
  '/gen3_3.webm',
  '/gen3_4.webm',
  '/gen3_5.webm',
  '/gen3_6.webm',
  // Add more video paths here as needed
];

const LazyVideo: React.FC = () => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => {
      setIsVideoLoaded(true);
      video.play().catch(error => console.error('Auto-play failed:', error));
    };

    const handleEnded = () => {
      // Move to the next video when the current one ends
      setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length);
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('ended', handleEnded);

    // Set the initial video source
    video.src = videos[currentVideoIndex];
    console.log(`Playing video: ${videos[currentVideoIndex]}`);

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('ended', handleEnded);
    };
  }, [currentVideoIndex]);

  return (
    <video 
      ref={videoRef}
      autoPlay 
      muted 
      playsInline
      className={`fixed z-0 w-auto min-w-full min-h-full max-w-none object-cover transition-opacity duration-1000 ${isVideoLoaded ? 'opacity-100' : 'opacity-0'}`}
    >
      Your browser does not support the video tag.
    </video>
  );
};

export default LazyVideo;