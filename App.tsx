import React, { useState, useCallback, useEffect } from 'react';
import type { ImageFile, MatchResult, MongoImage } from './types';
import { rateBatchImageMatch } from './services/geminiService';
import { saveImageToMongoDB, checkBackendHealth } from './services/apiService';
import { ImageUploader } from './components/ImageUploader';
import { DriveImageLoader } from './components/DriveImageLoader';
import { SearchBar } from './components/SearchBar';
import { ResultDisplay } from './components/ResultDisplay';
import { FullscreenViewer } from './components/FullscreenViewer';
import { LogoIcon } from './components/icons';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';

function App() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [query, setQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [bestMatch, setBestMatch] = useState<MatchResult | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);
  const [backendAvailable, setBackendAvailable] = useState<boolean>(false);
  
  // Ref to ensure handleSearch gets the latest query, especially when called from a callback
  const queryRef = React.useRef(query);
  useEffect(() => {
    queryRef.current = query;
  }, [query]);

  // Kiểm tra backend có sẵn sàng khi component mount
  useEffect(() => {
    const checkBackend = async () => {
      const isAvailable = await checkBackendHealth();
      setBackendAvailable(isAvailable);
      if (isAvailable) {
        console.log('✓ Backend API is available');
      } else {
        console.warn('⚠ Backend API is not available - search results will not be saved');
      }
    };
    checkBackend();
  }, []);

  const handleSearch = useCallback(async (searchQuery?: string) => {
    const currentQuery = typeof searchQuery === 'string' ? searchQuery : queryRef.current;
    if (images.length === 0 || !currentQuery.trim()) return;

    setIsLoading(true);
    setError(null);
    setBestMatch(null);

    try {
      const ratings = await rateBatchImageMatch(images, currentQuery);
      const results = images.map((image, index) => ({
        image,
        score: ratings[index].score,
        reason: ratings[index].reason
      }));

      if (results.length === 0) {
        throw new Error("Không có kết quả nào được trả về từ phân tích.");
      }

      const topMatch = results.reduce((prev, current) => 
        (prev.score > current.score) ? prev : current
      );

      setBestMatch(topMatch);
      setIsViewerOpen(false);

      // Lưu kết quả lên backend nếu có sẵn
      if (backendAvailable && topMatch) {
        try {
          const mongoImageData: Omit<MongoImage, '_id' | 'createdAt' | 'updatedAt'> = {
            searchQuery: currentQuery,
            imageId: topMatch.image.id,
            imageName: topMatch.image.file.name,
            imageBase64: topMatch.image.base64,
            mimeType: topMatch.image.file.type,
            matchScore: topMatch.score,
            matchReason: topMatch.reason,
            source: 'upload', // Mặc định là upload, có thể thay đổi nếu từ Google Drive
          };

          await saveImageToMongoDB(mongoImageData);
          console.log('✓ Image saved to MongoDB');
        } catch (backendError) {
          console.error('Error saving to MongoDB:', backendError);
          // Không ảnh hưởng đến trải nghiệm người dùng
        }
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Đã xảy ra lỗi không mong muốn.";
      console.error("Search failed:", errorMessage);
      setError(`Tìm kiếm thất bại: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [images, backendAvailable]);

  const {
    isListening,
    startListening,
    stopListening,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition({
    onEnd: (finalTranscript) => {
        if (finalTranscript) {
            setQuery(finalTranscript);
            handleSearch(finalTranscript);
        }
    },
    onLiveTranscript: setQuery
  });

  const handleToggleRecording = () => {
    if (isListening) {
      stopListening();
    } else {
      setBestMatch(null);
      setError(null);
      setQuery('');
      startListening();
    }
  };

  const handleOpenViewer = useCallback(() => {
    if (bestMatch) {
      setIsViewerOpen(true);
    }
  }, [bestMatch]);

  const handleCloseViewer = useCallback(() => {
    setIsViewerOpen(false);
    setSelectedImage(null);
  }, []);

  const handleImageClick = useCallback((image: ImageFile) => {
    setSelectedImage(image);
    setIsViewerOpen(true);
  }, []);

  return (
    <div className="min-h-screen bg-brand-bg font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-4">
            <LogoIcon className="h-12 w-12" />
            <h1 className="text-4xl sm:text-5xl font-extrabold text-brand-primary-dark">
              Trình Tìm Kiếm Ảnh Thông Minh
            </h1>
          </div>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-3 gap-8 min-h-[70vh]">
          <div className="md:col-span-1 flex flex-col gap-6">
            <DriveImageLoader 
              onImagesLoaded={setImages}
              currentImageCount={images.length}
            />
            <ImageUploader images={images} onImagesChange={setImages} onImageClick={handleImageClick} />
          </div>
          
          <div className="md:col-span-2 flex flex-col gap-6">
            <SearchBar
              query={query}
              onQueryChange={setQuery}
              onSubmit={() => handleSearch()}
              isLoading={isLoading}
              isSubmitDisabled={images.length === 0 || !query.trim()}
              isRecording={isListening}
              onToggleRecording={handleToggleRecording}
              isSpeechRecognitionSupported={browserSupportsSpeechRecognition}
            />
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg animate-fade-in" role="alert">
                <strong className="font-bold">Lỗi: </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            <div className="flex-grow">
              <ResultDisplay 
                result={bestMatch} 
                isLoading={isLoading} 
                imageCount={images.length}
                onImageClick={handleOpenViewer}
              />
            </div>
          </div>
        </main>
        
        <footer className="text-center mt-8 text-sm text-brand-muted">
          <p>Phát triển bởi Bộ phận Đào tạo - Viện Công nghệ Blockchain và Trí tuệ nhân tạo ABAII</p>
        </footer>
      </div>
      {isViewerOpen && (bestMatch || selectedImage) && (
        <FullscreenViewer
          image={selectedImage || bestMatch?.image}
          onClose={handleCloseViewer}
        />
      )}
    </div>
  );
}

export default App;
