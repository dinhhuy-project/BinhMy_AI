import { GoogleGenAI, Type } from "@google/genai";
import type { ImageFile } from '../types';
import apiKeyManager from './apiKeyManager.js';

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
        
        const results = [];
        const batchSize = 3;
        
        // Process batch by batch instead of map to catch quota errors early
        for (let i = 0; i < images.length; i += batchSize) {
            const batchImages = images.slice(i, i + batchSize);
            
            const batchPromises = batchImages.map(async (image) => {
                const imagePart = {
                    inlineData: {
                        data: image.base64.split(',')[1],
                        mimeType: image.file.type,
                    }
                };

                const textPart = {
                    text: `Phân tích hình ảnh và văn bản. Hình ảnh khớp với mô tả: "${query}" ở mức độ nào? Cung cấp điểm số và một lý do ngắn gọn bằng tiếng Việt.`,
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
                    return { score: result.score, reason: result.reason };
                }
                
                return { score: 0, reason: 'Invalid response format' };
            });
            
            // Wait for batch to complete - let errors propagate
            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults);
        }

        return results;
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
                // Retry with next API key
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