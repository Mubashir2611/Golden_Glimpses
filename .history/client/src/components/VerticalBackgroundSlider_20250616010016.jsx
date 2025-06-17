import { useState, useEffect } from 'react';

const VerticalBackgroundSlider = ({ 
  images, 
  interval = 2000, 
  overlayOpacity = 0.6,
  className = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Debug logging
  useEffect(() => {
    console.log('🖼️ VerticalBackgroundSlider START');
    console.log('📸 Images received:', images);
    console.log('📏 Images length:', images?.length);
    console.log('⏱️ Interval:', interval);
  }, [images, interval]);

  // Auto-slide effect
  useEffect(() => {
    if (!images || images.length === 0) {
      console.log('❌ No images - stopping slider');
      return;
    }

    console.log('✅ Starting slider with', images.length, 'images');
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const newIndex = (prevIndex + 1) % images.length;
        console.log(`🔄 Sliding: ${prevIndex} → ${newIndex} (${images[newIndex]})`);
        return newIndex;
      });
    }, interval);

    return () => {
      console.log('🛑 Cleaning up slider');
      clearInterval(timer);
    };
  }, [images, interval]);

  if (!images || images.length === 0) {
    console.log('🚫 Rendering fallback - no images');
    return (
      <div 
        className={`fixed inset-0 ${className}`} 
        style={{ 
          zIndex: -10,
          background: 'linear-gradient(135deg, #FF0000 0%, #00FF00 50%, #0000FF 100%)'
        }}
      >
        <div className="absolute top-4 left-4 bg-red-500 text-white p-2 rounded">
          NO IMAGES PROVIDED
        </div>
      </div>
    );
  }

  const currentImage = images[currentIndex];
  console.log('🎨 Current image:', currentImage);

  return (
    <div 
      className={`fixed inset-0 ${className}`} 
      style={{ zIndex: -10 }}
    >
      {/* Current Image Background */}
      <div
        className="absolute inset-0 transition-all duration-1000 ease-in-out"
        style={{
          backgroundImage: `url("${currentImage}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          transform: 'scale(1.02)'
        }}
        onLoad={() => console.log('✅ Background loaded:', currentImage)}
        onError={() => console.log('❌ Background failed:', currentImage)}
      />

      {/* Dark Overlay */}
      <div 
        className="absolute inset-0"
        style={{ 
          backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})`
        }}
      />

      {/* Debug Info - Always Visible */}
      <div 
        className="absolute top-4 right-4 bg-blue-500 text-white p-2 rounded text-sm"
        style={{ zIndex: 10 }}
      >
        <div>Slide: {currentIndex + 1}/{images.length}</div>
        <div>Image: {currentImage}</div>
        <div>Slider Active: ✅</div>
      </div>

      {/* Test Pattern Border */}
      <div 
        className="absolute inset-0 border-4 border-yellow-400"
        style={{ zIndex: 5 }}
      />
    </div>
  );
};

export default VerticalBackgroundSlider;

const VerticalBackgroundSlider = ({ 
  images, 
  interval = 2000, 
  overlayOpacity = 0.6,
  className = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Debug logging
  useEffect(() => {
    console.log('VerticalBackgroundSlider received images:', images);
    console.log('Images array length:', images?.length);
    console.log('Current image index:', currentIndex);
    if (images && images.length > 0) {
      console.log('Current image:', images[currentIndex]);
    }
  }, [images, currentIndex]);

  // Auto-slide effect
  useEffect(() => {
    if (!images || images.length === 0) {
      console.log('No images provided - skipping slider');
      return;
    }

    console.log('Setting up slider interval:', interval);
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const newIndex = (prevIndex + 1) % images.length;
        console.log('Sliding from index', prevIndex, 'to', newIndex);
        return newIndex;
      });
    }, interval);

    return () => {
      console.log('Cleaning up slider interval');
      clearInterval(timer);
    };
  }, [images, interval]);

  if (!images || images.length === 0) {
    console.log('Rendering fallback background');
    return (
      <div 
        className={`fixed inset-0 bg-black ${className}`} 
        style={{ zIndex: -10 }}
      >
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #0F0F0F 0%, #1A1A1A 25%, #0A0A0A 50%, #1F1F1F 75%, #000000 100%)'
          }}
        />
      </div>
    );
  }

  console.log('Rendering slider with', images.length, 'images');

  return (
    <div 
      className={`fixed inset-0 overflow-hidden ${className}`} 
      style={{ zIndex: -10 }}
    >
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
              duration: 1,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
            style={{
              zIndex: 1
            }}
          >
            <div
              className="w-full h-full bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${images[currentIndex]})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transform: 'scale(1.05)',
              }}
              onLoad={() => console.log('Background image rendered:', images[currentIndex])}
              onError={() => console.error('Failed to render background image:', images[currentIndex])}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dark Overlay */}
      <div 
        className="absolute inset-0"
        style={{ 
          zIndex: 2,
          background: `rgba(0, 0, 0, ${overlayOpacity})`
        }}
      />      {/* Additional gradient overlay */}
      <div 
        className="absolute inset-0"
        style={{
          zIndex: 3,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.1) 30%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.1) 70%, rgba(0,0,0,0.3) 100%)'
        }}
      />
      
      {/* Debug indicator - shows current slide */}
      <div 
        className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded"
        style={{ zIndex: 4, fontSize: '12px' }}
      >
        Slide {currentIndex + 1} of {images.length}
      </div>
    </div>
  );
};

export default VerticalBackgroundSlider;
