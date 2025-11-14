/**
 * Example API Calls with MongoImage Interface
 * 
 * Bạn có thể copy-paste các lệnh này vào Terminal hoặc sử dụng Postman
 */

// ============= 1. Health Check =============
// GET http://localhost:5000/api/health

fetch('http://localhost:5000/api/health')
  .then(res => res.json())
  .then(data => console.log('Health:', data));

// ============= 2. Save Image to MongoDB =============
// POST http://localhost:5000/api/images

const mongoImagePayload = {
  searchQuery: "con chó đang chơi",
  imageId: "img_12345",
  imageName: "dog_play.jpg",
  imageUrl: "https://example.com/dog_play.jpg",
  imageBase64: "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  mimeType: "image/jpeg",
  matchScore: 95,
  matchReason: "Hình ảnh rõ ràng thể hiện một chú chó đang chơi",
  source: "upload", // 'google-drive' hoặc 'upload'
  driveFileId: null, // Nếu từ Google Drive, thêm ID tại đây
};

fetch('http://localhost:5000/api/images', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(mongoImagePayload),
})
  .then(res => res.json())
  .then(data => console.log('Image Saved:', data));

// ============= 3. Get All Images =============
// GET http://localhost:5000/api/images

fetch('http://localhost:5000/api/images')
  .then(res => res.json())
  .then(data => console.log('All Images:', data));

// ============= 4. Get Image by ID =============
// GET http://localhost:5000/api/images/:imageId

fetch('http://localhost:5000/api/images/507f1f77bcf86cd799439011')
  .then(res => res.json())
  .then(data => console.log('Image by ID:', data));

// ============= 5. Search Images by Query =============
// GET http://localhost:5000/api/images/search?q=con chó

fetch('http://localhost:5000/api/images/search?q=con%20ch%C3%B3')
  .then(res => res.json())
  .then(data => console.log('Search Results:', data));

// ============= 6. Get Images by Source =============
// GET http://localhost:5000/api/images/source/upload

fetch('http://localhost:5000/api/images/source/upload')
  .then(res => res.json())
  .then(data => console.log('Upload Images:', data));

// Get Google Drive Images
fetch('http://localhost:5000/api/images/source/google-drive')
  .then(res => res.json())
  .then(data => console.log('Google Drive Images:', data));

// ============= 7. Update Image =============
// PUT http://localhost:5000/api/images/:imageId

const updatePayload = {
  matchScore: 98,
  matchReason: "Updated reason",
};

fetch('http://localhost:5000/api/images/507f1f77bcf86cd799439011', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(updatePayload),
})
  .then(res => res.json())
  .then(data => console.log('Update Result:', data));

// ============= 8. Delete Image =============
// DELETE http://localhost:5000/api/images/:imageId

fetch('http://localhost:5000/api/images/507f1f77bcf86cd799439011', {
  method: 'DELETE',
})
  .then(res => res.json())
  .then(data => console.log('Delete Result:', data));

// ============= 9. Get Statistics =============
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
$imagePayload = @{
    searchQuery = "con chó đang chơi"
    imageId = "img_12345"
    imageName = "dog_play.jpg"
    mimeType = "image/jpeg"
    matchScore = 95
    matchReason = "Hình ảnh thể hiện một chú chó đang chơi"
    source = "upload"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/images" `
  -Method Post `
  -Headers @{"Content-Type"="application/json"} `
  -Body $imagePayload

# 4. Search Images
Invoke-WebRequest -Uri "http://localhost:5000/api/images/search?q=con+chó" -Method Get

# 5. Get Images by Source
Invoke-WebRequest -Uri "http://localhost:5000/api/images/source/upload" -Method Get

# 6. Get Statistics
Invoke-WebRequest -Uri "http://localhost:5000/api/statistics" -Method Get

# 7. Delete Image
Invoke-WebRequest -Uri "http://localhost:5000/api/images/507f1f77bcf86cd799439011" `
  -Method Delete

# 8. Update Image
$updatePayload = @{
    matchScore = 98
    matchReason = "Updated reason"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/images/507f1f77bcf86cd799439011" `
  -Method Put `
  -Headers @{"Content-Type"="application/json"} `
  -Body $updatePayload
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
    "imageId": "img_12345",
    "imageName": "dog_play.jpg",
    "mimeType": "image/jpeg",
    "matchScore": 95,
    "matchReason": "Hình ảnh thể hiện một chú chó đang chơi",
    "source": "upload"
  }'

# 4. Search Images
curl -X GET "http://localhost:5000/api/images/search?q=con%20ch%C3%B3"

# 5. Get Images by Source
curl -X GET "http://localhost:5000/api/images/source/upload"
curl -X GET "http://localhost:5000/api/images/source/google-drive"

# 6. Get Statistics
curl -X GET http://localhost:5000/api/statistics

# 7. Delete Image
curl -X DELETE http://localhost:5000/api/images/507f1f77bcf86cd799439011

# 8. Update Image
curl -X PUT http://localhost:5000/api/images/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "matchScore": 98,
    "matchReason": "Updated reason"
  }'
*/
