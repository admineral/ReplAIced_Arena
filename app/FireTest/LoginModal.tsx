import React from 'react';
import { signIn } from 'next-auth/react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  if (!isOpen) return null;

  const handleLogin = async () => {
    try {
      const result = await signIn('github', { redirect: false });
      if (result?.error) {
        console.error("Authentication failed:", result.error);
      } else if (result?.ok) {
        onLogin();
      }
    } catch (error) {
      console.error("An error occurred during authentication:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 p-6 rounded-xl shadow-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4 text-white">Authentication Required</h2>
        <p className="text-gray-300 mb-6">You need to be logged in to delete a todo. Please sign in with GitHub to continue.</p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleLogin}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
          >
            Sign in with GitHub
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;