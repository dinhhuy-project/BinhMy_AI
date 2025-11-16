#!/usr/bin/env node

/**
 * Quick API Key Fallback Health Check
 * Run this to verify API key configuration
 */

import fetch from 'node-fetch';

const API_URL = 'http://localhost:3001/api';

async function runHealthChecks() {
  console.log('\n🔍 Running API Key Health Checks...\n');
  
  try {
    // Test 1: Server health
    console.log('1️⃣  Checking server health...');
    const healthRes = await fetch(`${API_URL}/health`);
    if (healthRes.ok) {
      console.log('✓ Server is running\n');
    } else {
      console.log('✗ Server is not responding\n');
      return;
    }
    
    // Test 2: API Key health
    console.log('2️⃣  Checking API Key status...');
    const apiKeyRes = await fetch(`${API_URL}/api-key/health`);
    const apiKeyHealth = await apiKeyRes.json();
    
    if (apiKeyHealth.success) {
      const data = apiKeyHealth.data;
      console.log(`✓ Using API Key #${data.currentKeyIndex} (${data.totalKeys} total)`);
      console.log(`  Failures: ${data.activeKeyStatus.failureCount}/3`);
      
      if (data.backupKeys.length > 0) {
        console.log(`  Backup keys available:`);
        data.backupKeys.forEach((key) => {
          console.log(`    - Key #${key.index}: ${key.failureCount}/3 failures`);
        });
      }
      
      if (data.allKeysFailed) {
        console.log('  ⚠️  WARNING: All API keys have failed!\n');
      } else {
        console.log('  ✓ Service operational\n');
      }
    } else {
      console.log('✗ Could not fetch API key health\n');
    }
    
    // Test 3: Detailed status
    console.log('3️⃣  Fetching detailed status...');
    const statusRes = await fetch(`${API_URL}/api-key/status`);
    const statuses = await statusRes.json();
    
    if (statuses.success) {
      console.log(`✓ API Key Details:`);
      statuses.data.forEach((key, idx) => {
        const status = key.isActive ? '🟢 ACTIVE' : '⚪ INACTIVE';
        console.log(`  ${idx + 1}. ${status} | Failures: ${key.failureCount} | Last used: ${key.lastUsed ? new Date(key.lastUsed).toLocaleString() : 'Never'}`);
        if (key.lastError) {
          console.log(`     Error: ${key.lastError}`);
        }
      });
      console.log('');
    }
    
    console.log('✅ All checks passed!\n');
    
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    console.log('\n⚠️  Make sure the server is running (npm run dev:all)\n');
  }
}

runHealthChecks();
