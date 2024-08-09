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
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => {
      setIsLoading(false);
      video.play().catch(error => console.error('Auto-play failed:', error));
    };

    const handleEnded = () => {
      setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length);
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('ended', handleEnded);

    // Set the initial video source
    video.src = videos[currentVideoIndex];

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
      className={`fixed z-0 w-auto min-w-full min-h-full max-w-none object-cover transition-opacity duration-1000 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
    >
      <source src={videos[currentVideoIndex]} type="video/webm" />
      Your browser does not support the video tag.
    </video>
  );
};

export default LazyVideo;