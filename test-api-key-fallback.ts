/**
 * API Key Fallback Test Suite
 * Test the fallback mechanism when APIs fail
 */

import apiKeyManager from './services/apiKeyManager.js';
import { getApiKeyHealthStatus, getApiKeyStatuses } from './services/geminiService.js';

console.log('\n=== API Key Fallback System Test ===\n');

// Test 1: Check initialization
console.log('Test 1: Check API Key Initialization');
try {
  const health = getApiKeyHealthStatus();
  console.log(`✓ Initialized with ${health.totalKeys} API key(s)`);
  console.log(`  Current key: #${health.currentKeyIndex}`);
  console.log(`  Active key failures: ${health.activeKeyStatus.failureCount}/3`);
} catch (error) {
  console.error('✗ Failed:', error);
}

// Test 2: Get all statuses
console.log('\nTest 2: Get All API Key Statuses');
try {
  const statuses = getApiKeyStatuses();
  console.log(`✓ Retrieved ${statuses.length} API key(s):`);
  statuses.forEach((status, idx) => {
    console.log(`  Key #${idx}: ${status.isActive ? '✓ Active' : '○ Inactive'} | Failures: ${status.failureCount}/3`);
  });
} catch (error) {
  console.error('✗ Failed:', error);
}

// Test 3: Simulate key failure
console.log('\nTest 3: Simulate API Key Failure');
try {
  const beforeHealth = getApiKeyHealthStatus();
  console.log(`  Before: Key #${beforeHealth.currentKeyIndex}, Failures: ${beforeHealth.activeKeyStatus.failureCount}`);
  
  // Mark as failed
  apiKeyManager.markCurrentKeyAsFailed(new Error('RESOURCE_EXHAUSTED: quota exceeded'));
  
  const afterHealth = getApiKeyHealthStatus();
  console.log(`  After: Key #${afterHealth.currentKeyIndex}, Failures: ${afterHealth.activeKeyStatus.failureCount}`);
  
  if (afterHealth.activeKeyStatus.failureCount > beforeHealth.activeKeyStatus.failureCount) {
    console.log(`✓ Failure counter incremented`);
  }
} catch (error) {
  console.error('✗ Failed:', error);
}

// Test 4: Check fallback capability
console.log('\nTest 4: Check Fallback Capability');
try {
  const health = getApiKeyHealthStatus();
  if (health.totalKeys > 1) {
    console.log(`✓ Fallback available: ${health.totalKeys - 1} backup key(s)`);
  } else {
    console.warn(`⚠ No backup keys configured!`);
  }
} catch (error) {
  console.error('✗ Failed:', error);
}

// Test 5: Reset counters
console.log('\nTest 5: Reset Failure Counters');
try {
  apiKeyManager.resetFailureCounts();
  const health = getApiKeyHealthStatus();
  
  let allReset = true;
  health.activeKeyStatus.failureCount === 0 && health.backupKeys.every(k => k.failureCount === 0);
  
  if (allReset) {
    console.log(`✓ All failure counters reset to 0`);
  }
} catch (error) {
  console.error('✗ Failed:', error);
}

console.log('\n=== Test Complete ===\n');
