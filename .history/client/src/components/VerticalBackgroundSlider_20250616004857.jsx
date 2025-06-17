import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const VerticalBackgroundSlider = ({ 
  images, 
  interval = 2000, 
  overlayOpacity = 0.6,
  className = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const intervalRef = useRef(null);

  // Preload images for better performance
  useEffect(() => {
    if (!images || images.length === 0) return;

    const preloadImages = images.map(src => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(src);
        img.onerror = reject;
        img.src = src;
      });
    });

    Promise.all(preloadImages)
      .then(() => setIsLoaded(true))
      .catch(() => setIsLoaded(true)); // Still show content even if some images fail
  }, [images]);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!images || images.length === 0 || !isLoaded) return;

    intervalRef.current = setInterval(nextSlide, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [images, interval, isLoaded, nextSlide]);

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
        {isLoaded && (
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
                ease: [0.25, 0.46, 0.45, 0.94] // Custom easing for smooth motion
              }}
              style={{
                willChange: 'transform' // Optimize for animation
              }}
            >
              <div
                className="w-full h-full bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url(${images[currentIndex]})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundAttachment: 'fixed',
                  transform: 'scale(1.05)', // Slight scale to prevent white edges
                }}
              />
            </motion.div>
          </AnimatePresence>
        )}
        
        {/* Fallback background while loading */}
        {!isLoaded && (
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, #0F0F0F 0%, #1A1A1A 25%, #0A0A0A 50%, #1F1F1F 75%, #000000 100%)'
            }}
          />
        )}
      </div>

      {/* Dark Overlay for better text readability */}
      <div 
        className="absolute inset-0"
        style={{ 
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

      {/* Additional gradient overlay for enhanced text contrast */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.1) 30%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.1) 70%, rgba(0,0,0,0.3) 100%)'
        }}
      />

      {/* Vignette effect for professional look */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, transparent 70%, rgba(0,0,0,0.3) 100%)'
        }}
      />
    </div>
  );
};

export default VerticalBackgroundSlider;
