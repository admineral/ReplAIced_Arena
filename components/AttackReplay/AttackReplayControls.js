import React, { useCallback, useState, useEffect } from 'react';
import { useMapContext } from '../../contexts/MapContext';
import { PlayIcon, PauseIcon, StopIcon, HomeIcon, ForwardIcon } from '@heroicons/react/24/solid';

const TimeDisplay = React.memo(({ time }) => {
  const formatTime = (seconds) => {
    const date = new Date(0);
    date.setSeconds(seconds);
    return date.toISOString().substr(11, 8);
  };

  return <span className="text-white font-mono text-lg">{formatTime(time)}</span>;
});

const AttackMarker = ({ marker, maxTime }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="absolute top-1/2 w-1 h-3 cursor-pointer z-30 group"
      style={{ left: `${(marker.time / maxTime) * 100}%`, transform: 'translate(-50%, -50%)' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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

const AttackReplayControls = () => {
  const { attackReplay } = useMapContext();
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
    cycleSpeed
  } = attackReplay;

  const [sliderMax, setSliderMax] = useState(maxTime);

  useEffect(() => {
    setSliderMax(prevMax => Math.max(prevMax, maxTime));
  }, [maxTime]);

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

  return (
    <div className="w-full max-w-3xl bg-gray-800 bg-opacity-95 p-4 rounded-lg shadow-lg relative">
      {/* Timeline slider */}
      <div className="relative w-full h-4 bg-gray-700 rounded-full mb-4 overflow-visible">
        {/* Progress bar */}
        <div 
          className="absolute top-0 left-0 h-full bg-blue-500 opacity-50 rounded-full transition-all duration-300 ease-in-out z-10" 
          style={{ width: `${(currentTime / sliderMax) * 100}%` }}
        ></div>
        {/* Attack markers */}
        {attackMarkers.map(marker => (
          <AttackMarker key={marker.id} marker={marker} maxTime={sliderMax} />
        ))}
        {/* Slider input */}
        <input 
          type="range" 
          min="0" 
          max={sliderMax} 
          value={currentTime} 
          onChange={handleSliderChange}
          className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-20"
        />
      </div>
      {/* Control buttons and time display */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-3">
          {/* Play/Pause button */}
          <button 
            onClick={handlePlayPause}
            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200"
          >
            {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
          </button>
          {/* Stop button */}
          <button 
            onClick={stop}
            className="p-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition-colors duration-200"
          >
            <StopIcon className="w-6 h-6" />
          </button>
          {/* Reset button */}
          <button 
            onClick={resetToStart}
            className="p-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition-colors duration-200"
          >
            <HomeIcon className="w-6 h-6" />
          </button>
          {/* Speed control button */}
          <button 
            onClick={cycleSpeed}
            className="p-2 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50 transition-colors duration-200 flex items-center"
          >
            <ForwardIcon className="w-6 h-6" />
            <span className="ml-1 font-semibold">{playbackSpeed}x</span>
          </button>
        </div>
        {/* Time display */}
        <TimeDisplay time={currentTime} />
      </div>
    </div>
  );
};

export default AttackReplayControls;