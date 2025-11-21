# Persistent Image Gallery Implementation

## Overview
Implemented persistent image gallery caching so that loaded images remain available for AI search even after Google Drive session ends.

## Changes Made

### 1. Enhanced Cache Service (`services/cacheService.ts`)

**Database Version**: Upgraded from v1 to v2

**New Interfaces Added**:
- `GalleryImage`: Stores individual image data with metadata
  - id, name, mimeType, base64Data, savedAt
  
- `GalleryMetadata`: Stores entire gallery information
  - id, folderId, folderName, images[], lastUpdated, totalCount

**New Store**: `GALLERY_STORE`
- Stores complete cached galleries in IndexedDB
- Allows quick restoration of loaded images on app startup

**New Methods**:

#### `saveGallery(folderId, folderName, images)`
- Saves entire image gallery to persistent storage
- Called after successfully loading images from Google Drive
- Logs number of images saved and folder name

#### `getGallery()`
- Retrieves cached gallery from storage
- Returns null if no gallery exists
- Logs loaded gallery info

#### `clearGallery()`
- Removes cached gallery from storage
- Called when user signs out (optional enhancement)

### 2. Updated Drive Image Loader (`components/DriveImageLoader.tsx`)

**New State**:
- `cachedGalleryFolderName`: Tracks which folder's gallery is currently cached

**New Imports**:
- `cacheService` from services

**Enhanced `initializeGoogleServices()`**:
- Now attempts to load cached gallery on app startup
- Displays cached images immediately while checking Drive authentication
- Shows loading message with gallery info (folder name and image count)
- Falls back to showing gallery even if Drive session expired

**Enhanced `loadImagesFromSelectedFolder()`**:
- Collects image metadata while loading from Drive
- Calls `cacheService.saveGallery()` after all images loaded
- Updates `cachedGalleryFolderName` state
- Images are now persisted for offline search

**New UI Indication**:
- Green info box shows when a gallery is cached
- Displays format: "✅ Kho ảnh cached: [Folder Name] (có thể tìm kiếm offline)"
- Visible when authenticated to help users understand persistence

## User Workflow

### First Load
1. User logs in to Google Drive
2. Selects a folder with images
3. Images load and display in gallery
4. Gallery is automatically saved to cache

### Subsequent Uses
1. App starts and loads cached gallery immediately
2. User sees previously loaded images available for search
3. Even if Google Drive session expired, images remain searchable
4. User can:
   - Perform AI search on cached images (no Drive needed)
   - Log in again to load more images from Drive
   - Switch folders when authenticated

### Key Benefits
✅ **Offline Search**: Search cached images without active Drive session
✅ **Persistence**: Images saved until explicitly cleared or cache expires
✅ **Quick Startup**: Cached gallery loads immediately on app start
✅ **Seamless UX**: No interruption if Drive session ends mid-session
✅ **Data Privacy**: All images stored locally in browser IndexedDB

## Technical Details

### Storage Implementation
- Uses browser's IndexedDB (IndexedStorage)
- Database name: `drive-image-finder`
- Version: 2 (auto-migrates from v1)
- Three object stores: images, auth, gallery

### Cache Size Considerations
- Base64 encoded images take ~1.3x raw file size
- Typical quota: 50-100MB per domain
- For ~100 images (1MB each): ~130MB storage needed
- Monitor storage usage if handling large galleries

### Browser Support
- All modern browsers support IndexedDB
- Graceful degradation if storage unavailable

## Future Enhancements
- [ ] Add cache size limit and auto-cleanup
- [ ] Implement cache expiration (e.g., 30 days)
- [ ] Add ability to delete specific cached galleries
- [ ] Show storage usage statistics
- [ ] Allow manual cache refresh
