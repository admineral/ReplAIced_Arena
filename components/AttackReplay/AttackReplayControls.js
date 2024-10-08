import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { useMapContext } from '../../contexts/MapContext';
import { PlayIcon, PauseIcon, StopIcon, HomeIcon, ForwardIcon } from '@heroicons/react/24/solid';
import { useMediaQuery } from 'react-responsive';

const TimeDisplay = React.memo(({ time }) => {
  const formatTime = (seconds) => {
    const date = new Date(0);
    date.setSeconds(seconds);
    return date.toISOString().substr(11, 8);
  };

  return (
    <span className="text-white font-mono text-xs">
      {formatTime(time)}
    </span>
  );
});

const AttackMarker = ({ marker, maxTime, onMarkerClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="absolute top-1/2 w-1 h-3 cursor-pointer z-30 group"
      style={{ left: `${(marker.time / maxTime) * 100}%`, transform: 'translate(-50%, -50%)' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onMarkerClick(marker)}
    >
      <div className="h-full w-full bg-red-500 rounded-full transition-all duration-200 ease-in-out group-hover:scale-150" />
      {isHovered && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 mb-2 whitespace-nowrap z-40">
          {new Date(marker.timestamp).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

const AttackReplayControls = ({ isMapExpanded, isMobile }) => {
  const { attackReplay, setMode, boxes } = useMapContext();
  const { handleMapPositionChange, handleMapZoomChange } = useMapContext();
  const { 
    currentTime, 
    isPlaying, 
    play, 
    pause, 
    stop,
    setTime,
    resetToStart,
    maxTime,
    attackMarkers,
    playbackSpeed,
    cycleSpeed,
    handleAttackMarkerClick,
    triggerAttackVisualization,
    attacks
  } = attackReplay;

  const [sliderMax, setSliderMax] = useState(maxTime);

  useEffect(() => {
    const latestMarkerTime = Math.max(...attackMarkers.map(marker => marker.time), 0);
    setSliderMax(prevMax => Math.max(prevMax, latestMarkerTime, maxTime));
  }, [attackMarkers, maxTime]);

  const sortedAttackMarkers = useMemo(() => {
    return [...attackMarkers]
      .sort((a, b) => a.time - b.time)
      .filter((marker, index, self) => 
        index === self.findIndex((t) => t.time === marker.time)
      );
  }, [attackMarkers]);

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const handleSliderChange = useCallback((e) => {
    const newTime = parseInt(e.target.value);
    setTime(newTime);
  }, [setTime]);

  const handleMarkerClick = useCallback((marker) => {
    console.log('Marker clicked:', marker);
    const clickedAttack = handleAttackMarkerClick(marker);
    setMode('attack');
    
    if (clickedAttack && clickedAttack.attackerId && clickedAttack.targetId) {
      const attacker = boxes.find(box => box.id === clickedAttack.attackerId);
      const target = boxes.find(box => box.id === clickedAttack.targetId);
      
      if (attacker && target) {
        const centerX = (attacker.x + target.x) / 2;
        const centerY = (attacker.y + target.y) / 2;
        
        handleMapPositionChange({ x: centerX, y: centerY });
        
        const distance = Math.sqrt(Math.pow(target.x - attacker.x, 2) + Math.pow(target.y - attacker.y, 2));
        const newZoomLevel = Math.max(1, 5 / distance);
        handleMapZoomChange(newZoomLevel);

        triggerAttackVisualization(clickedAttack);
      }
    }
  }, [handleAttackMarkerClick, setMode, handleMapPositionChange, handleMapZoomChange, boxes, triggerAttackVisualization]);

  return (
    <div className={`w-full bg-gray-800 bg-opacity-95 p-4 rounded-lg shadow-lg relative`}>
      <div className="relative w-full h-3 bg-gray-700 rounded-full mb-1 overflow-visible">
        <div 
          className="absolute top-0 left-0 h-full bg-blue-500 opacity-50 rounded-full transition-all duration-300 ease-in-out z-10" 
          style={{ width: `${(currentTime / sliderMax) * 100}%` }}
        ></div>
        {sortedAttackMarkers.map(marker => (
          <AttackMarker 
            key={marker.id} 
            marker={marker} 
            maxTime={sliderMax} 
            onMarkerClick={handleMarkerClick}
          />
        ))}
        <input 
          type="range" 
          min="0" 
          max={sliderMax} 
          value={currentTime} 
          onChange={handleSliderChange}
          className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-20"
        />
      </div>
      <div className="flex justify-end mb-2">
        <TimeDisplay time={currentTime} />
      </div>
      <div className="flex justify-between items-center">
        <div className="flex space-x-1">
          <button 
            onClick={handlePlayPause}
            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200"
          >
            {isPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
          </button>
          <button 
            onClick={stop}
            className="p-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition-colors duration-200"
          >
            <StopIcon className="w-5 h-5" />
          </button>
          <button 
            onClick={resetToStart}
            className="p-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition-colors duration-200"
          >
            <HomeIcon className="w-5 h-5" />
          </button>
          <button 
            onClick={cycleSpeed}
            className="p-2 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50 transition-colors duration-200 flex items-center"
          >
            <ForwardIcon className="w-5 h-5" />
            <span className="ml-1 font-semibold text-xs">{playbackSpeed}x</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttackReplayControls;