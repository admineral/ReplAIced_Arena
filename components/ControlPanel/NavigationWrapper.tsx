'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { MapProvider, useMapContext } from '../../contexts/MapContext';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../GeneralNavbar/Navbar';
import LandingPageNavbar from '../../app/Landingpage/LandingPageNavbar';
import ControlPanel from './ControlPanel_Component';
import MapCanvas from '../Map/MapCanvas';
import MiniMap from '../MiniMap/MiniMap_Component';
import ModalManager from '../Modals/ModalManager';
import CreateBoxModal from '../Modals/CreateBoxModal';
import LoadingOverlay from '../Map/LoadingOverlay';
import ErrorOverlay from '../Map/ErrorOverlay';
import BoxesInfoDisplay from '../Map/BoxesInfoDisplay';
import AttackGuidedTour from '../Map/AttackGuidedTour';
import AttackReplayControls from '../AttackReplay/AttackReplayControls';
import { useUpdateTimeInterval } from '../../hooks/useUpdateTimeInterval';
import * as eventHandlers from '../Map/eventHandlers';
import * as dataManagement from '../Map/dataManagement';
import { BoxData } from '../../types/BoxTypes';
import { useMediaQuery } from 'react-responsive';
import AISecurityMap from '../Map/AISecurityMap';

function NavigationWrapperContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';
  const isArenaPage = pathname === '/Arena';
  const { user } = useAuth();
  const mapContext = useMapContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date());
  const [isCreateBoxModalOpen, setIsCreateBoxModalOpen] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [forceExpand, setForceExpand] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  const currentTime = useUpdateTimeInterval(lastUpdateTime);

  const {
    mode,
    boxes,
    selectedBox,
    targetBox,
    isAttackModeAvailable,
    isAttacking,
    isConfigOpen,
    isChallengeOpen,
    isAttackModalOpen,
    setIsConfigOpen,
    setIsChallengeOpen,
    setIsAttackModalOpen,
    updateBox,
    handleConfirmAttack,
    MAP_SIZE,
    mapPosition,
    mapZoom,
    handleMapPositionChange,
    handleMapZoomChange,
    switchMode,
    attackReplay,
    addBox,
    setBoxes,
    loadBoxesFromFirebase,
    clearAllBoxes,
  } = mapContext;

  useEffect(() => {
    const expanded = mapPosition.x < 0 || mapPosition.y < 0 || 
                     mapPosition.x > MAP_SIZE || mapPosition.y > MAP_SIZE;
    setIsMapExpanded(expanded);
  }, [mapPosition, MAP_SIZE]);

  const openCreateBoxModal = eventHandlers.handleOpenCreateBoxModal(setIsCreateBoxModalOpen);
  const closeCreateBoxModal = eventHandlers.handleCloseCreateBoxModal(setIsCreateBoxModalOpen);
  const createBox = eventHandlers.handleCreateBox(
    (boxData: BoxData) => addBox(boxData, user?.uid),
    MAP_SIZE,
    handleMapPositionChange,
    handleMapZoomChange,
    setIsCreateBoxModalOpen
  );
  const handleMiniMapPositionChange = eventHandlers.handleMiniMapPositionChange(handleMapPositionChange);
  const handleMiniMapZoomChange = eventHandlers.handleMiniMapZoomChange(handleMapZoomChange);

  const loadBoxes = useCallback(() => {
    const loadBoxesFromFirebaseWrapper = async () => {
      if (isArenaPage) {
        try {
          const result = await loadBoxesFromFirebase();
          console.log('Result from loadBoxesFromFirebase:', result);
          return result;
        } catch (error) {
          console.error('Error loading boxes from Firestore:', error);
          throw error;
        }
      } else {
        return [];
      }
    };

    const loadBoxesHandler = dataManagement.handleLoadBoxes(
      loadBoxesFromFirebaseWrapper,
      setIsLoading,
      setError,
      setIsTimedOut,
      setLastUpdateTime,
      setLoadingTimeout,
      (boxes: any) => {
        console.log('Setting boxes:', boxes);
        setBoxes(boxes);
      }
    );

    return loadBoxesHandler();
  }, [isArenaPage, loadBoxesFromFirebase, setBoxes]);

  const forceReloadBoxes = useCallback(async () => {
    console.log('Force reloading boxes');
    setIsLoading(true);
    try {
      const boxes = await loadBoxesFromFirebase(true);
      console.log('Boxes fetched during force reload:', boxes);
      setBoxes(boxes);
      setLastUpdateTime(new Date());
      setForceExpand(true);
      setTimeout(() => setForceExpand(false), 100);
    } catch (error) {
      console.error('Error during force reload:', error);
      setError('Failed to reload boxes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [loadBoxesFromFirebase, setBoxes]);

  const clearBoxes = useCallback(async () => {
    try {
      await clearAllBoxes();
      setLastUpdateTime(new Date());
    } catch (error) {
      console.error('Error clearing boxes:', error);
      setError('Failed to clear boxes. Please try again.');
    }
  }, [clearAllBoxes]);

  const retryLoading = useCallback(() => {
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
    }
    setError(null);
    setIsTimedOut(false);
    loadBoxes();
  }, [loadingTimeout, loadBoxes]);

  const scrollToSection = useCallback((section: string) => {
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setActiveSection(section);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'features', 'contact'];
      let currentSection = 'home';

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100) {
            currentSection = section;
          } else {
            break;
          }
        }
      }

      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isArenaPage) {
      switchMode('preview');
    }
  }, [isArenaPage, switchMode]);

  useEffect(() => {
    if (mode === 'preview' && isArenaPage) {
      loadBoxes();
    }
  }, [mode, loadBoxes, isArenaPage]);

  if (isLandingPage) {
    return (
      <>
        <LandingPageNavbar activeSection={activeSection} scrollToSection={scrollToSection} />
        <main>{children}</main>
      </>
    );
  }

  if (isArenaPage) {
    return (
      <div className="flex flex-col h-screen w-screen bg-gray-900 overflow-hidden">
        <div className="relative z-20">
          <ControlPanel 
            mode={mode}
            switchMode={switchMode}
            openCreateBoxModal={openCreateBoxModal}
            reloadBoxes={forceReloadBoxes}
            clearAllBoxes={clearBoxes}
            isAttackModeAvailable={isAttackModeAvailable}
            isLoading={isLoading}
            setLastUpdateTime={setLastUpdateTime}
            onBoxCreated={() => loadBoxes()}
            mapPosition={mapPosition}
            mapZoom={mapZoom}
            onMapPositionChange={handleMapPositionChange}
            onMapZoomChange={handleMapZoomChange}
          />
        </div>
        <div className="flex-grow relative z-10 overflow-hidden">
          <AISecurityMap />
        </div>
        
        <ModalManager
          isConfigOpen={isConfigOpen}
          isChallengeOpen={isChallengeOpen}
          isAttackModalOpen={isAttackModalOpen}
          selectedBox={selectedBox}
          targetBox={targetBox}
          onConfigUpdate={updateBox}
          onAttackConfirm={handleConfirmAttack}
          setIsConfigOpen={setIsConfigOpen}
          setIsChallengeOpen={setIsChallengeOpen}
          setIsAttackModalOpen={setIsAttackModalOpen}
        />
        <CreateBoxModal
          isOpen={isCreateBoxModalOpen}
          onClose={closeCreateBoxModal}
          onCreateBox={createBox}
          mapSize={MAP_SIZE}
        />
        <LoadingOverlay 
          isLoading={isLoading} 
          boxCount={boxes.length} 
          lastUpdateTime={lastUpdateTime} 
        />
        <ErrorOverlay 
          error={error}
          isTimedOut={isTimedOut}
          onRetry={retryLoading}
        />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}

export default function NavigationWrapper({ children }: { children: React.ReactNode }) {
  return (
    <MapProvider>
      <NavigationWrapperContent>{children}</NavigationWrapperContent>
    </MapProvider>
  );
}