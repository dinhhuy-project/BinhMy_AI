/**
 * API Key Fallback Utility
 * Helper functions and monitoring for API Key management
 */

import apiKeyManager from './apiKeyManager.js';

/**
 * Start monitoring API keys (logs status every N minutes)
 */
export const startApiKeyMonitoring = (intervalMinutes = 5): NodeJS.Timeout => {
  const intervalMs = intervalMinutes * 60 * 1000;
  
  const interval = setInterval(() => {
    const health = apiKeyManager.getHealthStatus();
    const now = new Date().toISOString();
    
    console.log(`\n📊 [${now}] API Key Status:`);
    console.log(`   Current Key: #${health.currentKeyIndex} (${health.totalKeys} total)`);
    console.log(`   Active Key Failures: ${health.activeKeyStatus.failureCount}/3`);
    
    if (health.backupKeys.length > 0) {
      console.log(`   Backup Keys:`);
      health.backupKeys.forEach(key => {
        console.log(`      - Key #${key.index}: ${key.failureCount}/3 failures${key.lastError ? ` (${key.lastError})` : ''}`);
      });
    }
    
    if (health.allKeysFailed) {
      console.error(`   ⚠️  ALL API KEYS HAVE FAILED!`);
    } else {
      console.log(`   ✓ Service operational`);
    }
    console.log('');
  }, intervalMs);
  
  return interval;
};

/**
 * Check if current API key is working
 */
export const isApiKeyWorking = (): boolean => {
  const health = apiKeyManager.getHealthStatus();
  return health.activeKeyStatus.failureCount < 3;
};

/**
 * Get detailed status for logging/debugging
 */
export const getDetailedStatus = () => {
  const health = apiKeyManager.getHealthStatus();
  const statuses = apiKeyManager.getApiKeyStatuses();
  
  return {
    timestamp: new Date().toISOString(),
    summary: health,
    details: statuses.map(s => ({
      index: s.index,
      active: s.isActive,
      failures: s.failureCount,
      lastError: s.lastError,
      lastUsed: s.lastUsed?.toISOString(),
    })),
  };
};

/**
 * Automatically reset failed keys after some time
 * Useful if a key was temporarily rate-limited
 */
export const startAutoResetFailedKeys = (checkIntervalMinutes = 60): NodeJS.Timeout => {
  const intervalMs = checkIntervalMinutes * 60 * 1000;
  
  const interval = setInterval(() => {
    const health = apiKeyManager.getHealthStatus();
    
    // If current key still has failures but others are also failed, try reset
    if (health.allKeysFailed && health.backupKeys.every(k => k.failureCount > 0)) {
      console.log('[ApiKeyManager] Auto-resetting all failed keys...');
      apiKeyManager.resetFailureCounts();
    }
  }, intervalMs);
  
  return interval;
};

/**
 * Format status for display
 */
export const formatStatusForDisplay = (): string => {
  const health = apiKeyManager.getHealthStatus();
  const lines = [
    '=== API Key Status ===',
    `Current: Key #${health.currentKeyIndex}/${health.totalKeys - 1}`,
    `Active Key Failures: ${health.activeKeyStatus.failureCount}/3`,
  ];
  
  if (health.allKeysFailed) {
    lines.push('⚠️  All keys failed!');
  }
  
  if (health.backupKeys.length > 0) {
    lines.push('\nBackup Keys:');
    health.backupKeys.forEach(k => {
      lines.push(`  ${k.isActive ? '✓' : '○'} Key #${k.index}: ${k.failureCount}/3 failures`);
    });
  }
  
  return lines.join('\n');
};

/**
 * Initialize all monitoring and helpers
 */
export const initializeApiKeyMonitoring = (options?: {
  enableMonitoring?: boolean;
  monitoringIntervalMinutes?: number;
  enableAutoReset?: boolean;
  autoResetIntervalMinutes?: number;
}): { stopMonitoring: () => void } => {
  const {
    enableMonitoring = true,
    monitoringIntervalMinutes = 10,
    enableAutoReset = true,
    autoResetIntervalMinutes = 60,
  } = options || {};
  
  const intervals: NodeJS.Timeout[] = [];
  
  if (enableMonitoring) {
    console.log('[ApiKeyMonitoring] Starting API key monitoring...');
    intervals.push(startApiKeyMonitoring(monitoringIntervalMinutes));
  }
  
  if (enableAutoReset) {
    console.log('[ApiKeyMonitoring] Starting auto-reset for failed keys...');
    intervals.push(startAutoResetFailedKeys(autoResetIntervalMinutes));
  }
  
  return {
    stopMonitoring: () => {
      intervals.forEach(interval => clearInterval(interval));
      console.log('[ApiKeyMonitoring] Stopped all monitoring');
    },
  };
};

export type { };
