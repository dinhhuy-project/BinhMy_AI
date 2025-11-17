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
let tokenRefreshTimer: NodeJS.Timeout | null = null;

// Setup token refresh timer
const setupTokenRefreshTimer = (expiresIn: number = 3600) => {
  // Refresh token 5 minutes before expiry
  if (tokenRefreshTimer) clearTimeout(tokenRefreshTimer);
  
  const refreshTime = Math.max((expiresIn - 300) * 1000, 60000); // At least 1 minute before expiry
  tokenRefreshTimer = setTimeout(async () => {
    try {
      console.log('Token expiring soon, refreshing...');
      const authData = await cacheService.getAuthData();
      if (authData?.refreshToken) {
        await refreshAccessTokenWithRefreshToken(authData.refreshToken);
      } else {
        // Fallback to requesting new token
        await getAccessToken();
      }
    } catch (error) {
      console.error('Failed to refresh token:', error);
    }
  }, refreshTime);
};

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
      
      // Try to restore auth session from cache
      try {
        const authData = await cacheService.getAuthData();
        if (authData && authData.token) {
          if (authData.expiresAt > Date.now()) {
            // Token still valid
            (window as any).gapi.client.setToken({ access_token: authData.token });
            console.log('✓ Restored authentication from cache (offline login)');
            gapiInited = true;
            setupTokenRefreshTimer();
          } else if (authData.refreshToken) {
            // Token expired but we have refresh token - auto refresh
            try {
              console.log('Token expired, auto-refreshing with refresh token...');
              const newToken = await refreshAccessTokenWithRefreshToken(authData.refreshToken);
              (window as any).gapi.client.setToken({ access_token: newToken });
              console.log('✓ Auto-refreshed and restored authentication');
              gapiInited = true;
            } catch (error) {
              console.warn('Auto-refresh failed:', error);
            }
          }
        }
      } catch (error) {
        console.warn('Could not restore auth session:', error);
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

// Refresh access token using refresh token (permanent session)
const refreshAccessTokenWithRefreshToken = async (refreshToken: string): Promise<string> => {
  const credentials = await getCredentials();
  
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: credentials.client_id,
      client_secret: credentials.client_secret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }).toString(),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh token');
  }

  const data = await response.json();
  const accessToken = data.access_token;
  const expiresIn = data.expires_in || 3600;

  // Update token in gapi
  (window as any).gapi.client.setToken({ access_token: accessToken });

  // Save new access token to cache
  await cacheService.saveAuthData(accessToken, expiresIn, refreshToken);
  console.log('✓ Token refreshed successfully (session extended)');

  // Setup next refresh
  setupTokenRefreshTimer(expiresIn);

  return accessToken;
};

// Request access token
export const getAccessToken = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      tokenClient.callback = async (response: any) => {
        if (response.error !== undefined) {
          reject(response);
        } else {
          // Save auth data to cache with refresh token - this enables permanent login
          const expiresIn = response.expires_in || 3600; // Default to 1 hour
          const refreshToken = response.refresh_token; // Only available on first consent
          await cacheService.saveAuthData(response.access_token, expiresIn, refreshToken);
          console.log('✓ Authentication saved (permanent session enabled)');
          
          // Setup refresh timer for automatic token renewal
          setupTokenRefreshTimer(expiresIn);
          
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

// Get current session info
export const getSessionInfo = async (): Promise<{ isSignedIn: boolean; expiresAt: number | null }> => {
  const isSignedIn = (window as any).gapi?.client?.getToken() !== null;
  const authData = await cacheService.getAuthData();
  
  return {
    isSignedIn,
    expiresAt: authData?.expiresAt || null
  };
};

// Sign out
export const signOut = async (): Promise<void> => {
  if (tokenRefreshTimer) clearTimeout(tokenRefreshTimer);
  
  const token = (window as any).gapi.client.getToken();
  if (token !== null) {
    try {
      await (window as any).google.accounts.oauth2.revoke(token.access_token);
    } catch (error) {
      console.warn('Could not revoke token:', error);
    }
    (window as any).gapi.client.setToken('');
    // Clear auth data from cache
    await cacheService.clearAuthData();
    console.log('✓ Signed out and cleared saved authentication');
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

// Find first subfolder in a parent folder
export const findFirstSubfolder = async (parentFolderId: string): Promise<string | null> => {
  try {
    const response = await (window as any).gapi.client.drive.files.list({
      q: `'${parentFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id, name)',
      spaces: 'drive',
      pageSize: 1,
    });

    const folders = response.result.files;
    if (folders && folders.length > 0) {
      console.log(`Found first subfolder: ${folders[0].name}`);
      return folders[0].id;
    }
    return null;
  } catch (error) {
    console.error('Error finding first subfolder:', error);
    throw error;
  }
};

// Get all subfolders in a parent folder
export const getAllSubfolders = async (parentFolderId: string): Promise<Array<{ id: string; name: string }>> => {
  try {
    const response = await (window as any).gapi.client.drive.files.list({
      q: `'${parentFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id, name)',
      spaces: 'drive',
      pageSize: 100,
      orderBy: 'name',
    });

    return response.result.files || [];
  } catch (error) {
    console.error('Error getting subfolders:', error);
    throw error;
  }
};

// Main function to get all images from BANG LED BEP folder
export const getScheduleFolderImages = async (): Promise<DriveImage[]> => {
  try {
    // Find the BANG LED BEP folder
    const bangLedBepFolderId = await findFolderByName('BANG LED BEP');
    
    if (!bangLedBepFolderId) {
      throw new Error('Không tìm thấy thư mục "BANG LED BEP" trong Google Drive của bạn');
    }

    console.log(`Found BANG LED BEP folder: ${bangLedBepFolderId}`);

    // Find first subfolder inside BANG LED BEP
    const firstSubfolderId = await findFirstSubfolder(bangLedBepFolderId);
    
    if (!firstSubfolderId) {
      throw new Error('Không tìm thấy thư mục con nào trong "BANG LED BEP"');
    }

    console.log(`Using first subfolder: ${firstSubfolderId}`);

    // Get all images from the subfolder
    const images = await getImagesFromFolder(firstSubfolderId);
    
    return images;
  } catch (error) {
    console.error('Error getting BANG LED BEP folder images:', error);
    throw error;
  }
};

// Get images from any folder (used when user selects a folder)
export const getImagesFromAnyFolder = async (folderId: string): Promise<DriveImage[]> => {
  try {
    const response = await (window as any).gapi.client.drive.files.list({
      q: `'${folderId}' in parents and (mimeType contains 'image/') and trashed=false`,
      fields: 'files(id, name, mimeType, thumbnailLink, webContentLink)',
      spaces: 'drive',
      pageSize: 100,
      orderBy: 'name',
    });

    return response.result.files || [];
  } catch (error) {
    console.error('Error getting images from folder:', error);
    throw error;
  }
};
