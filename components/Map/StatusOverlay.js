import React from 'react';
import { formatLastUpdateTime } from './utils';

const StatusOverlay = ({ isLoading, boxCount, lastUpdateTime, error, isTimedOut, onRetry }) => {
  console.log('StatusOverlay rendered with:', { isLoading, boxCount, lastUpdateTime, error, isTimedOut });

  if (!isLoading && !error && !isTimedOut) {
    console.log('StatusOverlay not rendering due to no active status');
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        {isLoading && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-xl font-semibold mb-2">Loading...</p>
            <p className="text-sm text-gray-600">Please wait while we fetch the data.</p>
            <div className="mt-4 text-sm text-gray-500">
              <p>Boxes loaded: {boxCount}</p>
              <p>Last update: {formatLastUpdateTime(lastUpdateTime, new Date())}</p>
            </div>
          </>
        )}
        {(error || isTimedOut) && (
          <>
            <p className="text-xl font-semibold mb-2 text-red-600">Error</p>
            <p className="text-sm text-gray-600">{error || 'Operation timed out'}</p>
            <button 
              onClick={onRetry}
              className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Retry
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default StatusOverlay;