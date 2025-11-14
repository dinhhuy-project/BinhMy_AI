#!/usr/bin/env node

/**
 * Debug script để kiểm tra API kết nối
 */

import fetch from 'node-fetch';

const API_URL = process.argv[2] || 'https://binhmyai-production.up.railway.app';

async function testAPI() {
  console.log('🔍 Testing API endpoints...\n');
  console.log(`Base URL: ${API_URL}\n`);

  const endpoints = [
    { method: 'GET', path: '/api/health', name: 'Health Check' },
    { method: 'GET', path: '/api/images', name: 'Get All Images' },
    { method: 'GET', path: '/api/statistics', name: 'Get Statistics' },
    { method: 'POST', path: '/api/images', name: 'Save Image', body: { searchQuery: 'test' } },
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing: ${endpoint.name} (${endpoint.method} ${endpoint.path})`);
      
      const options = {
        method: endpoint.method,
        headers: { 'Content-Type': 'application/json' },
      };

      if (endpoint.body) {
        options.body = JSON.stringify(endpoint.body);
      }

      const response = await fetch(`${API_URL}${endpoint.path}`, options);
      const status = response.status;
      const statusOK = status >= 200 && status < 300 ? '✅' : '❌';

      console.log(`  ${statusOK} Status: ${status}`);

      if (!response.ok) {
        const text = await response.text();
        console.log(`  Error: ${text.substring(0, 100)}`);
      }

    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }

    console.log();
  }

  // Test CORS
  console.log('🔍 Testing CORS...\n');
  try {
    const response = await fetch(`${API_URL}/api/health`, {
      headers: { 'Origin': 'https://binhmyai-production.up.railway.app' },
    });
    const corsHeader = response.headers.get('access-control-allow-origin');
    console.log(`CORS Allow-Origin: ${corsHeader || 'NOT SET'} ${corsHeader ? '✅' : '❌'}`);
  } catch (error) {
    console.log(`CORS Check Error: ${error.message}`);
  }
}

testAPI().catch(console.error);
