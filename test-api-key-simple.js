import 'dotenv/config.js';

console.log('\n=== Testing ApiKeyManager ===\n');

// Simulate what happens when geminiService imports apiKeyManager
import apiKeyManager from './services/apiKeyManager.js';

console.log('\n--- After import ---');

try {
  // This will trigger ensureInitialized()
  const statuses = apiKeyManager.getApiKeyStatuses();
  
  console.log('\nAPI Key Statuses:');
  console.log('Total keys:', statuses.length);
  statuses.forEach((s, i) => {
    console.log(`  [${i}] ${s.key.substring(0, 30)}... | Active: ${s.isActive}`);
  });
  
  const health = apiKeyManager.getHealthStatus();
  console.log('\nHealth:');
  console.log('  Current index:', health.currentKeyIndex);
  console.log('  Total:', health.totalKeys);
  
} catch (error) {
  console.error('Error:', error instanceof Error ? error.message : error);
}

console.log('\n');
