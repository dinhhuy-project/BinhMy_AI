import { GoogleGenAI, Type } from "@google/genai";
import type { ImageFile } from '../types';
import apiKeyManager from './apiKeyManager.js';
import { imageProcessingCache } from './imageProcessingCache.js';

// Initialize GoogleGenAI client with API Key Manager
let ai: GoogleGenAI | null = null;
let model = 'gemini-2.5-flash';

// Create AI client with current API key
const initializeAiClient = (): void => {
  try {
    const apiKey = apiKeyManager.getCurrentApiKey();
    ai = new GoogleGenAI({ apiKey });
    console.log(`[GeminiService] Initialized with API Key #${apiKeyManager.getCurrentKeyIndex()}`);
  } catch (error) {
    console.error("[GeminiService] Failed to initialize AI client:", error);
    throw error;
  }
};

/**
 * Ensure AI client is initialized before use
 */
const ensureAiInitialized = (): void => {
  if (!ai) {
    initializeAiClient();
  }
};

/**
 * Switch to the next available API key and reinitialize client
 */
const switchApiKey = async (): Promise<boolean> => {
  try {
    const switched = apiKeyManager.switchToNextKey();
    if (switched) {
      initializeAiClient();
      return true;
    }
    return false;
  } catch (error) {
    console.error("[GeminiService] Failed to switch API key:", error);
    return false;
  }
};

const schema = {
  type: Type.OBJECT,
  properties: {
    score: {
      type: Type.NUMBER,
      description: "A score from 0 to 100 indicating how well the image matches the prompt. 100 is a perfect match.",
    },
    reason: {
      type: Type.STRING,
      description: "Một lời giải thích ngắn gọn, bằng một câu, bằng tiếng Việt cho điểm số.",
    },
  },
  required: ['score', 'reason'],
};

/**
 * Check if error is a quota/rate limit error
 */
const isQuotaError = (error: any): boolean => {
  const errorMessage = error?.message || String(error);
  const errorCode = error?.code || error?.status || '';
  
  return (
    errorMessage.includes('quota') ||
    errorMessage.includes('rate limit') ||
    errorMessage.includes('429') ||
    errorMessage.includes('exceed') ||
    errorMessage.includes('RESOURCE_EXHAUSTED') ||
    errorMessage.includes('ERR_RATE_LIMITED') ||
    errorMessage.includes('RATE_LIMIT_EXCEEDED') ||
    errorCode === '429' ||
    errorCode === 'RESOURCE_EXHAUSTED' ||
    errorCode === 'RATE_LIMIT_EXCEEDED'
  );
};

/**
 * Check if error is an authentication error
 */
const isAuthError = (error: any): boolean => {
  const errorMessage = error?.message || String(error);
  const errorCode = error?.code || error?.status || '';
  
  return (
    errorMessage.includes('invalid') ||
    errorMessage.includes('unauthorized') ||
    errorMessage.includes('401') ||
    errorMessage.includes('403') ||
    errorMessage.includes('UNAUTHENTICATED') ||
    errorMessage.includes('PERMISSION_DENIED') ||
    errorMessage.includes('API key') ||
    errorMessage.includes('apiKey') ||
    errorCode === '401' ||
    errorCode === '403' ||
    errorCode === 'UNAUTHENTICATED' ||
    errorCode === 'PERMISSION_DENIED'
  );
};

/**
 * Check if error is worth switching API key for
 */
const shouldSwitchApiKey = (error: any): boolean => {
  return isQuotaError(error) || isAuthError(error);
};

