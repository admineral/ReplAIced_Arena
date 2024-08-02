/****************************************************************************
 * components/ControlPanel.js
 * 
 * Control Panel Component for AI Security Map
 * 
 * This component renders the control panel for the AI Security Map application.
 * It provides buttons for switching between different modes (create, preview, 
 * attack), a button to open the CreateBoxModal in create mode, a reload button,
 * and a login/logout button.
 * 
 * Context:
 * - Part of the AI Security Map application's user interface
 * - Typically rendered at the top of the main view
 * 
 * Props:
 * - mode: Current application mode (create, preview, attack)
 * - switchMode: Function to change the current mode
 * - openCreateBoxModal: Function to open the CreateBoxModal
 * - reloadBoxes: Function to reload boxes from Firebase
 * - clearAllBoxes: Function to clear all boxes from the map
 * - isAttackModeAvailable: Boolean indicating if attack mode can be enabled
 * - isLoading: Boolean indicating if boxes are being loaded
 * - setLastUpdateTime: Function to update the last reload time
 * 
 * Key Functionalities:
 * 1. Mode switching buttons (Create, Preview, Attack)
 * 2. Open CreateBoxModal button (in Create mode, when logged in)
 * 3. Reload button (always visible)
 * 4. Clear All Boxes button (in Create mode, when logged in)
 * 5. Login/Logout button (handled by Login component)
 * 6. Visual feedback for current mode and button states
 * 
 ****************************************************************************/
'use client';

import React, { useState } from 'react';
import Login from '../Auth/Login';
import { useAuth } from '../../contexts/AuthContext';
import DeleteConfirmationModal from '../Modals/DeleteConfirmationModal';

const ControlPanel = ({ 
  mode, 
  switchMode, 
  openCreateBoxModal,
  reloadBoxes,
  clearAllBoxes,
  isAttackModeAvailable, 
  isLoading,
  setLastUpdateTime
}) => {
  const { user } = useAuth();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleReload = () => {
    reloadBoxes();
    setLastUpdateTime(new Date());
  };

  const handleClearAllBoxes = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    clearAllBoxes();
    setIsDeleteModalOpen(false);
  };

  return (
    <>
      <div className="flex justify-between items-center p-4 bg-gray-800 bg-opacity-50">
        <div className="flex space-x-4">
          {user && (
            <button
              onClick={() => switchMode('create')}
              className={`px-6 py-3 rounded-lg font-bold text-white transition-colors duration-300 ${
                mode === 'create' ? 'bg-green-500' : 'bg-gray-600 hover:bg-green-400'
              }`}
            >
              Create
            </button>
          )}
          <button
            onClick={() => switchMode('preview')}
            className={`px-6 py-3 rounded-lg font-bold text-white transition-colors duration-300 ${
              mode === 'preview' ? 'bg-blue-500' : 'bg-gray-600 hover:bg-blue-400'
            }`}
          >
            Preview
          </button>
          {user && (
            <button
              onClick={() => switchMode('attack')}
              className={`px-6 py-3 rounded-lg font-bold text-white transition-colors duration-300 ${
                mode === 'attack' ? 'bg-red-500' : 'bg-gray-600 hover:bg-red-400'
              } ${!isAttackModeAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!isAttackModeAvailable}
            >
              Attack
            </button>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {mode === 'create' && user && (
            <button
              onClick={openCreateBoxModal}
              className="bg-green-500 text-white rounded-full px-4 py-2 shadow-lg hover:bg-green-600 transition-colors duration-300"
            >
              Add Box
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
          {mode === 'create' && user && (
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
          <Login />
        </div>
      </div>
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};

export default ControlPanel;