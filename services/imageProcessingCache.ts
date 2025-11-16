/**
 * Image Processing Cache
 * Tracks which images have been processed and stores their results
 * so they don't need to be reprocessed when switching API keys
 */

interface ProcessedImageResult {
  imageId: string;
  score: number;
  reason: string;
  query: string; // Which query this result is for
  processedAt: Date;
  apiKeyIndex: number; // Which API key processed this image
}

interface BatchProcessingState {
  batchId: string;
  query: string;
  totalImages: number;
  processedCount: number;
  results: Map<string, ProcessedImageResult>;
  startTime: Date;
  lastUpdated: Date;
}

class ImageProcessingCache {
  private cache: Map<string, ProcessedImageResult> = new Map();
  private activeBatch: BatchProcessingState | null = null;
  private currentQuery: string | null = null;

  /**
   * Start a new batch processing session
   */
  startBatch(query: string, totalImages: number): string {
    // If query changed, clear the cache and start fresh
    if (this.currentQuery !== null && this.currentQuery !== query) {
      console.log(`[ImageProcessingCache] Query changed from "${this.currentQuery}" to "${query}". Clearing cache.`);
      this.clear();
    }
    
    this.currentQuery = query;
    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.activeBatch = {
      batchId,
      query,
      totalImages,
      processedCount: 0,
      results: new Map(),
      startTime: new Date(),
      lastUpdated: new Date(),
    };
    console.log(`[ImageProcessingCache] Started batch ${batchId} with ${totalImages} images for query: "${query}"`);
    return batchId;
  }

  /**
   * Add a processed image result to cache
   */
  addResult(imageId: string, score: number, reason: string, apiKeyIndex: number): void {
    const result: ProcessedImageResult = {
      imageId,
      score,
      reason,
      query: this.currentQuery || 'unknown',
      processedAt: new Date(),
      apiKeyIndex,
    };
    
    this.cache.set(imageId, result);
    
    if (this.activeBatch) {
      this.activeBatch.results.set(imageId, result);
      this.activeBatch.processedCount++;
      this.activeBatch.lastUpdated = new Date();
      
      const progress = `${this.activeBatch.processedCount}/${this.activeBatch.totalImages}`;
      console.log(`[ImageProcessingCache] Progress: ${progress} (${imageId})`);
    }
  }

  /**
   * Get result for a processed image (only if it matches current query)
   */
  getResult(imageId: string): ProcessedImageResult | undefined {
    const result = this.cache.get(imageId);
    // Only return result if it's for the current query
    if (result && result.query === this.currentQuery) {
      return result;
    }
    return undefined;
  }

  /**
   * Check if image has been processed for current query
   */
  isProcessed(imageId: string): boolean {
    const result = this.cache.get(imageId);
    return result !== undefined && result.query === this.currentQuery;
  }

  /**
   * Filter out already processed images
   */
  filterUnprocessed<T extends { id?: string; name?: string }>(images: T[]): T[] {
    return images.filter(img => {
      const imageId = img.id || img.name || '';
      return !this.isProcessed(imageId);
    });
  }

  /**
   * Get all results for current batch
   */
  getBatchResults(): ProcessedImageResult[] {
    if (!this.activeBatch) return [];
    return Array.from(this.activeBatch.results.values());
  }

  /**
   * Check if batch is complete
   */
  isBatchComplete(): boolean {
    if (!this.activeBatch) return false;
    return this.activeBatch.processedCount === this.activeBatch.totalImages;
  }

  /**
   * End current batch
   */
  endBatch(): BatchProcessingState | null {
    if (this.activeBatch) {
      const duration = new Date().getTime() - this.activeBatch.startTime.getTime();
      console.log(
        `[ImageProcessingCache] Batch ${this.activeBatch.batchId} completed. ` +
        `Processed: ${this.activeBatch.processedCount}/${this.activeBatch.totalImages} images in ${(duration / 1000).toFixed(2)}s`
      );
      const batch = this.activeBatch;
      this.activeBatch = null;
      return batch;
    }
    return null;
  }

  /**
   * Get active batch info
   */
  getActiveBatch(): BatchProcessingState | null {
    return this.activeBatch;
  }

  /**
   * Clear cache
   */
  clear(): void {
    this.cache.clear();
    this.activeBatch = null;
    this.currentQuery = null;
    console.log('[ImageProcessingCache] Cache cleared');
  }

  /**
   * Check if cache is valid for the given query
   */
  isCacheValidForQuery(query: string): boolean {
    return this.currentQuery === query && this.cache.size > 0;
  }

  /**
   * Get current query
   */
  getCurrentQuery(): string | null {
    return this.currentQuery;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      totalCached: this.cache.size,
      activeBatch: this.activeBatch ? {
        batchId: this.activeBatch.batchId,
        progress: `${this.activeBatch.processedCount}/${this.activeBatch.totalImages}`,
        percentComplete: Math.round((this.activeBatch.processedCount / this.activeBatch.totalImages) * 100),
      } : null,
    };
  }
}

export const imageProcessingCache = new ImageProcessingCache();
