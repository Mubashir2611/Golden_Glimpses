import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BackgroundSlider = ({ images, interval = 5000, effect = 'fade' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    // Clear any existing interval when component mounts or images/interval changes
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Set up the interval for changing slides
    timerRef.current = setInterval(() => {
      // First make the current slide invisible
      setIsVisible(false);
      
      // After a short delay, change the slide and make it visible again
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        setIsVisible(true);
      }, 500); // 500ms transition duration
    }, interval);
    
    // Clean up the interval when component unmounts
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [images, interval]);
  
  const getAnimationVariants = () => {
    switch(effect) {
      case 'slide':
        return {
          enter: { x: 1000, opacity: 0 },
          center: { x: 0, opacity: 1, transition: { duration: 0.8 } },
          exit: { x: -1000, opacity: 0, transition: { duration: 0.8 } }
        };
      case 'zoom':
        return {
          enter: { scale: 1.2, opacity: 0 },
          center: { scale: 1, opacity: 1, transition: { duration: 0.8 } },
          exit: { scale: 0.8, opacity: 0, transition: { duration: 0.8 } }
        };
      case 'kenBurns':
        return {
          enter: { scale: 1.1, opacity: 0 },
          center: { 
            scale: 1.25, 
            opacity: 1, 
            transition: { 
              duration: 8, 
              scale: { duration: 8, ease: "easeInOut" },
              opacity: { duration: 1, ease: "easeIn" }
            } 
          },
          exit: { scale: 1.3, opacity: 0, transition: { duration: 0.8 } }
        };
      case 'fade':
      default:
        return {
          enter: { opacity: 0 },
          center: { opacity: 1, transition: { duration: 1.5 } },
          exit: { opacity: 0, transition: { duration: 1.5 } }
        };
    }
  };

  const variants = getAnimationVariants();

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden -z-10">
      <AnimatePresence initial={false}>
        <motion.div
          className="absolute inset-0 w-full h-full"
          key={currentIndex}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 1 }}
        >
          <img 
            src={images[currentIndex]} 
            alt={`Background ${currentIndex + 1}`} 
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default BackgroundSlider;
