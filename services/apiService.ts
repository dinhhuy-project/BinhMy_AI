/**
 * API Client Service để gọi backend API
 */

import type { MongoImage } from '../types';

// Get API URL from environment variables
const getApiBaseUrl = (): string => {
  // For browser environment, use window.__API_BASE_URL__ if set
  if (typeof window !== 'undefined' && (window as any).__API_BASE_URL__) {
    return (window as any).__API_BASE_URL__;
  }
  
  // For production: use relative URL to same domain
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return '/api';
  }
  
  // For local development: use hardcoded default
  return 'http://localhost:3001/api';
};

const API_BASE_URL = getApiBaseUrl();
console.log('API Base URL:', API_BASE_URL);

/**
 * Lưu kết quả tìm kiếm ảnh lên backend MongoDB
 */
export const saveImageToMongoDB = async (
  payload: Omit<MongoImage, '_id' | 'createdAt' | 'updatedAt'>
): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/images`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to save image to MongoDB');
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving image to MongoDB:', error);
    throw error;
  }
};

/**
 * Lấy tất cả ảnh được lưu
 */
export const getAllImages = async (): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/images`);

    if (!response.ok) {
      throw new Error('Failed to fetch images');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching images:', error);
    throw error;
  }
};

/**
 * Tìm kiếm ảnh theo query
 */
export const searchImages = async (query: string): Promise<any> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/images/search?q=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error('Failed to search images');
    }

    return await response.json();
  } catch (error) {
    console.error('Error searching images:', error);
    throw error;
  }
};

/**
 * Lấy ảnh theo ID
 */
export const getImageById = async (imageId: string): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/images/${imageId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch image');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching image:', error);
    throw error;
  }
};

/**
 * Lấy ảnh theo source (google-drive hoặc upload)
 */
export const getImagesBySource = async (source: 'google-drive' | 'upload'): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/images/source/${source}`);

    if (!response.ok) {
      throw new Error('Failed to fetch images by source');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching images by source:', error);
    throw error;
  }
};

/**
 * Xóa ảnh
 */
export const deleteImage = async (imageId: string): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/images/${imageId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete image');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

/**
 * Lấy thống kê
 */
export const getStatistics = async (): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/statistics`);

    if (!response.ok) {
      throw new Error('Failed to fetch statistics');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching statistics:', error);
    throw error;
  }
};

/**
 * Kiểm tra xem backend có sẵn sàng không
 */
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
    });
    return response.ok;
  } catch (error) {
    console.warn('Backend is not available:', error);
    return false;
  }
};

