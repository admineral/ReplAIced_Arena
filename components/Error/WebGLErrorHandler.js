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