export const rateBatchImageMatch = async (images: ImageFile[], query: string, retryCount = 0): Promise<Array<{ score: number; reason: string; }>> => {
    const maxRetries = apiKeyManager.getTotalKeys();
    
    try {
        // Ensure AI client is initialized
        ensureAiInitialized();
        
        // Check if cache is still valid for this query
        const cacheValid = imageProcessingCache.isCacheValidForQuery(query);
        
        // Start batch processing if not already started OR if query changed
        const activeBatch = imageProcessingCache.getActiveBatch();
        if (!activeBatch || !cacheValid) {
          if (activeBatch && !cacheValid) {
            console.log(`[GeminiService] Query changed, starting new batch session`);
          }
          imageProcessingCache.startBatch(query, images.length);
        }
        
        // Check which images have already been processed (only if cache is valid)
        let results: Array<{ score: number; reason: string; }> = [];
        let unprocessedImages = images;
        
        if (cacheValid) {
          unprocessedImages = images.filter(img => {
            return !imageProcessingCache.isProcessed(img.id);
          });
          
          // Return cached results for already processed images
          results = images.map(img => {
            const cached = imageProcessingCache.getResult(img.id);
            if (cached) {
              console.log(`[GeminiService] Using cached result for ${img.id}`);
              return { score: cached.score, reason: cached.reason };
            }
            return null;
          }).filter(r => r !== null) as Array<{ score: number; reason: string; }>;
        }
        
        // If all images are cached, return early
        if (unprocessedImages.length === 0 && cacheValid) {
          if (imageProcessingCache.isBatchComplete()) {
            imageProcessingCache.endBatch();
          }
          return results;
        }
        
        if (cacheValid && results.length > 0) {
          console.log(`[GeminiService] Processing ${unprocessedImages.length} new images (${results.length} from cache)`);
        } else if (!cacheValid) {
          console.log(`[GeminiService] Processing ${images.length} images (cache invalidated due to query change)`);
        }
        
        const newResults = [];
        const batchSize = 3;
        
        // Process batch by batch instead of map to catch quota errors early
        for (let i = 0; i < unprocessedImages.length; i += batchSize) {
            const batchImages = unprocessedImages.slice(i, i + batchSize);
            
            const batchPromises = batchImages.map(async (image) => {
                const imagePart = {
                    inlineData: {
                        data: image.base64.split(',')[1],
                        mimeType: image.file.type,
                    }
                };

                // Tạo prompt đầy đủ với tên file và mô tả
                const filename = image.filename || image.file.name || 'unknown';
                const textPart = {
                    text: `Phân tích hình ảnh có tên file: "${filename}" và kiểm tra xem nó khớp với mô tả: "${query}" ở mức độ nào? 

Hãy xem xét:
1. Tên file của ảnh - nó có chứa từ khóa liên quan đến mô tả không?
2. Nội dung trực quan của ảnh - nó có phù hợp với yêu cầu không?
3. Kết hợp cả hai yếu tố trên để đưa ra điểm số chính xác nhất.

Cung cấp điểm số (0-100) và một lý do ngắn gọn (một câu) bằng tiếng Việt.`,
                };

                const response = await ai!.models.generateContent({
                    model: model,
                    contents: { parts: [imagePart, textPart] },
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: schema,
                    },
                });

                const jsonString = response.text.trim();
                const result = JSON.parse(jsonString);

                if (typeof result.score === 'number' && typeof result.reason === 'string') {
                    // Cache the result
                    imageProcessingCache.addResult(image.id, result.score, result.reason, apiKeyManager.getCurrentKeyIndex());
                    return { score: result.score, reason: result.reason };
                }
                
                return { score: 0, reason: 'Invalid response format' };
            });
            
            // Wait for batch to complete - let errors propagate
            const batchResults = await Promise.all(batchPromises);
            newResults.push(...batchResults);
        }

        // Check if batch is now complete
        if (imageProcessingCache.isBatchComplete()) {
          imageProcessingCache.endBatch();
        }
        
        // Merge cached results with new results
        return results.concat(newResults);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`[GeminiService] Error in batch processing (Key #${apiKeyManager.getCurrentKeyIndex()}):`, errorMessage);
        
        // Check if we should switch API key
        if (shouldSwitchApiKey(error) && retryCount < maxRetries) {
            const errorType = isQuotaError(error) ? 'Quota exhausted' : 'Auth failed';
            console.warn(
                `[GeminiService] ${errorType} on API Key #${apiKeyManager.getCurrentKeyIndex()}. ` +
                `Attempting to switch to next key... (Attempt ${retryCount + 1}/${maxRetries})`
            );
            
            // Mark current key as failed
            apiKeyManager.markCurrentKeyAsFailed(error);
            
            // Try to switch to next key
            if (await switchApiKey()) {
                // Retry with next API key - will continue with unprocessed images only
                console.log(`[GeminiService] Retrying with API Key #${apiKeyManager.getCurrentKeyIndex()}...`);
                return rateBatchImageMatch(images, query, retryCount + 1);
            } else {
                console.error("[GeminiService] All API keys exhausted");
                return images.map(() => ({ score: 0, reason: 'All API keys exhausted' }));
            }
        }
        
        // For other errors, just mark as failed once
        if (retryCount === 0) {
            apiKeyManager.markCurrentKeyAsFailed(error);
        }
        
        console.log(`[GeminiService] Error not recoverable with fallback. Returning error response.`);
        return images.map(() => ({ score: 0, reason: 'Batch processing failed' }));
    }
};

export const rateImageMatch = async (image: ImageFile, query: string): Promise<{ score: number; reason: string; }> => {
    const results = await rateBatchImageMatch([image], query);
    return results[0];
};

/**
 * Get health status of API key manager
 */
export const getApiKeyHealthStatus = () => {
    return apiKeyManager.getHealthStatus();
};

/**
 * Get all API key statuses
 */
export const getApiKeyStatuses = () => {
    return apiKeyManager.getApiKeyStatuses();
};

/**
 * Manually switch to next API key
 */
export const switchToNextApiKey = async (): Promise<boolean> => {
    return switchApiKey();
};

/**
 * Reset API key failure counters
 */
export const resetApiKeyFailureCounts = (): void => {
    apiKeyManager.resetFailureCounts();
};

/**
 * Get image processing cache statistics
 */
export const getProcessingCacheStats = () => {
    return imageProcessingCache.getStats();
};

/**
 * Clear image processing cache
 */
export const clearProcessingCache = (): void => {
    imageProcessingCache.clear();
};