import React, { useState, useCallback } from 'react';
import type { ImageFile } from '../types';
import { UploadIcon, CloseIcon, MaximizeIcon } from './icons';

interface ImageUploaderProps {
  images: ImageFile[];
  onImagesChange: (images: ImageFile[]) => void;
  onImageClick?: (image: ImageFile) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ images, onImagesChange, onImageClick }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;

    const newImageFiles: Promise<ImageFile>[] = Array.from(files)
      .filter(file => file.type.startsWith('image/'))
      .map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({
              id: `${file.name}-${Date.now()}`,
              file,
              base64: reader.result as string,
            });
          };
          reader.readAsDataURL(file);
        });
      });

    Promise.all(newImageFiles).then(newlyLoaded => {
      onImagesChange([...images, ...newlyLoaded]);
    });
  }, [images, onImagesChange]);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const removeImage = (id: string) => {
    onImagesChange(images.filter(img => img.id !== id));
  };
  
  return (
    <div className="bg-white p-4 rounded-lg h-full flex flex-col shadow-sm border border-brand-border">
      <h2 className="text-xl font-bold mb-4 text-brand-primary-dark">Kho ảnh</h2>
      {/* <div 
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 ${isDragging ? 'border-brand-primary bg-green-50' : 'border-brand-border hover:border-brand-primary'}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <UploadIcon className="mx-auto h-12 w-12 text-brand-muted"/>
        <p className="mt-2 text-sm text-brand-muted">Kéo và thả ảnh vào đây</p>
        <p className="text-xs text-brand-muted">hoặc</p>
        <label htmlFor="file-upload" className="cursor-pointer font-semibold text-brand-primary hover:text-brand-primary-dark">
          <span>Nhấp để tải lên</span>
          <input id="file-upload" name="file-upload" type="file" multiple accept="image/*" className="sr-only" onChange={handleFileChange} />
        </label>
      </div> */}

      <div className="mt-4 flex-grow overflow-y-auto max-h-[300px]">
        {images.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map(image => (
              <div key={image.id} className="relative group animate-fade-in">
                <img src={image.base64} alt={image.file.name} className="w-full h-24 object-cover rounded-md" />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
                  <button onClick={() => onImageClick?.(image)} className="absolute top-50% right-50% text-white rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-gray-800/50">
                    <MaximizeIcon className="w-5 h-5" />
                  </button>
                  <button onClick={() => removeImage(image.id)} className="absolute top-1 right-1 bg-brand-secondary/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-brand-secondary">
                    <CloseIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-brand-muted">
            <p>Chưa có ảnh nào được tải lên.</p>
          </div>
        )}
      </div>
    </div>
  );
};