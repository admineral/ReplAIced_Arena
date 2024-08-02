/****************************************************************************
 * components/Map/BoxesInfoDisplay.js
 * 
 * Boxes Info Display Component for AI Security Map
 * 
 * This component displays information about the current state of boxes
 * in the AI Security Map, including the total number of boxes and the
 * last update time.
 ****************************************************************************/

import React from 'react';
import { formatLastUpdateTime } from './utils';

const BoxesInfoDisplay = ({ boxCount, lastUpdateTime, currentTime }) => {
  return (
    <div className="absolute bottom-4 left-4 bg-gray-800 bg-opacity-70 text-white p-2 rounded-lg text-sm">
      <div className="font-semibold">Boxes: {boxCount}</div>
      <div className="text-gray-300 flex justify-between">
        <span>Updated:</span>
        <span className="ml-2">{formatLastUpdateTime(lastUpdateTime, currentTime)}</span>
      </div>
    </div>
  );
};

export default BoxesInfoDisplay;