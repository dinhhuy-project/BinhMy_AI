import React, { useEffect } from 'react';
import type { ImageFile } from '../types';
import { CloseIcon } from './icons';

interface FullscreenViewerProps {
  image: ImageFile;
  onClose: () => void;
}

export const FullscreenViewer: React.FC<FullscreenViewerProps> = ({ image, onClose }) => {
  useEffect(() => {
    // Disable scrolling on the body when the viewer is open
    document.body.style.overflow = 'hidden';
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Cleanup function
    return () => {
      document.body.style.overflow = 'auto';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Trình xem ảnh toàn màn hình"
    >
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Image container - make image always fill the screen */}
      <div className="relative w-full h-full flex items-center justify-center p-0 m-0">
        <img
          src={image.base64}
          alt={image.file.name}
          className="w-screen h-screen object-contain select-none"
          style={{ maxWidth: '100vw', maxHeight: '100vh' }}
          // Stop propagation so clicking the image doesn't close the viewer
          onClick={(e) => e.stopPropagation()}
        />
      </div>

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