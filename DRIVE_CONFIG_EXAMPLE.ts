/**
 * 🎯 QUICK CONFIGURATION - Cấu Hình Nhanh
 * 
 * Nếu bạn muốn thay đổi folder Google Drive được lấy ảnh,
 * chỉ cần chỉnh sửa file này!
 */

// ============================================
// 🔧 CẤU HÌNH FOLDER
// ============================================

export const GOOGLE_DRIVE_CONFIG = {
  // Tên folder chính (phải tồn tại trong Google Drive)
  mainFolderName: 'BANG LED BEP',
  
  // Có tìm subfolder hay không?
  // true: tìm folder con đầu tiên bên trong folder chính
  // false: lấy ảnh trực tiếp từ folder chính
  useSubfolder: true,
  
  // Số ảnh tối đa cần tải (0 = tất cả)
  maxImages: 0,
  
  // Cache ảnh?
  enableCache: true,
  
  // Log chi tiết?
  verbose: true,
};

// ============================================
// 📝 HƯỚNG DẪN THAY ĐỔI
// ============================================

/*

CÓ 3 CÁCH SỬ DỤNG:

1️⃣  LẤY ẢNH TỪ SUBFOLDER (Mặc định)
    mainFolderName: 'BANG LED BEP'
    useSubfolder: true
    
    Luồng: Google Drive → BANG LED BEP → [First Subfolder] → Images

2️⃣  LẤY ẢNH TRỰC TIẾP TỬ FOLDER CHÍNH
    mainFolderName: 'BANG LED BEP'
    useSubfolder: false
    
    Luồng: Google Drive → BANG LED BEP → Images

3️⃣  THAY ĐỔI FOLDER KHÁC
    mainFolderName: 'Tên Folder Khác'
    useSubfolder: true
    
    Luồng: Google Drive → [Tên Folder Khác] → [First Subfolder] → Images

*/

// ============================================
// 💡 VÍ DỤ CẤU HÌNH
// ============================================

// Ví dụ 1: Schedule folder (cũ)
/*
export const GOOGLE_DRIVE_CONFIG = {
  mainFolderName: 'Schedule',
  useSubfolder: false,
  maxImages: 100,
  enableCache: true,
  verbose: false,
};
*/

// Ví dụ 2: BANG LED BEP (hiện tại)
/*
export const GOOGLE_DRIVE_CONFIG = {
  mainFolderName: 'BANG LED BEP',
  useSubfolder: true,
  maxImages: 0,
  enableCache: true,
  verbose: true,
};
*/

// Ví dụ 3: Project folder
/*
export const GOOGLE_DRIVE_CONFIG = {
  mainFolderName: 'Project',
  useSubfolder: true,
  maxImages: 50,
  enableCache: true,
  verbose: true,
};
*/
