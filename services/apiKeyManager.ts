/**
 * API Key Manager with Fallback Support
 * Automatically switches to backup API keys when the current one fails
 */

import { getAllApiKeys } from './apiKeys.js';

interface ApiKeyStatus {
  key: string;
  index: number;
  isActive: boolean;
  failureCount: number;
  lastError?: string;
  lastUsed?: Date;
}

class ApiKeyManager {
  private apiKeys: ApiKeyStatus[] = [];
  private currentKeyIndex: number = 0;
  private maxFailuresBeforeFallback: number = 3;
  private keyRotationEnabled: boolean = true;
  private initialized: boolean = false;

  /**
   * Ensure keys are initialized before use
   */
  private ensureInitialized(): void {
    if (!this.initialized) {
      this.initializeApiKeys();
      this.initialized = true;
    }
  }

  /**
   * Initialize API keys from constants
   * Can be called multiple times to reload keys
   */
  private initializeApiKeys(): void {
    const keys = getAllApiKeys();

    if (keys.length === 0) {
      throw new Error("No API keys found. Please configure API keys in apiKeys.ts");
    }

    // Initialize API key status objects
    this.apiKeys = keys.map((key, index) => ({
      key,
      index,
      isActive: index === 0,
      failureCount: 0,
      lastError: undefined,
      lastUsed: undefined,
    }));

    console.log(`[ApiKeyManager] Initialized with ${keys.length} API key(s)`);
  }

  /**
   * Reload API keys from environment (useful after env updates)
   */
  reloadApiKeys(): void {
    console.log('[ApiKeyManager] Reloading API keys from environment...');
    this.initialized = false;
    this.initializeApiKeys();
    this.initialized = true;
  }

  /**
   * Get current active API key
   */
  getCurrentApiKey(): string {
    this.ensureInitialized();
    const currentKey = this.apiKeys[this.currentKeyIndex];
    if (!currentKey) {
      throw new Error("No valid API key available");
    }
    currentKey.lastUsed = new Date();
    return currentKey.key;
  }

  /**
   * Get current API key index
   */
  getCurrentKeyIndex(): number {
    this.ensureInitialized();
    return this.currentKeyIndex;
  }

  /**
   * Get total number of available API keys
   */
  getTotalKeys(): number {
    this.ensureInitialized();
    return this.apiKeys.length;
  }

  /**
   * Get all API key statuses
   */
  getApiKeyStatuses(): Readonly<ApiKeyStatus[]> {
    this.ensureInitialized();
    return this.apiKeys.map(k => ({ ...k }));
  }

  /**
   * Mark current API key as failed and switch to next one
   */
  markCurrentKeyAsFailed(error: Error | string): boolean {
    this.ensureInitialized();
    const currentKey = this.apiKeys[this.currentKeyIndex];
    const errorMessage = error instanceof Error ? error.message : String(error);

    currentKey.failureCount++;
    currentKey.lastError = errorMessage;

    console.warn(
      `[ApiKeyManager] API Key #${this.currentKeyIndex} failed (${currentKey.failureCount}/${this.maxFailuresBeforeFallback}): ${errorMessage}`
    );

    // If reached max failures, try next key
    if (currentKey.failureCount >= this.maxFailuresBeforeFallback) {
      return this.switchToNextKey();
    }

    return false; // Failed but not switching yet
  }

  /**
   * Switch to the next available API key
   */
  switchToNextKey(): boolean {
    this.ensureInitialized();
    const previousIndex = this.currentKeyIndex;
    const totalKeys = this.apiKeys.length;

    // Try to find next working key
    for (let i = 1; i < totalKeys; i++) {
      const nextIndex = (this.currentKeyIndex + i) % totalKeys;
      const nextKey = this.apiKeys[nextIndex];

      // Skip keys with too many failures
      if (nextKey.failureCount < this.maxFailuresBeforeFallback) {
        this.currentKeyIndex = nextIndex;
        nextKey.isActive = true;
        this.apiKeys[previousIndex].isActive = false;

        console.log(
          `[ApiKeyManager] Switched from API Key #${previousIndex} to #${nextIndex}`
        );
        return true;
      }
    }

    console.error(
      `[ApiKeyManager] All API keys have exceeded failure threshold. Unable to switch.`
    );
    return false;
  }

  /**
   * Reset failure count for all keys (e.g., on daily reset)
   */
  resetFailureCounts(): void {
    this.ensureInitialized();
    this.apiKeys.forEach(key => {
      key.failureCount = 0;
      key.lastError = undefined;
    });
    console.log("[ApiKeyManager] All failure counts reset");
  }

  /**
   * Get health status of API keys
   */
  getHealthStatus(): {
    currentKeyIndex: number;
    totalKeys: number;
    allKeysFailed: boolean;
    activeKeyStatus: ApiKeyStatus;
    backupKeys: ApiKeyStatus[];
  } {
    this.ensureInitialized();
    return {
      currentKeyIndex: this.currentKeyIndex,
      totalKeys: this.apiKeys.length,
      allKeysFailed: this.apiKeys.every(k => k.failureCount >= this.maxFailuresBeforeFallback),
      activeKeyStatus: { ...this.apiKeys[this.currentKeyIndex] },
      backupKeys: this.apiKeys
        .filter((_, i) => i !== this.currentKeyIndex)
        .map(k => ({ ...k })),
    };
  }

  /**
   * Set max failures before fallback
   */
  setMaxFailuresBeforeFallback(count: number): void {
    this.ensureInitialized();
    this.maxFailuresBeforeFallback = Math.max(1, count);
  }

  /**
   * Check if current key is available (not all keys failed)
   */
  isKeyAvailable(): boolean {
    this.ensureInitialized();
    return !this.apiKeys.every(k => k.failureCount >= this.maxFailuresBeforeFallback);
  }
}

// Create singleton instance
const apiKeyManager = new ApiKeyManager();

export default apiKeyManager;
export type { ApiKeyStatus };
