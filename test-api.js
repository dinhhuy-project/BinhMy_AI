/**
 * Integration Test - MongoImage API
 * Chạy: node test-api.js
 */

const API_BASE_URL = 'http://localhost:5000/api';

// Color console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

async function test(name, fn) {
  log(colors.blue, `\n📝 Testing: ${name}`);
  try {
    await fn();
    log(colors.green, `✅ PASSED`);
  } catch (error) {
    log(colors.red, `❌ FAILED: ${error.message}`);
  }
}

async function request(method, endpoint, body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(`${response.status}: ${data.message || data.error}`);
  }

  return data;
}

// Test cases
async function runTests() {
  log(colors.blue, '\n========================================');
  log(colors.blue, '  MongoImage API Integration Tests');
  log(colors.blue, '========================================\n');

  // Check if server is running
  await test('Health Check', async () => {
    const data = await request('GET', '/health');
    if (data.status !== 'OK') throw new Error('Server not healthy');
  });

  // Test: Get all images (should be empty or return array)
  let savedImageId;
  await test('Get All Images', async () => {
    const data = await request('GET', '/images');
    if (!Array.isArray(data.data)) throw new Error('Expected array');
  });

  // Test: Save a new image
  const testImage = {
    searchQuery: 'test dog',
    imageId: 'test_img_123_' + Date.now(),
    imageName: 'test_dog.jpg',
    imageUrl: 'https://example.com/dog.jpg',
    mimeType: 'image/jpeg',
    matchScore: 92,
    matchReason: 'Thử nghiệm',
    source: 'upload',
  };

  await test('Save Image', async () => {
    const data = await request('POST', '/images', testImage);
    if (!data.data._id) throw new Error('No ID returned');
    savedImageId = data.data._id;
    log(colors.yellow, `  Saved image ID: ${savedImageId}`);
  });

  // Test: Get image by ID
  if (savedImageId) {
    await test('Get Image by ID', async () => {
      const data = await request('GET', `/images/${savedImageId}`);
      if (data.data.searchQuery !== testImage.searchQuery) {
        throw new Error('Data mismatch');
      }
    });
  }

  // Test: Search images
  await test('Search Images', async () => {
    const data = await request('GET', '/images/search?q=test');
    if (!Array.isArray(data.data)) throw new Error('Expected array');
  });

  // Test: Get images by source
  await test('Get Images by Source', async () => {
    const data = await request('GET', '/images/source/upload');
    if (!Array.isArray(data.data)) throw new Error('Expected array');
  });

  // Test: Get statistics
  await test('Get Statistics', async () => {
    const data = await request('GET', '/statistics');
    if (typeof data.data.totalImages !== 'number') {
      throw new Error('No totalImages in stats');
    }
  });

  // Test: Update image
  if (savedImageId) {
    await test('Update Image', async () => {
      const updateData = {
        matchScore: 95,
        matchReason: 'Cập nhật thử nghiệm',
      };
      await request('PUT', `/images/${savedImageId}`, updateData);
    });
  }

  // Test: Delete image
  if (savedImageId) {
    await test('Delete Image', async () => {
      await request('DELETE', `/images/${savedImageId}`);
    });
  }

  // Test: Invalid source
  await test('Validation - Invalid Source', async () => {
    try {
      await request('POST', '/images', {
        ...testImage,
        source: 'invalid',
      });
      throw new Error('Should have failed');
    } catch (error) {
      if (error.message.includes('400')) {
        // Expected error
      } else {
        throw error;
      }
    }
  });

  // Test: Missing required field
  await test('Validation - Missing Field', async () => {
    try {
      const { matchScore, ...incomplete } = testImage;
      await request('POST', '/images', incomplete);
      throw new Error('Should have failed');
    } catch (error) {
      if (error.message.includes('400')) {
        // Expected error
      } else {
        throw error;
      }
    }
  });

  log(colors.blue, '\n========================================');
  log(colors.green, '✅ All tests completed!');
  log(colors.blue, '========================================\n');

  process.exit(0);
}

// Check if server is running
async function checkServer() {
  try {
    await fetch(`${API_BASE_URL}/health`);
    return true;
  } catch {
    return false;
  }
}

// Main
(async () => {
  if (!(await checkServer())) {
    log(colors.red, '\n❌ ERROR: Backend server is not running!');
    log(colors.yellow, '\nPlease start the server first:');
    log(colors.yellow, '  npm run dev:server\n');
    process.exit(1);
  }

  await runTests();
})();
