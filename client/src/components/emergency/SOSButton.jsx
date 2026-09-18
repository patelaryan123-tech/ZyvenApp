import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';

const SOSButton = ({ onTrigger, disabled }) => {
  const [isPressing, setIsPressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const pressTimerRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const HOLD_DURATION = 3000; // 3 seconds
  const UPDATE_INTERVAL = 50; // ms

  const controls = useAnimation();

  const startPress = () => {
    if (disabled) return;
    
    setIsPressing(true);
    setProgress(0);
    
    // Haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    controls.start({ scale: 0.95 });

    const startTime = Date.now();
    
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min((elapsed / HOLD_DURATION) * 100, 100);
      setProgress(currentProgress);
      
      if (currentProgress >= 100) {
        completePress();
      }
    }, UPDATE_INTERVAL);
  };

  const cancelPress = () => {
    if (!isPressing) return;
    
    clearInterval(progressIntervalRef.current);
    setIsPressing(false);
    setProgress(0);
    controls.start({ scale: 1 });
  };

  const completePress = () => {
    clearInterval(progressIntervalRef.current);
    setIsPressing(false);
    setProgress(100);
    
    // Strong haptic feedback on trigger
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }
    
    controls.start({ 
      scale: [0.9, 1.1, 1],
      transition: { duration: 0.4 }
    });
    
    onTrigger();
  };

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  const size = "w-[150px] h-[150px] md:w-[200px] md:h-[200px]";

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer pulsing ring when idle */}
      {!isPressing && !disabled && (
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className={`absolute rounded-full bg-emergency ${size}`}
        />
      )}

      {/* Progress Ring */}
      <svg className={`absolute ${size} transform -rotate-90 pointer-events-none`}>
        <circle
          cx="50%"
          cy="50%"
          r="48%"
          fill="none"
          stroke="#fca5a5"
          strokeWidth="8"
          className="opacity-20"
        />
        <circle
          cx="50%"
          cy="50%"
          r="48%"
          fill="none"
          stroke="#ef4444"
          strokeWidth="8"
          strokeDasharray="301" // Approximate circumference (2 * pi * r)
          strokeDashoffset={301 - (progress / 100) * 301}
          className="transition-all duration-75"
        />
      </svg>

      {/* Main Button */}
      <motion.button
        animate={controls}
        onMouseDown={startPress}
        onMouseUp={cancelPress}
        onMouseLeave={cancelPress}
        onTouchStart={startPress}
        onTouchEnd={cancelPress}
        disabled={disabled}
        className={`
          relative rounded-full flex flex-col items-center justify-center shadow-lg
          ${size} select-none focus:outline-none
          ${disabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-emergency hover:bg-emergency-dark active:bg-red-800'}
        `}
      >
        <span className="text-white font-extrabold text-4xl md:text-5xl tracking-wider">
          SOS
        </span>
        <span className="text-red-100 text-xs md:text-sm mt-2 font-medium">
          {isPressing ? 'Hold to send' : 'Press & Hold'}
        </span>
      </motion.button>
    </div>
  );
};

export default SOSButton;
