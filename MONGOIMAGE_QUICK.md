# 🎯 MongoImage API - Ghi Chú Nhanh

## What Changed? 

Dự án đã được cập nhật từ `SearchResult` interface sang `MongoImage` interface - cung cấp tracking tốt hơn cho ảnh từ các nguồn khác nhau (Google Drive vs Upload).

## Tối Thiểu Cần Biết

### New Interface
```typescript
interface MongoImage {
  searchQuery: string;  // What user searched for
  imageId: string;      // Unique image ID
  imageName: string;    // File name
  matchScore: number;   // 0-100
  matchReason: string;  // Why this score
  source: 'google-drive' | 'upload';  // Where it came from
  imageBase64?: string; // Optional image data
  imageUrl?: string;    // Optional URL
  driveFileId?: string; // For Google Drive images
}
```

### Key Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/images` | Save found image |
| GET | `/api/images` | Get all images |
| GET | `/api/images/source/upload` | Get uploaded images |
| GET | `/api/images/source/google-drive` | Get Drive images |
| GET | `/api/images/search?q=dog` | Search by query |
| DELETE | `/api/images/:id` | Delete image |
| PUT | `/api/images/:id` | Update image |
| GET | `/api/statistics` | View stats |

### How It Works

```
User uploads ảnh + Enters search query
         ↓
Gemini AI analyzes
         ↓
Gets best match with score
         ↓
Frontend calls POST /api/images with MongoImage data
         ↓
MongoDB saves automatically
         ↓
User sees result
```

## Start

```bash
# Terminal 1
npm run dev:server

# Terminal 2
npm run dev
```

Then visit: `http://localhost:5173`

## Test It

```bash
# Check if server is running
curl http://localhost:5000/api/health

# See all saved images
curl http://localhost:5000/api/images

# Get statistics
curl http://localhost:5000/api/statistics
```

Or see `API_EXAMPLES.js` for full examples.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| MongoDB connection error | Check if MongoDB is running |
| Port 5000 in use | Change PORT in .env |
| Images not saving | Check browser console for errors |
| API 404 | Make sure backend is running |

## Full Documentation

- 📖 [MONGODB_API_SETUP.md](./MONGODB_API_SETUP.md) - Detailed setup
- 🔄 [CHANGELOG_MONGOIMAGE.md](./CHANGELOG_MONGOIMAGE.md) - What changed
- 💻 [API_EXAMPLES.js](./API_EXAMPLES.js) - Code examples
- 🚀 [QUICKSTART.md](./QUICKSTART.md) - Quick start guide

---

**That's it! Happy searching! 🎉**
