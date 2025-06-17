import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const VerticalBackgroundSlider = ({ 
  images, 
  interval = 2000, 
  overlayOpacity = 0.6,
  className = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!images || images.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [images, interval]);

  if (!images || images.length === 0) {
    return (
      <div className={`fixed inset-0 bg-black ${className}`} style={{ zIndex: -1 }}>
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #0F0F0F 0%, #1A1A1A 25%, #0A0A0A 50%, #1F1F1F 75%, #000000 100%)'
          }}
        />
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 overflow-hidden ${className}`} style={{ zIndex: -1 }}>
      {/* Image Container */}
      <div className="relative w-full h-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            className="absolute inset-0"
            initial={{ y: '100%' }}
            animate={{ y: '0%' }}
            exit={{ y: '-100%' }}
            transition={{
              type: 'tween',
              duration: 1.2,
              ease: [0.4, 0, 0.2, 1] // Custom cubic-bezier for smooth animation
            }}
          >
            <div
              className="w-full h-full bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${images[currentIndex]})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transform: 'scale(1.1)', // Slight scale to prevent white edges during animation
              }}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dark Overlay for better text readability */}
      <div 
        className="absolute inset-0 bg-black"
        style={{ 
          opacity: overlayOpacity,
          background: `linear-gradient(
            135deg, 
            rgba(0, 0, 0, ${overlayOpacity}) 0%, 
            rgba(0, 0, 0, ${overlayOpacity * 0.8}) 25%, 
            rgba(0, 0, 0, ${overlayOpacity}) 50%, 
            rgba(0, 0, 0, ${overlayOpacity * 0.9}) 75%, 
            rgba(0, 0, 0, ${overlayOpacity}) 100%
          )`
        }}
      />

      {/* Additional gradient overlay for better text contrast */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.4) 100%)'
        }}
      />
    </div>
  );
};

export default VerticalBackgroundSlider;
