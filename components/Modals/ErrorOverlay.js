/****************************************************************************
 * components/Map/ErrorOverlay.js
 * 
 * Error Overlay Component for AI Security Map
 * 
 * This component displays an error overlay when there's an error in loading
 * or processing data. It shows an error message and provides a retry button.
 ****************************************************************************/

import React from 'react';

const ErrorOverlay = ({ error, isTimedOut, onRetry }) => {
  if (!error && !isTimedOut) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-md">
        <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Error</h2>
        <p className="text-gray-600 mb-6">
          {isTimedOut
            ? 'Loading timed out. Please check your connection and try again.'
            : error || 'An unexpected error occurred. Please try again.'}
        </p>
        <button
          onClick={onRetry}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out"
        >
          Retry
        </button>
      </div>
    </div>
  );
};

export default ErrorOverlay;