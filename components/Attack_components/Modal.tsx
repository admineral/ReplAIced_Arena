import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  isLoading?: boolean;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title, isLoading = false }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 500 }}
            ref={modalRef}
            className="bg-gray-800 rounded-lg shadow-xl transform transition-all sm:max-w-lg sm:w-full"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-headline"
          >
            <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              {title && (
                <h3 
                  className="text-2xl leading-6 font-bold text-white mb-4" 
                  id="modal-headline"
                >
                  {title}
                </h3>
              )}
              <div className="mt-2">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mb-4"></div>
                    <p className="text-white text-lg">Loading...</p>
                  </div>
                ) : (
                  children
                )}
              </div>
            </div>
            {!isLoading && (
              <div className="bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm transition duration-150 ease-in-out"
                  onClick={onClose}
                >
                  Close
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;