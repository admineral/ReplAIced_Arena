'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ArenaNavbar from './ArenaNavbar';
import DeleteConfirmationModal from '../Modals/DeleteConfirmationModal';
import { useAuth } from '../../contexts/AuthContext';
import { useMapContext } from '../../contexts/MapContext';
import { db } from '../../firebase-config';
import { deleteDoc, doc } from 'firebase/firestore';

// Custom hook for checking user box
const useUserBox = (user:any, getUserBoxes:any) => {
  const [userHasBox, setUserHasBox] = useState(false);

  useEffect(() => {
    const checkUserBox = async () => {
      if (user) {
        try {
          const userBoxes = await getUserBoxes(user.uid);
          setUserHasBox(userBoxes.length > 0);
        } catch (error) {
          console.error('Error checking user box:', error);
          setUserHasBox(false);
        }
      } else {
        setUserHasBox(false);
      }
    };

    checkUserBox();
  }, [user, getUserBoxes]);

  return userHasBox;
};

interface ControlPanelProps {
  mode: string;
  switchMode: (mode: string) => void;
  reloadBoxes: () => void;
  clearAllBoxes: () => Promise<void>;
  isAttackModeAvailable: boolean;
  isLoading: boolean;
  setLastUpdateTime: (date: Date) => void;
  openCreateBoxModal: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = React.memo(({ 
  mode, 
  switchMode, 
  reloadBoxes,
  clearAllBoxes,
  isAttackModeAvailable, 
  isLoading,
  setLastUpdateTime,
  openCreateBoxModal
}) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { isAdmin, user, getUserBoxes } = useAuth();
  const { setMapPosition, setMapZoom, forceReloadBoxes } = useMapContext();

  const userHasBox = useUserBox(user, getUserBoxes);

  useEffect(() => {
    if (user && mode === 'create') {
      switchMode('preview');
    }
  }, [user, mode, switchMode]);

  const handleReload = useCallback(() => {
    console.log('Reloading boxes');
    reloadBoxes();
  }, [reloadBoxes]);

  const handleClearAllBoxes = useCallback(() => {
    setIsDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    setIsDeleteModalOpen(false);
    if (isAdmin) {
      try {
        await clearAllBoxes();
      } catch (error) {
        console.error('Error clearing boxes:', error);
      }
    } else if (user) {
      try {
        const userBoxes = await getUserBoxes(user.uid);
        if (userBoxes.length > 0) {
          const boxData = userBoxes[0];
          const boxRef = doc(db, 'boxes', boxData.customId);
          await deleteDoc(boxRef);
          const boxOwnerRef = doc(db, 'boxOwners', boxData.firestoreId);
          await deleteDoc(boxOwnerRef);
        }
      } catch (error) {
        console.error('Error deleting box:', error);
      }
    }
  }, [isAdmin, user, clearAllBoxes, getUserBoxes]);

  const handleGoToMyBox = useCallback(async () => {
    if (user) {
      try {
        const userBoxes = await getUserBoxes(user.uid);
        if (userBoxes.length > 0) {
          const boxData = userBoxes[0];
          setMapPosition({ x: boxData.x, y: boxData.y });
          setMapZoom(2);
        }
      } catch (error) {
        console.error('Error getting user boxes:', error);
      }
    }
  }, [user, getUserBoxes, setMapPosition, setMapZoom]);

  const renderButtons = useMemo(() => (
    <div className="flex justify-center space-x-4 mt-4">
      {user && !userHasBox && (
        <button
          className="bg-green-500 text-white rounded-full p-2 shadow-lg hover:bg-green-600 transition-colors duration-300"
          title="Create Box"
          onClick={openCreateBoxModal}
        >
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      )}
      {user && userHasBox && (
        <button
          onClick={handleGoToMyBox}
          className="bg-blue-500 text-white rounded-full p-2 shadow-lg hover:bg-blue-600 transition-colors duration-300"
          title="Go to Your Box"
        >
          <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </button>
      )}
      <button
        onClick={handleReload}
        disabled={isLoading}
        className={`bg-blue-500 text-white rounded-full p-2 shadow-lg hover:bg-blue-600 transition-colors duration-300 ${
          isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        title="Reload boxes"
      >
        {isLoading ? (
          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        )}
      </button>
      {isAdmin && (
        <button
          onClick={handleClearAllBoxes}
          className="bg-red-500 text-white rounded-full p-2 shadow-lg hover:bg-red-600 transition-colors duration-300"
          title="Clear All Boxes"
        >
          <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
    </div>
  ), [user, userHasBox, isAdmin, isLoading, handleReload, handleGoToMyBox, handleClearAllBoxes, openCreateBoxModal]);

  return (
    <>
      <ArenaNavbar 
        mode={mode}
        switchMode={switchMode}
        isAttackModeAvailable={isAttackModeAvailable}
      />
      {renderButtons}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
});

export default ControlPanel;