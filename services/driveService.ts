import { cacheService } from './cacheService';

// Google Drive API Service for browser-based authentication
export interface DriveImage {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  webContentLink?: string;
}

const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

// Load credentials from credentials.json
const getCredentials = async () => {
  const response = await fetch('/credentials.json');
  const data = await response.json();
  return {
    client_id: data.web.client_id,
    client_secret: data.web.client_secret,
    redirect_uris: data.web.redirect_uris
  };
};

// Initialize Google API client
let gapiInited = false;
let gisInited = false;
let tokenClient: any;

export const initGoogleAPI = async (): Promise<void> => {
  // Initialize cache service
  await cacheService.init();
  
  return new Promise((resolve, reject) => {
    // Load gapi
    const gapiScript = document.createElement('script');
    gapiScript.src = 'https://apis.google.com/js/api.js';
    gapiScript.async = true;
    gapiScript.defer = true;
    gapiScript.onload = async () => {
      await loadGapi();
      
      // Try to restore auth session
      const authData = await cacheService.getAuthData();
      if (authData && authData.expiresAt > Date.now()) {
        // Set the access token
        (window as any).gapi.client.setToken({ access_token: authData.token });
        gapiInited = true;
      }
      
      resolve();
    };
    gapiScript.onerror = reject;
    document.body.appendChild(gapiScript);
  });
};

const loadGapi = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    (window as any).gapi.load('client', async () => {
      try {
        await (window as any).gapi.client.init({
          discoveryDocs: [DISCOVERY_DOC],
        });
        gapiInited = true;
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
};

export const initGoogleIdentityServices = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const gisScript = document.createElement('script');
    gisScript.src = 'https://accounts.google.com/gsi/client';
    gisScript.async = true;
    gisScript.defer = true;
    gisScript.onload = async () => {
      const credentials = await getCredentials();
      tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: credentials.client_id,
        scope: SCOPES,
        callback: '', // defined later
      });
      gisInited = true;
      resolve();
    };
    gisScript.onerror = reject;
    document.body.appendChild(gisScript);
  });
};

// Request access token
export const getAccessToken = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      tokenClient.callback = async (response: any) => {
        if (response.error !== undefined) {
          reject(response);
        } else {
          // Save auth data to cache
          await cacheService.saveAuthData(response.access_token, response.expires_in);
          resolve(response.access_token);
        }
      };

      if ((window as any).gapi.client.getToken() === null) {
        tokenClient.requestAccessToken({ prompt: 'consent' });
      } else {
        tokenClient.requestAccessToken({ prompt: '' });
      }
    } catch (error) {
      reject(error);
    }
  });
};

// Check if user is signed in
export const isSignedIn = (): boolean => {
  return (window as any).gapi?.client?.getToken() !== null;
};

// Sign out
export const signOut = async (): Promise<void> => {
  const token = (window as any).gapi.client.getToken();
  if (token !== null) {
    await (window as any).google.accounts.oauth2.revoke(token.access_token);
    (window as any).gapi.client.setToken('');
    // Clear auth data from cache
    await cacheService.saveAuthData('', 0);
  }
};

// Find folder by name
export const findFolderByName = async (folderName: string): Promise<string | null> => {
  try {
    const response = await (window as any).gapi.client.drive.files.list({
      q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id, name)',
      spaces: 'drive',
    });

    const folders = response.result.files;
    if (folders && folders.length > 0) {
      return folders[0].id;
    }
    return null;
  } catch (error) {
    console.error('Error finding folder:', error);
    throw error;
  }
};

// Get images from folder
export const getImagesFromFolder = async (folderId: string): Promise<DriveImage[]> => {
  try {
    const response = await (window as any).gapi.client.drive.files.list({
      q: `'${folderId}' in parents and (mimeType contains 'image/') and trashed=false`,
      fields: 'files(id, name, mimeType, thumbnailLink, webContentLink)',
      spaces: 'drive',
      pageSize: 100,
    });

    return response.result.files || [];
  } catch (error) {
    console.error('Error getting images from folder:', error);
    throw error;
  }
};

// Download image as base64
export const downloadImageAsBase64 = async (fileId: string, mimeType: string): Promise<string> => {
  try {
    const response = await (window as any).gapi.client.drive.files.get({
      fileId: fileId,
      alt: 'media',
    });

    // Convert to base64
    const base64 = btoa(
      new Uint8Array(response.body.split('').map((c: string) => c.charCodeAt(0)))
        .reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error('Error downloading image:', error);
    throw error;
  }
};

// Get image blob and convert to base64
export const getImageAsBase64 = async (fileId: string, mimeType: string): Promise<string> => {
  try {
    // First check if image exists in cache
    const cachedImage = await cacheService.getImage(fileId);
    if (cachedImage) {
      console.log(`Found image ${fileId} in cache`);
      return cachedImage;
    }

    console.log(`Downloading image ${fileId} from Google Drive`);
    const accessToken = (window as any).gapi.client.getToken().access_token;
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }

    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        // Save to cache before resolving
        try {
          await cacheService.saveImage(fileId, base64Data);
          console.log(`Saved image ${fileId} to cache`);
        } catch (error) {
          console.error('Failed to cache image:', error);
        }
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error getting image as base64:', error);
    throw error;
  }
};

// Main function to get all images from Schedule folder
export const getScheduleFolderImages = async (): Promise<DriveImage[]> => {
  try {
    // Find the Schedule folder
    const folderId = await findFolderByName('Schedule');
    
    if (!folderId) {
      throw new Error('Không tìm thấy thư mục "Schedule" trong Google Drive của bạn');
    }

    // Get all images from the folder
    const images = await getImagesFromFolder(folderId);
    
    return images;
  } catch (error) {
    console.error('Error getting Schedule folder images:', error);
    throw error;
  }
};
