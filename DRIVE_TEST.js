/**
 * 🧪 TEST DRIVE SERVICE
 * 
 * Chạy file này để test Google Drive integration
 * 
 * Sử dụng trong browser console:
 * 1. Mở F12 (Developer Tools)
 * 2. Chạy các hàm dưới đây
 */

// ============================================
// 📝 TEST FUNCTIONS
// ============================================

// Test 1: Kiểm tra authenticated
async function testAuthenticated() {
  console.log('🔍 Checking authentication...');
  const authed = window.gapi?.client?.getToken() !== null;
  console.log('Authenticated:', authed);
  return authed;
}

// Test 2: Tìm folder BANG LED BEP
async function testFindBangLedBep() {
  try {
    console.log('🔍 Finding BANG LED BEP folder...');
    const folderId = await window.driveService.findFolderByName('BANG LED BEP');
    console.log('✅ Found BANG LED BEP:', folderId);
    return folderId;
  } catch (error) {
    console.error('❌ Error finding folder:', error);
    throw error;
  }
}

// Test 3: Tìm subfolder đầu tiên
async function testFindFirstSubfolder(parentFolderId) {
  try {
    console.log('🔍 Finding first subfolder in:', parentFolderId);
    const subfolderId = await window.driveService.findFirstSubfolder(parentFolderId);
    console.log('✅ Found first subfolder:', subfolderId);
    return subfolderId;
  } catch (error) {
    console.error('❌ Error finding subfolder:', error);
    throw error;
  }
}

// Test 4: Lấy ảnh từ folder
async function testGetImagesFromFolder(folderId) {
  try {
    console.log('🔍 Getting images from folder:', folderId);
    const images = await window.driveService.getImagesFromFolder(folderId);
    console.log(`✅ Found ${images.length} images:`, images);
    return images;
  } catch (error) {
    console.error('❌ Error getting images:', error);
    throw error;
  }
}

// Test 5: Chạy toàn bộ flow
async function testFullFlow() {
  console.log('🚀 Running full flow...\n');
  
  try {
    // Step 1: Check auth
    console.log('📍 Step 1: Checking authentication...');
    const authed = await testAuthenticated();
    if (!authed) {
      console.error('❌ Not authenticated! Please sign in first.');
      return;
    }
    
    // Step 2: Find BANG LED BEP
    console.log('\n📍 Step 2: Finding BANG LED BEP folder...');
    const bangId = await testFindBangLedBep();
    if (!bangId) {
      console.error('❌ BANG LED BEP folder not found!');
      return;
    }
    
    // Step 3: Find first subfolder
    console.log('\n📍 Step 3: Finding first subfolder...');
    const subfolderId = await testFindFirstSubfolder(bangId);
    if (!subfolderId) {
      console.error('❌ No subfolder found! Trying to get images from BANG LED BEP directly...');
      const images = await testGetImagesFromFolder(bangId);
      console.log(`Found ${images.length} images directly in BANG LED BEP`);
      return images;
    }
    
    // Step 4: Get images
    console.log('\n📍 Step 4: Getting images from subfolder...');
    const images = await testGetImagesFromFolder(subfolderId);
    
    console.log('\n✅ All tests passed!');
    console.log(`📊 Total images found: ${images.length}`);
    return images;
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
  }
}

// Test 6: Lấy tất cả ảnh qua getScheduleFolderImages
async function testGetScheduleFolderImages() {
  try {
    console.log('🔍 Testing getScheduleFolderImages()...');
    const images = await window.driveService.getScheduleFolderImages();
    console.log(`✅ Found ${images.length} images:`, images);
    return images;
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// ============================================
// 🎯 HOW TO USE IN CONSOLE
// ============================================

/*

1. Mở ứng dụng tại: http://localhost:3000

2. Đăng nhập Google Drive

3. Mở Chrome DevTools: F12

4. Vào tab Console

5. Chạy các lệnh:

   // Test 1: Check if signed in
   > testAuthenticated()
   
   // Test 2: Find BANG LED BEP folder
   > testFindBangLedBep()
   
   // Test 3: Full flow test
   > testFullFlow()
   
   // Test 4: Get all images
   > testGetScheduleFolderImages()

*/

// ============================================
// 📊 DEBUG INFO
// ============================================

function showDebugInfo() {
  console.log('%c=== DEBUG INFO ===', 'background: blue; color: white; padding: 10px;');
  console.log('📍 Current URL:', window.location.href);
  console.log('📍 Gapi loaded:', !!window.gapi);
  console.log('📍 Google loaded:', !!window.google);
  console.log('📍 Drive Service available:', !!window.driveService);
  
  if (window.gapi?.client) {
    console.log('📍 Authentication:', window.gapi.client.getToken() !== null);
  }
}

// Run this to see debug info
// showDebugInfo()

console.log(
  '%c🧪 Test Functions Loaded!\n\nAvailable functions:\n' +
  '  • testAuthenticated()\n' +
  '  • testFindBangLedBep()\n' +
  '  • testFindFirstSubfolder(parentId)\n' +
  '  • testGetImagesFromFolder(folderId)\n' +
  '  • testGetScheduleFolderImages()\n' +
  '  • testFullFlow()\n' +
  '  • showDebugInfo()\n\n' +
  'Try: testFullFlow()',
  'background: green; color: white; padding: 10px; border-radius: 5px;'
);
