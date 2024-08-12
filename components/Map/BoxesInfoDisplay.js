import React, { useState, useEffect, useRef } from 'react';
import { formatLastUpdateTime } from './utils';
import { FaInfoCircle } from 'react-icons/fa';
import { useMediaQuery } from 'react-responsive';

const BoxesInfoDisplay = ({ boxCount, lastUpdateTime, currentTime, forceExpand }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const timeoutRef = useRef(null);
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const expandInfo = () => {
    setIsExpanded(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const startCloseTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsExpanded(false);
    }, 3000); // Close after 3 seconds of inactivity
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

  const positionClass = isMobile ? "top-4 left-4" : "bottom-4 left-4";

  return (
    <div 
      className={`absolute ${positionClass} bg-gray-800 bg-opacity-70 text-white rounded-lg text-sm transition-all duration-300 z-10`}
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