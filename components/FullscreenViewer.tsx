import React, { useEffect, useRef, useState } from 'react';
import type { ImageFile } from '../types';
import { CloseIcon } from './icons';

interface FullscreenViewerProps {
  image: ImageFile | undefined;
  onClose: () => void;
  onSwipeImage?: (direction: 'left' | 'right') => void;
  currentIndex?: number;
  totalImages?: number;
}

export const FullscreenViewer: React.FC<FullscreenViewerProps> = ({ 
  image, 
  onClose, 
  onSwipeImage,
  currentIndex = -1,
  totalImages = 0
}) => {
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Disable scrolling on the body when the viewer is open
    document.body.style.overflow = 'hidden';
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === 'ArrowLeft' && onSwipeImage) {
        onSwipeImage('right');
      } else if (event.key === 'ArrowRight' && onSwipeImage) {
        onSwipeImage('left');
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Cleanup function
    return () => {
      document.body.style.overflow = 'auto';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, onSwipeImage]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!onSwipeImage || totalImages <= 1) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const deltaX = touchEndX - touchStartX.current;
    const deltaY = touchEndY - touchStartY.current;
    
    // Chỉ detect vuốt ngang nếu độ di chuyển ngang lớn hơn độ di chuyển dọc
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      setIsTransitioning(true);
      if (deltaX > 0) {
        // Vuốt sang phải → xem ảnh trước
        onSwipeImage('right');
      } else {
        // Vuốt sang trái → xem ảnh tiếp theo
        onSwipeImage('left');
      }
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Trình xem ảnh toàn màn hình"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Image container - make image always fill the screen */}
      <div className={`relative w-full h-full flex items-center justify-center p-0 m-0 ${isTransitioning ? 'opacity-70' : 'opacity-100'} transition-opacity duration-200`}>
        {image && (
          <img
            src={image.base64}
            alt={image.file.name}
            className="w-screen h-screen object-contain select-none"
            style={{ maxWidth: '100vw', maxHeight: '100vh' }}
            // Stop propagation so clicking the image doesn't close the viewer
            onClick={(e) => e.stopPropagation()}
          />
        )}
      </div>

      {/* Left arrow - previous image */}
      {totalImages > 1 && onSwipeImage && currentIndex >= 0 && (
        <button
          onClick={() => onSwipeImage('right')}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-3 active:bg-white/50 transition-all z-10"
          aria-label="Ảnh trước đó"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Right arrow - next image */}
      {totalImages > 1 && onSwipeImage && currentIndex >= 0 && (
        <button
          onClick={() => onSwipeImage('left')}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-3 active:bg-white/50 transition-all z-10"
          aria-label="Ảnh tiếp theo"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Image counter */}
      {totalImages > 1 && currentIndex >= 0 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm font-semibold">
          {currentIndex + 1} / {totalImages}
        </div>
      )}

      {/* Close button - always visible */}
      <div className="absolute top-4 right-4 flex items-start justify-end">
        <button
          onClick={onClose}
          className="bg-brand-secondary text-white rounded-full p-3 active:opacity-80 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary"
          aria-label="Đóng trình xem ảnh"
        >
          <CloseIcon className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
};