/**
 * NavigationWrapper Component
 * 
 * Context: Core layout and navigation management component for the entire application.
 * Global Purpose: Provides route-based rendering and context management for all pages.
 * Local Purpose: Manages navigation, authentication, and renders appropriate components based on the current route.
 * Key Features:
 * - Implements route-specific rendering for different pages (Landing, Arena, etc.)
 * - Manages MapContext and provides it to child components
 * - Handles user authentication state
 * - Manages map-related state and operations (loading boxes, switching modes, etc.)
 * - Implements scrolling behavior for the landing page
 * - Renders and manages various UI components:
 *   - ControlPanel for the Arena
 *   - MapCanvas and related overlays
 *   - MiniMap for navigation
 *   - Modal management for various interactions
 *   - Loading and error overlays
 * - Provides event handlers for map interactions
 * - Manages data loading and error states
 * - Implements responsive layout for different screen sizes
 * - Integrates with Next.js routing for client-side navigation
 */



'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { MapProvider, useMapContext } from '../../contexts/MapContext';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../Landingpage/Navbar';
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

function NavigationWrapperContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const mapContext = useMapContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date());
  const [isCreateBoxModalOpen, setIsCreateBoxModalOpen] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(null);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

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
    mapControls,
    switchMode,
    attackReplay,
  } = mapContext;

  const openCreateBoxModal = eventHandlers.handleOpenCreateBoxModal(setIsCreateBoxModalOpen);
  const closeCreateBoxModal = eventHandlers.handleCloseCreateBoxModal(setIsCreateBoxModalOpen);
  const createBox = eventHandlers.handleCreateBox(mapContext.addBox, MAP_SIZE, mapContext.setMapPosition, mapContext.setMapZoom, setIsCreateBoxModalOpen);
  const handleMiniMapPositionChange = eventHandlers.handleMiniMapPositionChange(mapContext.setMapPosition);
  const handleMiniMapZoomChange = eventHandlers.handleMiniMapZoomChange(mapContext.setMapZoom);

  const loadBoxes = useCallback(
    dataManagement.handleLoadBoxes(
      mapContext.loadBoxesFromFirebase,
      setIsLoading,
      setError,
      setIsTimedOut,
      setLastUpdateTime,
      setLoadingTimeout
    ),
    [mapContext.loadBoxesFromFirebase]
  );

  const reloadBoxes = useCallback(() => dataManagement.handleReloadBoxes(loadBoxes)(), [loadBoxes]);
  const clearBoxes = useCallback(() => dataManagement.handleClearBoxes(mapContext.clearAllBoxes, setIsLoading, setError, setLastUpdateTime)(), [mapContext.clearAllBoxes]);
  const retryLoading = useCallback(() => eventHandlers.handleRetry(loadingTimeout, loadBoxes)(), [loadingTimeout, loadBoxes]);

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      const navbarHeight = 64;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 3;
      const sections = ['home', 'about', 'features', 'join'];

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    if (pathname === '/') {
      window.addEventListener('scroll', handleScroll);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [pathname]);

  useEffect(() => {
    setActiveSection('home');
  }, [pathname]);

  useEffect(() => {
    switchMode('preview');
  }, [switchMode]);

  useEffect(() => {
    if (mode === 'preview') {
      loadBoxes();
    }
  }, [mode, loadBoxes]);

  if (pathname === '/') {
    return (
      <>
        <LandingPageNavbar activeSection={activeSection} scrollToSection={scrollToSection} />
        <main>{children}</main>
      </>
    );
  }

  if (pathname === '/Arena') {
    return (
      <div className="flex flex-col h-screen w-screen bg-gray-900">
        <ControlPanel 
          mode={mode}
          switchMode={switchMode}
          openCreateBoxModal={openCreateBoxModal}
          reloadBoxes={reloadBoxes}
          clearAllBoxes={clearBoxes}
          isAttackModeAvailable={isAttackModeAvailable}
          isLoading={isLoading}
          setLastUpdateTime={setLastUpdateTime}
        />
        <div className="flex-grow relative">
          <MapCanvas />
          <div className="absolute inset-0 pointer-events-none">
            {mode === 'attack' && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 pointer-events-auto">
                <AttackGuidedTour
                  step={selectedBox && targetBox ? 2 : selectedBox ? 1 : 0}
                  selectedBox={selectedBox}
                  targetBox={targetBox}
                  isAttacking={isAttacking}
                />
              </div>
            )}
            
            <div className="absolute bottom-0 left-0 right-0 flex justify-between items-end p-4">
              <div className="pointer-events-auto">
                <BoxesInfoDisplay 
                  boxCount={boxes.length}
                  lastUpdateTime={lastUpdateTime}
                  currentTime={currentTime}
                />
              </div>
              
              <div className="pointer-events-auto flex-grow mx-4 max-w-3xl z-50">
                <AttackReplayControls />
              </div>
              
              <div className="pointer-events-auto">
                <MiniMap 
                  boxes={boxes} 
                  mapSize={MAP_SIZE} 
                  currentPosition={mapControls.position}
                  currentZoom={mapControls.zoom}
                  onPositionChange={handleMiniMapPositionChange}
                  onZoomChange={handleMiniMapZoomChange}
                  miniMapSize={200}
                  miniMapZoom={1.5}
                  boxSize={4}
                  padding={8}
                  backgroundColor="rgba(0, 0, 0, 0.7)"
                  borderColor="#4a5568"
                  viewRectColor="#ffd700"
                />
              </div>
            </div>
          </div>
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