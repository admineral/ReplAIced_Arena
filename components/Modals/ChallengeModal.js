import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '../../contexts/AuthContext'; // Add this import

const modelLogos = {
  default: '/default-logo.png',
  openai: '/openai-logo.png',
  gemini: '/gemini-logo.png',
  claude: '/claude-logo.png',
  meta: '/meta-logo.png',
};

const difficultyColors = {
  easy: 'bg-green-500',
  medium: 'bg-yellow-500',
  hard: 'bg-red-500',
};

const ChallengeModal = ({ isOpen, onClose, challenge }) => {
    const router = useRouter();
    const { user } = useAuth(); // Add this line to get the current user

    console.log('ChallengeModal props:', { isOpen, challenge });

    if (!challenge) {
        console.log('No challenge data provided, returning null');
        return null;
    }

    const handleAttack = () => {
        if (!user) {
            console.error('User not authenticated');
            // Handle the case when the user is not logged in
            return;
        }

        const attackUrl = `/Attack?attackerId=${user.uid}&attackerBoxId=${challenge.id}&defenderId=${challenge.createdBy.uid}&defenderBoxId=${challenge.id}`;
        console.log('Initiating attack with URL:', attackUrl);
        router.push(attackUrl);
    };

    const handleCreatorClick = () => {
        if (challenge.createdBy && challenge.createdBy.uid) {
            const profileUrl = `/Profile/${challenge.createdBy.uid}`;
            console.log('Navigating to creator profile:', profileUrl);
            router.push(profileUrl);
        } else {
            console.log('Creator information not available');
        }
    };

    const renderCreatedBy = (createdBy) => {
        console.log('Rendering createdBy information:', createdBy);
        if (typeof createdBy === 'object' && createdBy !== null) {
            return (
                <div className="flex items-center cursor-pointer" onClick={handleCreatorClick}>
                    <Image
                        src={createdBy.photoURL || '/default-avatar.png'}
                        alt={createdBy.displayName || 'User'}
                        width={40}
                        height={40}
                        className="rounded-full mr-2"
                    />
                    <span>{createdBy.displayName || createdBy.uid || 'Unknown'}</span>
                </div>
            );
        }
        return 'Anonymous';
    };

    console.log('Rendering ChallengeModal with challenge:', challenge);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
                >
                    <motion.div
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -50, opacity: 0 }}
                        className="bg-gray-800 rounded-lg p-6 w-full max-w-3xl text-white shadow-2xl"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center">
                                <div className="w-16 h-16 rounded-full overflow-hidden mr-4 border-2 border-blue-500">
                                    <img 
                                        src={modelLogos[challenge.type] || modelLogos.default} 
                                        alt={`${challenge.type} logo`} 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold">{challenge.type} Challenge</h2>
                                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${difficultyColors[challenge.difficulty.toLowerCase()] || 'bg-gray-500'}`}>
                                        {challenge.difficulty}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    console.log('Closing ChallengeModal');
                                    onClose();
                                }}
                                className="text-gray-400 hover:text-white transition duration-300"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>

                        <div className="bg-gray-700 p-4 rounded-lg mb-4 shadow-inner">
                            <h3 className="text-xl font-semibold mb-2">Challenge Description</h3>
                            <p className="text-gray-300">{challenge.challenge}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-gray-700 p-4 rounded-lg shadow-inner">
                                <h4 className="font-semibold mb-1 text-blue-300">Created By</h4>
                                {renderCreatedBy(challenge.createdBy)}
                            </div>
                            <div className="bg-gray-700 p-4 rounded-lg shadow-inner">
                                <h4 className="font-semibold mb-1 text-blue-300">Created On</h4>
                                <p>{challenge.createdAt ? format(new Date(challenge.createdAt), 'PPP') : 'Unknown'}</p>
                            </div>
                        </div>

                        <div className="flex justify-center mt-6">
                            <button
                                onClick={() => {
                                    console.log('Attack button clicked');
                                    handleAttack();
                                }}
                                className="bg-red-600 text-white rounded-lg px-8 py-3 text-lg font-semibold hover:bg-red-700 transition duration-300 ease-in-out shadow-md"
                            >
                                Attack
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ChallengeModal;