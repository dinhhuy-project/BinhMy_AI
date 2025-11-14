/**
 * Example API Calls - Dùng để test API
 * 
 * Bạn có thể copy-paste các lệnh này vào Terminal hoặc sử dụng Postman
 */

// ============= 1. Health Check =============
// GET http://localhost:5000/api/health

fetch('http://localhost:5000/api/health')
  .then(res => res.json())
  .then(data => console.log('Health:', data));

// ============= 2. Save Image =============
// POST http://localhost:5000/api/images

const imagePayload = {
  searchQuery: "con chó đang chơi",
  imageId: "img_123456",
  imageName: "dog_play.jpg",
  imageUrl: "https://example.com/dog_play.jpg",
  imageBase64: "data:image/jpeg;base64,/9j/4AAQSkZJRg...", // Cắt ngắn
  mimeType: "image/jpeg",
  matchScore: 95,
  matchReason: "Hình ảnh rõ ràng thể hiện một chú chó đang chơi",
  source: "upload", // hoặc "google-drive"
  driveFileId: null, // Chỉ dùng nếu source là google-drive
};

fetch('http://localhost:5000/api/images', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(imagePayload),
})
  .then(res => res.json())
  .then(data => console.log('Saved:', data));

// ============= 3. Get All Images =============
// GET http://localhost:5000/api/images

fetch('http://localhost:5000/api/images')
  .then(res => res.json())
  .then(data => console.log('All Images:', data));

// ============= 4. Search Images =============
// GET http://localhost:5000/api/images/search?q=con chó

fetch('http://localhost:5000/api/images/search?q=con%20ch%C3%B3')
  .then(res => res.json())
  .then(data => console.log('Search Results:', data));

// ============= 5. Get Image by ID =============
// GET http://localhost:5000/api/images/:imageId

fetch('http://localhost:5000/api/images/img_123456')
  .then(res => res.json())
  .then(data => console.log('Image:', data));

// ============= 6. Get Images by Source =============
// GET http://localhost:5000/api/images/source/upload
// GET http://localhost:5000/api/images/source/google-drive

fetch('http://localhost:5000/api/images/source/upload')
  .then(res => res.json())
  .then(data => console.log('Upload Images:', data));

// ============= 7. Delete Image =============
// DELETE http://localhost:5000/api/images/:imageId

fetch('http://localhost:5000/api/images/img_123456', {
  method: 'DELETE',
})
  .then(res => res.json())
  .then(data => console.log('Deleted:', data));

// ============= 8. Get Statistics =============
// GET http://localhost:5000/api/statistics

fetch('http://localhost:5000/api/statistics')
  .then(res => res.json())
  .then(data => console.log('Statistics:', data));

// ============= PowerShell Commands (Windows) =============

/*
# 1. Health Check
Invoke-WebRequest -Uri "http://localhost:5000/api/health" -Method Get

# 2. Get All Images
Invoke-WebRequest -Uri "http://localhost:5000/api/images" -Method Get

# 3. Save Image
$body = @{
    searchQuery = "con chó đang chơi"
    imageId = "img_123456"
    imageName = "dog_play.jpg"
    mimeType = "image/jpeg"
    matchScore = 95
    matchReason = "Hình ảnh rõ ràng thể hiện một chú chó đang chơi"
    source = "upload"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/images" `
  -Method Post `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body

# 4. Search Images
Invoke-WebRequest -Uri "http://localhost:5000/api/images/search?q=con+chó" -Method Get

# 5. Get Image by ID
Invoke-WebRequest -Uri "http://localhost:5000/api/images/img_123456" -Method Get

# 6. Get Upload Images
Invoke-WebRequest -Uri "http://localhost:5000/api/images/source/upload" -Method Get

# 7. Delete Image
Invoke-WebRequest -Uri "http://localhost:5000/api/images/img_123456" -Method Delete

# 8. Get Statistics
Invoke-WebRequest -Uri "http://localhost:5000/api/statistics" -Method Get
*/

// ============= cURL Commands (Linux/Mac) =============

/*
# 1. Health Check
curl -X GET http://localhost:5000/api/health

# 2. Get All Images
curl -X GET http://localhost:5000/api/images

# 3. Save Image
curl -X POST http://localhost:5000/api/images \
  -H "Content-Type: application/json" \
  -d '{
    "searchQuery": "con chó đang chơi",
    "imageId": "img_123456",
    "imageName": "dog_play.jpg",
    "mimeType": "image/jpeg",
    "matchScore": 95,
    "matchReason": "Hình ảnh rõ ràng thể hiện một chú chó đang chơi",
    "source": "upload"
  }'

# 4. Search Images
curl -X GET "http://localhost:5000/api/images/search?q=con%20ch%C3%B3"

# 5. Get Image by ID
curl -X GET "http://localhost:5000/api/images/img_123456"

# 6. Get Upload Images
curl -X GET "http://localhost:5000/api/images/source/upload"

# 7. Delete Image
curl -X DELETE "http://localhost:5000/api/images/img_123456"

# 8. Get Statistics
curl -X GET http://localhost:5000/api/statistics
*/
