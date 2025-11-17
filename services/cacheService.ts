// Cache Service for storing images and authentication data
const DB_NAME = 'drive-image-finder';
const DB_VERSION = 1;
const IMAGE_STORE = 'images';
const AUTH_STORE = 'auth';

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
}

export const cacheService = new CacheService();