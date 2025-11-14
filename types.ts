

export interface ImageFile {
  id: string;
  file: File;
  base64: string;
}

export interface MatchResult {
  image: ImageFile;
  score: number;
  reason: string;
}

/**
 * MongoDB Image Document - Lưu trữ ảnh tìm kiếm thành công
 */
export interface MongoImage {
  _id?: string;
  searchQuery: string;
  imageId: string;
  imageName: string;
  imageUrl?: string;
  imageBase64?: string;
  mimeType: string;
  matchScore: number;
  matchReason: string;
  source: 'google-drive' | 'upload';
  driveFileId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Dữ liệu kết quả tìm kiếm được lưu lên MongoDB (Legacy - dùng MongoImage thay thế)
 */
export interface MatchResult {
  image: ImageFile;
  score: number;
  reason: string;
}

/**
 * MongoDB Image Model - Lưu dữ liệu ảnh tìm kiếm được
 */
export interface MongoImage {
  _id?: string;
  searchQuery: string;
  imageId: string;
  imageName: string;
  imageUrl?: string;
  imageBase64?: string;
  mimeType: string;
  matchScore: number;
  matchReason: string;
  source: 'google-drive' | 'upload';
  driveFileId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Dữ liệu kết quả tìm kiếm được lưu lên MongoDB (deprecated - sử dụng MongoImage)
 */
export interface SearchResultData {
  _id?: string; // MongoDB ObjectId
  query: string; // Câu tìm kiếm
  imageFileName: string; // Tên file ảnh
  imageUrl?: string; // URL ảnh (tuỳ chọn)
  matchScore: number; // Điểm khớp (0-100)
  matchReason: string; // Lý do điểm số
  imageMimeType: string; // MIME type của ảnh
  metadata?: {
    totalImagesScanned?: number; // Tổng ảnh được quét
    timestamp?: string; // Thời gian tìm kiếm
    [key: string]: any; // Các metadata khác
  };
  createdAt?: Date; // Thời gian tạo
  updatedAt?: Date; // Thời gian cập nhật
}

/**
 * Response từ API
 */
export interface APIResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  count?: number;
  error?: string;
}
