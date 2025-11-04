import { GoogleGenAI, Type } from "@google/genai";
import type { ImageFile } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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