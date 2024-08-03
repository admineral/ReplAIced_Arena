// src/hooks/useAttackReplay.js

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { getAttacks, subscribeToAttacks } from '../services/firestore';

const useAttackReplay = (date) => {
  const [attacks, setAttacks] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [lastDoc, setLastDoc] = useState(null);
  const [maxTime, setMaxTime] = useState(0);
  const [selectedAttack, setSelectedAttack] = useState(null);

  const triggerAttackVisualizationRef = useRef(null);

  const updateMaxTime = useCallback((attacksArray) => {
    if (attacksArray.length > 0) {
      const latestAttackTime = Math.max(...attacksArray.map(attack => attack.timestamp));
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const maxTimeValue = Math.max(
        Math.floor((latestAttackTime - startOfDay) / 1000),
        Math.floor((now - startOfDay) / 1000)
      );
      setMaxTime(prevMaxTime => Math.max(prevMaxTime, maxTimeValue));
    }
  }, []);

  useEffect(() => {
    const fetchInitialAttacks = async () => {
      const { attacks: initialAttacks, lastDoc: lastDocSnapshot } = await getAttacks(date);
      console.log('Initial attacks fetched:', initialAttacks.length);
      setAttacks(initialAttacks);
      setLastDoc(lastDocSnapshot);
      updateMaxTime(initialAttacks);
    };

    fetchInitialAttacks();

    const unsubscribe = subscribeToAttacks(date, (updatedAttacks) => {
      console.log('New attacks received:', updatedAttacks.length);
      setAttacks(prevAttacks => {
        const newAttacks = updatedAttacks.filter(attack => 
          !prevAttacks.some(prevAttack => prevAttack.id === attack.id)
        );
        const allAttacks = [...prevAttacks, ...newAttacks].sort((a, b) => a.timestamp - b.timestamp);
        updateMaxTime(allAttacks);
        return allAttacks;
      });
    });

    return () => unsubscribe();
  }, [date, updateMaxTime]);

  const loadMoreAttacks = useCallback(async () => {
    if (lastDoc) {
      const { attacks: newAttacks, lastDoc: newLastDoc } = await getAttacks(date, 100, lastDoc);
      console.log('Additional attacks loaded:', newAttacks.length);
      setAttacks(prevAttacks => {
        const allAttacks = [...prevAttacks, ...newAttacks];
        updateMaxTime(allAttacks);
        return allAttacks;
      });
      setLastDoc(newLastDoc);
    }
  }, [date, lastDoc, updateMaxTime]);

  const play = useCallback(() => {
    console.log('Play function called');
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    console.log('Pause function called');
    setIsPlaying(false);
  }, []);

  const stop = useCallback(() => {
    console.log('Stop function called');
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  const resetToStart = useCallback(() => {
    console.log('Reset to start called');
    setCurrentTime(0);
  }, []);

  const setTime = useCallback((time) => {
    console.log('Set time called:', time);
    setCurrentTime(time);
  }, []);

  const cycleSpeed = useCallback(() => {
    setPlaybackSpeed(prevSpeed => {
      const speeds = [1, 2, 3, 5, 10];
      const currentIndex = speeds.indexOf(prevSpeed);
      const nextIndex = (currentIndex + 1) % speeds.length;
      const newSpeed = speeds[nextIndex];
      console.log('Speed cycled to:', newSpeed);
      return newSpeed;
    });
  }, []);

  const attackMarkers = useMemo(() => {
    const markers = attacks.map(attack => ({
      time: new Date(attack.timestamp).getHours() * 3600 + 
            new Date(attack.timestamp).getMinutes() * 60 + 
            new Date(attack.timestamp).getSeconds(),
      id: attack.id,
      timestamp: attack.timestamp
    }));
    console.log('Attack markers updated:', markers.length);
    return markers;
  }, [attacks]);

  const handleAttackMarkerClick = useCallback((marker) => {
    const clickedAttack = attacks.find(attack => attack.id === marker.id);
    if (clickedAttack) {
      setSelectedAttack(clickedAttack);
      const attackTime = Math.floor((clickedAttack.timestamp - new Date(date).getTime()) / 1000);
      setCurrentTime(attackTime);
      setIsPlaying(false);
      console.log('Attack marker clicked:', clickedAttack);
      return clickedAttack;
    }
  }, [attacks, date]);

  const triggerAttackVisualization = useCallback((attack) => {
    if (triggerAttackVisualizationRef.current) {
      triggerAttackVisualizationRef.current(attack);
    }
  }, []);

  useEffect(() => {
    let intervalId;
    if (isPlaying) {
      intervalId = setInterval(() => {
        setCurrentTime((prevTime) => {
          const newTime = prevTime + playbackSpeed;
          if (newTime >= maxTime) {
            clearInterval(intervalId);
            setIsPlaying(false);
            return maxTime;
          }
          return newTime;
        });
      }, 1000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPlaying, maxTime, playbackSpeed]);

  useEffect(() => {
    console.log('Current state:', {
      attacksCount: attacks.length,
      currentTime,
      isPlaying,
      playbackSpeed,
      maxTime,
      attackMarkersCount: attackMarkers.length,
      selectedAttack: selectedAttack ? selectedAttack.id : null
    });
  }, [attacks, currentTime, isPlaying, playbackSpeed, maxTime, attackMarkers, selectedAttack]);

  return { 
    attacks, 
    currentTime, 
    isPlaying, 
    playbackSpeed,
    maxTime,
    attackMarkers,
    selectedAttack,
    play,
    pause,
    stop,
    resetToStart,
    setTime,
    cycleSpeed,
    loadMoreAttacks,
    handleAttackMarkerClick,
    triggerAttackVisualization,
    triggerAttackVisualizationRef
  };
};

export default useAttackReplay;