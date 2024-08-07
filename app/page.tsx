'use client'

import React, { useState } from 'react';
import LandingPage from './Landingpage/page';
import AISecurityMap from '../components/Map/AISecurityMap';

export default function App() {
  const [showMap, setShowMap] = useState(false);

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

  return <LandingPage onGetStarted={handleGetStarted} />;
}