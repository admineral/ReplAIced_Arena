/****************************************************************************
 * components/Error/WebGLErrorHandler.js
 * 
 * WebGL Error Handler Component for AI Security Map
 * 
 * This component monitors the WebGL context and displays an error message
 * if the context is lost. It's crucial for providing a graceful degradation
 * experience in case of WebGL-related issues.
 * 
 * Context:
 * - Part of the AI Security Map application's error handling system
 * - Used within the MapCanvas component
 * 
 * Key Features:
 * 1. Listens for WebGL context lost and restored events
 * 2. Displays a full-screen error message when WebGL context is lost
 * 3. Automatically clears the error message if the context is restored
 * 4. Cleans up event listeners on component unmount
 * 
 * Dependencies:
 * - react-three-fiber: Used to access the WebGL context
 * - @react-three/drei: Used for the Html component (ensure it's imported)
 * 
 * State:
 * - hasWebGLError: Boolean indicating whether a WebGL error has occurred
 * 
 * Note: This component should be placed within a React Three Fiber Canvas
 * component to have access to the WebGL context via useThree hook.
 ****************************************************************************/




import React, { useState, useEffect } from 'react';
import { useThree } from '@react-three/fiber';

const WebGLErrorHandler = () => {
  const { gl } = useThree();
  const [hasWebGLError, setHasWebGLError] = useState(false);

  useEffect(() => {
    if (!gl || !gl.canvas) return;

    const handleContextLost = (event) => {
      event.preventDefault();
      console.error('WebGL context lost');
      setHasWebGLError(true);
    };

    const handleContextRestored = () => {
      console.log('WebGL context restored');
      setHasWebGLError(false);
    };

    gl.canvas.addEventListener('webglcontextlost', handleContextLost);
    gl.canvas.addEventListener('webglcontextrestored', handleContextRestored);

    return () => {
      if (gl && gl.canvas) {
        gl.canvas.removeEventListener('webglcontextlost', handleContextLost);
        gl.canvas.removeEventListener('webglcontextrestored', handleContextRestored);
      }
    };
  }, [gl]);

  if (hasWebGLError) {
    return (
      <Html>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          zIndex: 1000
        }}>
          <p>WebGL context lost. Please refresh the page or try a different browser.</p>
        </div>
      </Html>
    );
  }

  return null;
};

export default WebGLErrorHandler; 