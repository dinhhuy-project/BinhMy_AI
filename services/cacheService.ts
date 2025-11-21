// Cache Service for storing images and authentication data
const DB_NAME = 'drive-image-finder';
const DB_VERSION = 2;
const IMAGE_STORE = 'images';
const AUTH_STORE = 'auth';
const GALLERY_STORE = 'gallery'; // Store for persisted image gallery

interface CachedImage {
  id: string;
  base64Data: string;
  timestamp: number;
}

interface AuthData {
  id: string;
  token: string;
  refreshToken?: string; // Optional refresh token for permanent session
  expiresAt: number;
}

interface GalleryImage {
  id: string;
  name: string;
  mimeType: string;
  base64Data: string;
  savedAt: number;
}

interface GalleryMetadata {
  id: string;
  folderId: string;
  folderName: string;
  images: GalleryImage[];
  lastUpdated: number;
  totalCount: number;
}

class CacheService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create images store
        if (!db.objectStoreNames.contains(IMAGE_STORE)) {
          const imageStore = db.createObjectStore(IMAGE_STORE, { keyPath: 'id' });
          imageStore.createIndex('timestamp', 'timestamp');
        }

        // Create auth store
        if (!db.objectStoreNames.contains(AUTH_STORE)) {
          db.createObjectStore(AUTH_STORE, { keyPath: 'id' });
        }

        // Create gallery store for persistent image gallery
        if (!db.objectStoreNames.contains(GALLERY_STORE)) {
          const galleryStore = db.createObjectStore(GALLERY_STORE, { keyPath: 'id' });
          galleryStore.createIndex('lastUpdated', 'lastUpdated');
        }
      };
    });
  }

  async saveImage(imageId: string, base64Data: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(IMAGE_STORE, 'readwrite');
    const store = transaction.objectStore(IMAGE_STORE);

    const cachedImage: CachedImage = {
      id: imageId,
      base64Data,
      timestamp: Date.now()
    };

    return new Promise((resolve, reject) => {
      const request = store.put(cachedImage);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getImage(imageId: string): Promise<string | null> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(IMAGE_STORE, 'readonly');
    const store = transaction.objectStore(IMAGE_STORE);

    return new Promise((resolve, reject) => {
      const request = store.get(imageId);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const cachedImage = request.result as CachedImage;
        resolve(cachedImage?.base64Data || null);
      };
    });
  }

  async saveAuthData(token: string, expiresIn: number, refreshToken?: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(AUTH_STORE, 'readwrite');
    const store = transaction.objectStore(AUTH_STORE);

    const authData: AuthData = {
      id: 'google-drive',
      token,
      refreshToken,
      expiresAt: Date.now() + expiresIn * 1000
    };

    return new Promise((resolve, reject) => {
      const request = store.put(authData);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getAuthData(): Promise<AuthData | null> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(AUTH_STORE, 'readonly');
    const store = transaction.objectStore(AUTH_STORE);

    return new Promise((resolve, reject) => {
      const request = store.get('google-drive');
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result as AuthData || null);
    });
  }

  async clearExpiredImages(maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(IMAGE_STORE, 'readwrite');
    const store = transaction.objectStore(IMAGE_STORE);
    const index = store.index('timestamp');
    
    const expired = Date.now() - maxAge;
    const range = IDBKeyRange.upperBound(expired);

    return new Promise((resolve, reject) => {
      const request = index.openCursor(range);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          store.delete(cursor.primaryKey);
          cursor.continue();
        } else {
          resolve();
        }
      };
    });
  }

  async clearAuthData(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(AUTH_STORE, 'readwrite');
    const store = transaction.objectStore(AUTH_STORE);

    return new Promise((resolve, reject) => {
      const request = store.delete('google-drive');
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async isAuthDataValid(): Promise<boolean> {
    const authData = await this.getAuthData();
    if (!authData || !authData.token) return false;
    return authData.expiresAt > Date.now();
  }

  // Gallery persistence methods
  async saveGallery(folderId: string, folderName: string, images: Array<{ id: string; name: string; mimeType: string; base64Data: string }>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(GALLERY_STORE, 'readwrite');
    const store = transaction.objectStore(GALLERY_STORE);

    const galleryImages: GalleryImage[] = images.map(img => ({
      id: img.id,
      name: img.name,
      mimeType: img.mimeType,
      base64Data: img.base64Data,
      savedAt: Date.now()
    }));

    const metadata: GalleryMetadata = {
      id: 'current-gallery',
      folderId,
      folderName,
      images: galleryImages,
      lastUpdated: Date.now(),
      totalCount: galleryImages.length
    };

    return new Promise((resolve, reject) => {
      const request = store.put(metadata);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        console.log(`✓ Saved gallery of ${galleryImages.length} images from folder "${folderName}" to persistent cache`);
        resolve();
      };
    });
  }

  async getGallery(): Promise<GalleryMetadata | null> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(GALLERY_STORE, 'readonly');
    const store = transaction.objectStore(GALLERY_STORE);

    return new Promise((resolve, reject) => {
      const request = store.get('current-gallery');
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const metadata = request.result as GalleryMetadata | undefined;
        if (metadata) {
          console.log(`✓ Loaded cached gallery of ${metadata.totalCount} images from folder "${metadata.folderName}"`);
        }
        resolve(metadata || null);
      };
    });
  }

  async clearGallery(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(GALLERY_STORE, 'readwrite');
    const store = transaction.objectStore(GALLERY_STORE);

    return new Promise((resolve, reject) => {
      const request = store.delete('current-gallery');
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        console.log('✓ Cleared gallery cache');
        resolve();
      };
    });
  }
}

export const cacheService = new CacheService();