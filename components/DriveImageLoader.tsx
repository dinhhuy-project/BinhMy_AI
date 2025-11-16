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
  getSessionInfo,
  getImagesFromAnyFolder,
  getAllSubfolders,
  findFolderByName,
  type DriveImage
} from '../services/driveService';
import Spinner from './Spinner';

interface DriveImageLoaderProps {
  onImagesLoaded: (images: ImageFile[]) => void;
  currentImageCount: number;
}

interface FolderOption {
  id: string;
  name: string;
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
  const [sessionExpiresAt, setSessionExpiresAt] = useState<number | null>(null);
  const [availableFolders, setAvailableFolders] = useState<FolderOption[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');
  const [parentFolderId, setParentFolderId] = useState<string>('');
  const [isLoadingFolders, setIsLoadingFolders] = useState(false);

  useEffect(() => {
    initializeGoogleServices();
  }, []);

  const initializeGoogleServices = async () => {
    try {
      setIsLoading(true);
      setLoadingProgress('Đang khởi tạo Google API...');
      await initGoogleAPI();
      await initGoogleIdentityServices();
      setIsInitialized(true);
      
      // Check for existing session
      const authenticated = isSignedIn();
      setIsAuthenticated(authenticated);
      
      if (authenticated) {
        const sessionInfo = await getSessionInfo();
        setSessionExpiresAt(sessionInfo.expiresAt);
        console.log('✓ Restored authentication from cache');
        
        // Load folder list automatically if already authenticated
        setTimeout(async () => {
          await loadFolderList();
        }, 500);
      } else {
        setLoadingProgress('');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Failed to initialize Google services:', err);
      setError('Không thể khởi tạo Google API. Vui lòng thử lại.');
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
      
      const sessionInfo = await getSessionInfo();
      setSessionExpiresAt(sessionInfo.expiresAt);
      
      setLoadingProgress('Đăng nhập thành công! Đang tải danh sách thư mục...');
      
      // Load list of folders after sign in
      setTimeout(async () => {
        await loadFolderList();
      }, 800);
    } catch (err) {
      console.error('Sign in failed:', err);
      setError('Đăng nhập thất bại. Vui lòng thử lại.');
      setIsLoading(false);
    }
  };

  const loadFolderList = async () => {
    try {
      setIsLoadingFolders(true);
      setError(null);
      setLoadingProgress('Đang tìm thư mục "BANG LED BEP"...');
      
      // Find the BANG LED BEP folder
      const bangLedBepFolderId = await findFolderByName('BANG LED BEP');
      
      if (!bangLedBepFolderId) {
        setError('Không tìm thấy thư mục "BANG LED BEP" trong Google Drive của bạn');
        setIsLoadingFolders(false);
        setIsLoading(false);
        return;
      }
      
      setParentFolderId(bangLedBepFolderId);
      
      setLoadingProgress('Đang tải danh sách thư mục con...');
      
      // Get all subfolders
      const subfolders = await getAllSubfolders(bangLedBepFolderId);
      
      if (subfolders.length === 0) {
        setError('Không tìm thấy thư mục con nào trong "BANG LED BEP"');
        setIsLoadingFolders(false);
        setIsLoading(false);
        return;
      }
      
      setAvailableFolders(subfolders);
      // Select the first folder by default
      setSelectedFolderId(subfolders[0].id);
      
      setLoadingProgress('');
      setIsLoading(false);
      setIsLoadingFolders(false);
      
      // Automatically load images from first folder
      await loadImagesFromSelectedFolder(subfolders[0].id);
    } catch (err) {
      console.error('Failed to load folder list:', err);
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách thư mục');
      setIsLoadingFolders(false);
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    signOut();
    setIsAuthenticated(false);
    setSessionExpiresAt(null);
    setAvailableFolders([]);
    setSelectedFolderId('');
    setParentFolderId('');
    onImagesLoaded([]);
  };

  const loadImagesFromSelectedFolder = async (folderId?: string) => {
    const folderToLoad = folderId || selectedFolderId;
    if (!folderToLoad) {
      setError('Vui lòng chọn một thư mục');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setLoadingProgress('Đang tải danh sách ảnh từ thư mục...');

      const driveImages = await getImagesFromAnyFolder(folderToLoad);
      
      if (driveImages.length === 0) {
        setError('Không tìm thấy ảnh nào trong thư mục này');
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

  const handleFolderChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const folderId = event.target.value;
    setSelectedFolderId(folderId);
    onImagesLoaded([]); // Clear images when folder changes
    
    // Load images from the newly selected folder
    setTimeout(async () => {
      await loadImagesFromSelectedFolder(folderId);
    }, 100);
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
    <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-brand-border">
      <h2 className="text-xl font-bold mb-4 text-brand-primary-dark">
        🗂️ Google Drive
      </h2>

      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {!isAuthenticated ? (
        <div className="text-center">
          <p className="text-brand-muted mb-4 text-sm lg:text-base">
            Đăng nhập Google Drive để tải ảnh
          </p>
          <button
            onClick={handleSignIn}
            disabled={isLoading}
            className="w-full bg-brand-primary text-white font-bold py-4 px-6 rounded-lg active:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-base lg:text-lg"
          >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner size={18} thickness={3} />
                    <span>Đang xử lý...</span>
                  </span>
                ) : (
                  '🔐 Đăng nhập Google'
                )}
          </button>
        </div>
      ) : (
        <div>
          <div className="mb-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-green-700">✓ Đã đăng nhập</span>
              </div>
              <button
                onClick={handleSignOut}
                className="text-sm text-red-600 font-semibold px-3 py-1 rounded active:opacity-70 transition-all bg-red-100"
              >
                Đăng xuất
              </button>
            </div>
            
            {sessionExpiresAt && (
              <div className="text-xs text-brand-muted bg-blue-50 px-2 py-1 rounded">
                🔐 Hết hạn: {new Date(sessionExpiresAt).toLocaleTimeString('vi-VN')}
              </div>
            )}
            
            <p className="text-xs text-brand-muted">
              💾 Đã lưu
            </p>
          </div>

          {availableFolders.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-semibold text-brand-primary-dark mb-2">
                📂 Chọn thư mục:
              </label>
              <select
                value={selectedFolderId}
                onChange={handleFolderChange}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-brand-border rounded-lg focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary bg-white text-brand-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <option value="">-- Chọn thư mục --</option>
                {availableFolders.map(folder => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="text-center">
            <button
              onClick={() => loadImagesFromSelectedFolder()}
              disabled={isLoading || !selectedFolderId}
              className="w-full bg-brand-primary text-white font-bold py-4 px-6 rounded-lg active:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-base lg:text-lg"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner size={20} thickness={4} />
                  <span>Đang tải...</span>
                </span>
              ) : (
                `🔄 Tải lại ảnh`
              )}
            </button>

            {currentImageCount > 0 && (
              <p className="mt-3 text-sm text-brand-muted">
                ✓ Đã có: {currentImageCount} ảnh
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
