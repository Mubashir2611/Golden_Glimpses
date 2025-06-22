import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const HorizontalBackgroundSlider = ({ 
  images, 
  interval = 5000, 
  overlayOpacity = 0.6,
  className = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState({});

  useEffect(() => {
    if (!images || images.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [images, interval]);
  useEffect(() => {
    if (!images || images.length === 0) return;
    
    images.forEach((src, index) => {
      const img = new Image();
      img.onload = () => {
        setImageLoaded(prev => ({ ...prev, [index]: true }));
        console.log(`Image ${index} loaded successfully:`, src);
      };
      img.onerror = (e) => {
        console.error(`Error loading image ${index}:`, src, e);
      };
      
      if (src.startsWith('/')) {
        img.src = src; 
      } else if (src.startsWith('http')) {
        img.src = src;
      } else {
        img.src = `/${src.replace('public/', '')}`; 
      }
    });
  }, [images]);

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
        <AnimatePresence>
          <motion.div
            key={currentIndex}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 2,
              ease: "easeInOut"
            }}
          >
            <div
              className="w-full h-full bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${images[currentIndex]})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: imageLoaded[currentIndex] ? 1 : 0.5,
                transition: 'opacity 0.5s ease-in-out',
                width: '100vw',
                height: '100vh',
                position: 'fixed',
                top: 0,
                left: 0,
              }}
            />
            
            {/* Preload next image */}
            {images.length > 1 && (
              <link 
                rel="preload" 
                href={images[(currentIndex + 1) % images.length]} 
                as="image" 
              />
            )}
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

export default HorizontalBackgroundSlider;
