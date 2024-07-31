/****************************************************************************
 * hooks/useScreenSize.js
 * 
 * Screen Size Custom Hook for AI Security Map
 * 
 * This custom React hook provides real-time screen size information for the 
 * AI Security Map application. It tracks changes in the window's dimensions 
 * and updates the state accordingly.
 * 
 * Usage:
 * const { width, height } = useScreenSize();
 * 
 * Returns:
 * An object containing:
 * - width: Current width of the window in pixels
 * - height: Current height of the window in pixels
 * 
 * Key Features:
 * 1. Initializes with current window dimensions on mount
 * 2. Updates dimensions in real-time when the window is resized
 * 3. Cleans up event listener on component unmount to prevent memory leaks
 * 
 * Note: This hook uses the window object, so it should only be used in 
 * components that are rendered on the client-side. For server-side rendering,
 * ensure proper checks are in place before using this hook.
 ****************************************************************************/


import { useState, useEffect } from 'react';

const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState({
    width: 0,
    height: 0
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    // Set size on initial render
    handleResize();

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return screenSize;
};

export default useScreenSize;