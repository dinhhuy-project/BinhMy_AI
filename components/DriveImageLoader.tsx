import React, { useState, useEffect } from 'react';
import type { ImageFile } from '../types';
import { 
  initGoogleAPI, 
  initGoogleIdentityServices, 
  getAccessToken, 
  isSignedIn, 
  signOut,
  getScheduleFolderImages,
  getImageAsBase64,
  type DriveImage
} from '../services/driveService';
import Spinner from './Spinner';

interface DriveImageLoaderProps {
  onImagesLoaded: (images: ImageFile[]) => void;
  currentImageCount: number;
}

export const DriveImageLoader: React.FC<DriveImageLoaderProps> = ({ 
  onImagesLoaded,
  currentImageCount 
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState<string>('');

  useEffect(() => {
    initializeGoogleServices();
  }, []);

  // Load cached images on component mount
  useEffect(() => {
    if (isAuthenticated) {
      loadCachedImages();
    }
  }, [isAuthenticated]);

  const initializeGoogleServices = async () => {
    try {
      setIsLoading(true);
      setLoadingProgress('Đang khởi tạo Google API...');
      await initGoogleAPI();
      await initGoogleIdentityServices();
      setIsInitialized(true);
      setIsAuthenticated(isSignedIn());
      setLoadingProgress('');
    } catch (err) {
      console.error('Failed to initialize Google services:', err);
      setError('Không thể khởi tạo Google API. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setLoadingProgress('Đang đăng nhập...');
      
      await getAccessToken();
      setIsAuthenticated(true);
      setLoadingProgress('Đăng nhập thành công!');
      
      // Automatically load images after sign in
      await loadImagesFromDrive();
    } catch (err) {
      console.error('Sign in failed:', err);
      setError('Đăng nhập thất bại. Vui lòng thử lại.');
      setIsLoading(false);
    }
  };

  const loadCachedImages = async () => {
    try {
      // Get list of images from drive first
      const driveImages = await getScheduleFolderImages();
      const imageFiles: ImageFile[] = [];

      for (const driveImage of driveImages) {
        // Try to get image from cache
        const cachedImage = await getImageAsBase64(driveImage.id, driveImage.mimeType);
        if (cachedImage) {
          // Create File object from cached data
          const blob = await fetch(cachedImage).then(r => r.blob());
          const file = new File([blob], driveImage.name, { type: driveImage.mimeType });
          imageFiles.push({
            id: `drive-${driveImage.id}`,
            file: file,
            base64: cachedImage,
          });
        }
      }

      if (imageFiles.length > 0) {
        onImagesLoaded(imageFiles);
      }
    } catch (error) {
      console.error('Failed to load cached images:', error);
    }
  };

  const handleSignOut = () => {
    signOut();
    setIsAuthenticated(false);
    onImagesLoaded([]);
  };

  const loadImagesFromDrive = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setLoadingProgress('Đang tìm thư mục "Schedule"...');

      const driveImages = await getScheduleFolderImages();
      
      if (driveImages.length === 0) {
        setError('Không tìm thấy ảnh nào trong thư mục "Schedule"');
        setIsLoading(false);
        return;
      }

      setLoadingProgress(`Đang tải ${driveImages.length} ảnh...`);

      // Convert Drive images to ImageFile format
      const imageFiles: ImageFile[] = [];
      
      const totalImages = driveImages.length;
      let loadedImages = 0;

      for (const driveImage of driveImages) {
        try {
          setLoadingProgress(`Đang tải ảnh ${loadedImages + 1}/${totalImages}: ${driveImage.name}`);
          
          // Try to get from cache first
          const base64 = await getImageAsBase64(driveImage.id, driveImage.mimeType);
          const blob = await fetch(base64).then(r => r.blob());
          const file = new File([blob], driveImage.name, { type: driveImage.mimeType });
          
          imageFiles.push({
            id: `drive-${driveImage.id}`,
            file: file,
            base64: base64,
          });

          loadedImages++;
          
          // Update UI with currently loaded images if we have some
          if (loadedImages % 5 === 0 || loadedImages === totalImages) {
            onImagesLoaded([...imageFiles]); // Send a copy of current images
          }
        } catch (err) {
          console.error(`Failed to load image ${driveImage.name}:`, err);
        }
      }

      if (imageFiles.length > 0) {
        onImagesLoaded(imageFiles);
        setLoadingProgress(`Đã tải thành công ${imageFiles.length} ảnh`);
        setTimeout(() => {
          setLoadingProgress('');
          setIsLoading(false);
        }, 2000);
      } else {
        setError('Không thể tải ảnh nào. Vui lòng thử lại.');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Failed to load images:', err);
      setError(err instanceof Error ? err.message : 'Không thể tải ảnh từ Google Drive');
      setIsLoading(false);
    }
  };

  if (!isInitialized) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-brand-border">
        <div className="flex items-center justify-center">
          <Spinner size={48} thickness={5} />
          <span className="ml-3 text-brand-muted">Đang khởi tạo Google Drive...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-brand-border">
      <h2 className="text-xl font-bold mb-4 text-brand-primary-dark">
        Google Drive
      </h2>

      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {!isAuthenticated ? (
        <div className="text-center">
          <p className="text-brand-muted mb-4">
            Đăng nhập vào Google Drive để tự động tải ảnh
          </p>
          <button
            onClick={handleSignIn}
            disabled={isLoading}
            className="bg-brand-primary hover:bg-brand-primary-dark text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <Spinner size={18} thickness={3} />
                    <span className="ml-2">Đang xử lý...</span>
                  </span>
                ) : (
                  'Đăng nhập Google Drive'
                )}
          </button>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-brand-muted">Đã đăng nhập</span>
            </div>
            <button
              onClick={handleSignOut}
              className="text-sm text-brand-secondary hover:text-brand-secondary/80 font-semibold"
            >
              Đăng xuất
            </button>
          </div>

          <div className="text-center">
            <button
              onClick={loadImagesFromDrive}
              disabled={isLoading}
              className="w-full bg-brand-primary hover:bg-brand-primary-dark text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <Spinner size={20} thickness={4} />
                  <span className="ml-2">Đang tải...</span>
                </span>
              ) : (
                `Tải ảnh từ thư mục ...`
              )}
            </button>

            {currentImageCount > 0 && (
              <p className="mt-3 text-sm text-brand-muted">
                Đã tải: {currentImageCount} ảnh
              </p>
            )}

            {loadingProgress && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">{loadingProgress}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
