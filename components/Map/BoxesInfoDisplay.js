import React, { useState, useEffect, useRef } from 'react';
import { formatLastUpdateTime } from './utils';
import { FaInfoCircle } from 'react-icons/fa';

const BoxesInfoDisplay = ({ boxCount, lastUpdateTime, currentTime, forceExpand }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const timeoutRef = useRef(null);

  const expandInfo = () => {
    setIsExpanded(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const startCloseTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsExpanded(false);
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (isExpanded) {
      startCloseTimer();
    }
  }, [isExpanded]);

  useEffect(() => {
    if (forceExpand) {
      expandInfo();
    }
  }, [forceExpand]);

  return (
    <div 
      className="bg-gray-800 bg-opacity-70 text-white rounded-lg text-sm transition-all duration-300"
      onMouseEnter={expandInfo}
      onMouseLeave={startCloseTimer}
      onClick={expandInfo}
    >
      {isExpanded ? (
        <div className="p-2">
          <div className="font-semibold">Boxes: {boxCount}</div>
          <div className="text-gray-300 flex justify-between mt-2">
            <span>Updated:</span>
            <span className="ml-2">{formatLastUpdateTime(lastUpdateTime, currentTime)}</span>
          </div>
        </div>
      ) : (
        <div className="p-2 cursor-pointer">
          <FaInfoCircle size={20} />
        </div>
      )}
    </div>
  );
};

export default BoxesInfoDisplay;