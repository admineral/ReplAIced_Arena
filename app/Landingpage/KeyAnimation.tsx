import React from 'react';
import { motion } from 'framer-motion';

const KeyAnimation: React.FC = () => {
  return (
    <div className="w-64 h-64 relative perspective-1000">
      {/* 3D Rotating Key */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ rotateY: 0, z: 100 }}
        animate={{ 
          rotateY: 360, 
          z: [100, 0, 100],
          scale: [1, 1.2, 1]
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity, 
          repeatType: "loop", 
          ease: "easeInOut" 
        }}
      >
        <svg className="w-32 h-32 text-blue-500 drop-shadow-2xl" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
        </svg>
      </motion.div>

      {/* Multiple 3D Rotating Rings */}
      {[0, 1, 2, 3].map((index) => (
        <motion.div
          key={index}
          className={`absolute inset-0 border-2 border-blue-${400 - index * 100} rounded-full`}
          initial={{ rotateX: index * 45, rotateY: index * 45 }}
          animate={{ rotateX: 360 + index * 45, rotateY: 360 + index * 45 }}
          transition={{ 
            duration: 8 - index, 
            repeat: Infinity, 
            repeatType: "loop", 
            ease: "linear" 
          }}
        />
      ))}

      {/* Enhanced glow effect */}
      <motion.div 
        className="absolute inset-0 bg-blue-500 opacity-20 blur-2xl rounded-full"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.3, 0.1]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }}
      />
    </div>
  );
};

export default KeyAnimation;