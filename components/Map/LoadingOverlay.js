/****************************************************************************
 * components/Map/LoadingOverlay.js
 * 
 * Loading Overlay Component for AI Security Map
 * 
 * This component displays a loading overlay with a spinner and loading text.
 * It also shows the current number of loaded boxes and the last update time.
 ****************************************************************************/

import React from 'react';
import { formatLastUpdateTime } from './utils';

const LoadingOverlay = ({ isLoading, boxCount, lastUpdateTime }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-xl font-semibold mb-2">Loading...</p>
        <p className="text-sm text-gray-600">Please wait while we fetch the data.</p>
        <div className="mt-4 text-sm text-gray-500">
          <p>Boxes loaded: {boxCount}</p>
          <p>Last update: {formatLastUpdateTime(lastUpdateTime, new Date())}</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;