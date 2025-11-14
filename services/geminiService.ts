import { GoogleGenAI, Type } from "@google/genai";
import type { ImageFile } from '../types';

// Get API key from environment - try multiple sources
const getApiKey = (): string => {
  // Try VITE_GEMINI_API_KEY (frontend env var via import.meta)
  try {
    const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
    if (envKey) return envKey;
  } catch (e) {
    // Ignore if import.meta not available
  }
  
  // Try window object (if injected)
  if (typeof window !== 'undefined' && (window as any).__GEMINI_API_KEY__) {
    return (window as any).__GEMINI_API_KEY__;
  }

  // Fallback to process.env for server-side
  if (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY;
  }
  
  if (typeof process !== 'undefined' && process.env?.API_KEY) {
    return process.env.API_KEY;
  }

  throw new Error("VITE_GEMINI_API_KEY environment variable is not set. Please set it in your .env file or Railway environment variables.");
};

const apiKey = getApiKey();
const ai = new GoogleGenAI({ apiKey });

const model = 'gemini-2.5-flash';

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

export const rateBatchImageMatch = async (images: ImageFile[], query: string): Promise<Array<{ score: number; reason: string; }>> => {
    try {
        const batchPromises = images.map(async (image) => {
            try {
                const imagePart = {
                    inlineData: {
                        data: image.base64.split(',')[1],
                        mimeType: image.file.type,
                    }
                };

                const textPart = {
                    text: `Phân tích hình ảnh và văn bản. Hình ảnh khớp với mô tả: "${query}" ở mức độ nào? Cung cấp điểm số và một lý do ngắn gọn bằng tiếng Việt.`,
                };

                const response = await ai.models.generateContent({
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
            } catch (error) {
                console.error("Error processing image:", error);
            }
            return { score: 0, reason: 'Failed to process image' };
        });

        // Xử lý song song các yêu cầu API với giới hạn 3 yêu cầu cùng lúc
        const results = [];
        const batchSize = 3;
        for (let i = 0; i < images.length; i += batchSize) {
            const batch = batchPromises.slice(i, i + batchSize);
            const batchResults = await Promise.all(batch);
            results.push(...batchResults);
        }

        return results;
    } catch (error) {
        console.error("Error in batch processing:", error);
        return images.map(() => ({ score: 0, reason: 'Batch processing failed' }));
    }
};

export const rateImageMatch = async (image: ImageFile, query: string): Promise<{ score: number; reason: string; }> => {
    const results = await rateBatchImageMatch([image], query);
    return results[0];
};