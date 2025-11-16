import 'dotenv/config.js';
import apiKeyManager from './services/apiKeyManager.js';

console.log('\n=== API Key Manager Debug ===\n');

try {
  const statuses = apiKeyManager.getApiKeyStatuses();
  console.log('Total keys in manager:', statuses.length);
  statuses.forEach((s, i) => {
    console.log(`  [${i}] ${s.key.substring(0, 30)}... | Active: ${s.isActive} | Failures: ${s.failureCount}`);
  });
  
  const health = apiKeyManager.getHealthStatus();
  console.log('\nHealth status:');
  console.log('  Current key index:', health.currentKeyIndex);
  console.log('  Total keys:', health.totalKeys);
  console.log('  All failed:', health.allKeysFailed);
} catch (error) {
  console.error('Error:', error instanceof Error ? error.message : error);
}
