#!/usr/bin/env node

/**
 * 🧪 API Test Suite
 * Kiểm tra xem API có hoạt động không
 * 
 * Chạy: node api-test.js
 */

const BASE_URL = 'http://localhost:3001/api';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function test(name, fn) {
  try {
    log(`\n🧪 Testing: ${name}`, 'cyan');
    const result = await fn();
    log(`✅ ${name} - PASSED`, 'green');
    return result;
  } catch (error) {
    log(`❌ ${name} - FAILED`, 'red');
    log(`   Error: ${error.message}`, 'red');
    return null;
  }
}

async function main() {
  log('\n╔════════════════════════════════════════╗', 'bright');
  log('║     🚀 API HEALTH CHECK & TESTS       ║', 'bright');
  log('╚════════════════════════════════════════╝\n', 'bright');

  log(`API Base URL: ${BASE_URL}`, 'yellow');

  // Test 1: Health Check
  await test('Health Check', async () => {
    const response = await fetch(`${BASE_URL}/health`);
    if (!response.ok) throw new Error(`Status ${response.status}`);
    const data = await response.json();
    log(`   Response: ${JSON.stringify(data)}`, 'blue');
    return data;
  });

  // Test 2: Save Image (POST)
  const testImage = {
    searchQuery: 'Test Query',
    imageId: 'test_123',
    imageName: 'test.jpg',
    imageUrl: 'http://example.com/test.jpg',
    mimeType: 'image/jpeg',
    matchScore: 85,
    matchReason: 'Test image',
    source: 'upload',
  };

  let savedImageId = null;
  await test('Save Image (POST /api/images)', async () => {
    const response = await fetch(`${BASE_URL}/images`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testImage),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Status ${response.status}: ${error}`);
    }
    const data = await response.json();
    savedImageId = data.data?._id;
    log(`   Saved with ID: ${savedImageId}`, 'blue');
    log(`   Response: ${JSON.stringify(data).substring(0, 100)}...`, 'blue');
    return data;
  });

  // Test 3: Get All Images
  await test('Get All Images (GET /api/images)', async () => {
    const response = await fetch(`${BASE_URL}/images`);
    if (!response.ok) throw new Error(`Status ${response.status}`);
    const data = await response.json();
    log(`   Total images: ${data.count || data.data?.length || 0}`, 'blue');
    return data;
  });

  // Test 4: Search Images
  await test('Search Images (GET /api/images/search)', async () => {
    const response = await fetch(
      `${BASE_URL}/images/search?q=Test%20Query`
    );
    if (!response.ok) throw new Error(`Status ${response.status}`);
    const data = await response.json();
    log(`   Found: ${data.count || data.data?.length || 0} results`, 'blue');
    return data;
  });

  // Test 5: Get Image by ID
  if (savedImageId) {
    await test(`Get Image by ID (GET /api/images/${savedImageId})`, async () => {
      const response = await fetch(`${BASE_URL}/images/${savedImageId}`);
      if (!response.ok) throw new Error(`Status ${response.status}`);
      const data = await response.json();
      log(`   Image name: ${data.data?.imageName}`, 'blue');
      return data;
    });
  }

  // Test 6: Get by Source
  await test('Get by Source (GET /api/images/source/upload)', async () => {
    const response = await fetch(`${BASE_URL}/images/source/upload`);
    if (!response.ok) throw new Error(`Status ${response.status}`);
    const data = await response.json();
    log(`   Found: ${data.count || data.data?.length || 0} images from 'upload'`, 'blue');
    return data;
  });

  // Test 7: Get Statistics
  await test('Get Statistics (GET /api/statistics)', async () => {
    const response = await fetch(`${BASE_URL}/statistics`);
    if (!response.ok) throw new Error(`Status ${response.status}`);
    const data = await response.json();
    log(`   Total: ${data.data?.totalImages}`, 'blue');
    log(`   Avg Score: ${data.data?.averageMatchScore?.toFixed(2)}`, 'blue');
    return data;
  });

  // Test 8: Update Image
  if (savedImageId) {
    await test(`Update Image (PUT /api/images/${savedImageId})`, async () => {
      const response = await fetch(`${BASE_URL}/images/${savedImageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchScore: 95,
          matchReason: 'Updated test image',
        }),
      });
      if (!response.ok) throw new Error(`Status ${response.status}`);
      const data = await response.json();
      log(`   Updated score to: ${data.data?.matchScore}`, 'blue');
      return data;
    });
  }

  // Test 9: Delete Image
  if (savedImageId) {
    await test(`Delete Image (DELETE /api/images/${savedImageId})`, async () => {
      const response = await fetch(`${BASE_URL}/images/${savedImageId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error(`Status ${response.status}`);
      const data = await response.json();
      log(`   Deleted successfully`, 'blue');
      return data;
    });
  }

  log('\n╔════════════════════════════════════════╗', 'bright');
  log('║        ✅ ALL TESTS COMPLETED!        ║', 'bright');
  log('╚════════════════════════════════════════╝\n', 'bright');
}

main().catch((err) => {
  log(`\n❌ Test suite failed: ${err.message}`, 'red');
  process.exit(1);
});
