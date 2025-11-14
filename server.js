import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, ObjectId } from 'mongodb';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// MongoDB Configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DATABASE_NAME = process.env.DATABASE_NAME || 'test';
const IMAGES_COLLECTION = 'images';

let db = null;
let imagesCollection = null;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files from the dist directory (frontend build)
app.use(express.static(path.join(__dirname, 'dist')));

// Connect to MongoDB
const connectDB = async () => {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DATABASE_NAME);
    imagesCollection = db.collection(IMAGES_COLLECTION);
    
    // Create indexes
    await imagesCollection.createIndex({ searchQuery: 1 });
    await imagesCollection.createIndex({ imageId: 1 });
    await imagesCollection.createIndex({ source: 1 });
    await imagesCollection.createIndex({ createdAt: -1 });
    await imagesCollection.createIndex({ matchScore: -1 });
    
    console.log('✓ MongoDB connected successfully');
    return client;
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error.message);
    throw error;
  }
};

// ============= IMAGE ENDPOINTS =============

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

/**
 * POST /api/images
 * Lưu ảnh tìm kiếm được lên MongoDB
 */
app.post('/api/images', async (req, res) => {
  try {
    const {
      searchQuery,
      imageId,
      imageName,
      imageUrl,
      imageBase64,
      mimeType,
      matchScore,
      matchReason,
      source,
      driveFileId,
    } = req.body;

    // Validation
    if (!searchQuery || !imageId || !imageName || matchScore === undefined) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: searchQuery, imageId, imageName, matchScore',
      });
      return;
    }

    if (matchScore < 0 || matchScore > 100) {
      res.status(400).json({
        success: false,
        message: 'matchScore must be between 0 and 100',
      });
      return;
    }

    if (!['google-drive', 'upload'].includes(source)) {
      res.status(400).json({
        success: false,
        message: 'source must be either "google-drive" or "upload"',
      });
      return;
    }

    const result = await imagesCollection.insertOne({
      searchQuery,
      imageId,
      imageName,
      imageUrl: imageUrl || null,
      imageBase64: imageBase64 || null,
      mimeType: mimeType || 'image/jpeg',
      matchScore,
      matchReason,
      source,
      driveFileId: driveFileId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Image saved successfully',
      data: {
        _id: result.insertedId,
        ...req.body,
      },
    });
  } catch (error) {
    console.error('Error saving image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save image',
      error: error.message,
    });
  }
});

/**
 * GET /api/images
 * Lấy tất cả ảnh đã lưu
 */
app.get('/api/images', async (req, res) => {
  try {
    const images = await imagesCollection
      .find({})
      .sort({ createdAt: -1 })
      .limit(200)
      .toArray();

    res.json({
      success: true,
      data: images,
      count: images.length,
    });
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch images',
      error: error.message,
    });
  }
});

/**
 * GET /api/images/:imageId
 * Lấy ảnh theo ID
 */
app.get('/api/images/:imageId', async (req, res) => {
  try {
    const { imageId } = req.params;

    const image = await imagesCollection.findOne({ _id: new ObjectId(imageId) });

    if (!image) {
      res.status(404).json({
        success: false,
        message: 'Image not found',
      });
      return;
    }

    res.json({
      success: true,
      data: image,
    });
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch image',
      error: error.message,
    });
  }
});

/**
 * GET /api/images/search?q=query
 * Tìm kiếm ảnh theo query
 */
app.get('/api/images/search', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Query parameter "q" is required',
      });
      return;
    }

    const results = await imagesCollection
      .find({ searchQuery: { $regex: q, $options: 'i' } })
      .sort({ createdAt: -1 })
      .toArray();

    res.json({
      success: true,
      query: q,
      data: results,
      count: results.length,
    });
  } catch (error) {
    console.error('Error searching images:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search images',
      error: error.message,
    });
  }
});

/**
 * GET /api/images/source/:source
 * Lấy ảnh theo source (google-drive hoặc upload)
 */
app.get('/api/images/source/:source', async (req, res) => {
  try {
    const { source } = req.params;

    if (!['google-drive', 'upload'].includes(source)) {
      res.status(400).json({
        success: false,
        message: 'source must be either "google-drive" or "upload"',
      });
      return;
    }

    const images = await imagesCollection
      .find({ source })
      .sort({ createdAt: -1 })
      .toArray();

    res.json({
      success: true,
      source,
      data: images,
      count: images.length,
    });
  } catch (error) {
    console.error('Error fetching images by source:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch images by source',
      error: error.message,
    });
  }
});

/**
 * DELETE /api/images/:imageId
 * Xóa ảnh
 */
app.delete('/api/images/:imageId', async (req, res) => {
  try {
    const { imageId } = req.params;

    const result = await imagesCollection.deleteOne({ _id: new ObjectId(imageId) });

    if (result.deletedCount === 0) {
      res.status(404).json({
        success: false,
        message: 'Image not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Image deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image',
      error: error.message,
    });
  }
});

/**
 * PUT /api/images/:imageId
 * Cập nhật ảnh
 */
app.put('/api/images/:imageId', async (req, res) => {
  try {
    const { imageId } = req.params;
    const updateData = req.body;

    delete updateData._id;
    delete updateData.createdAt;
    updateData.updatedAt = new Date();

    const result = await imagesCollection.updateOne(
      { _id: new ObjectId(imageId) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      res.status(404).json({
        success: false,
        message: 'Image not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Image updated successfully',
    });
  } catch (error) {
    console.error('Error updating image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update image',
      error: error.message,
    });
  }
});

/**
 * GET /api/statistics
 * Lấy thống kê
 */
app.get('/api/statistics', async (req, res) => {
  try {
    const totalImages = await imagesCollection.countDocuments();
    
    const topQueries = await imagesCollection
      .aggregate([
        { $group: { _id: '$searchQuery', count: { $sum: 1 }, avgScore: { $avg: '$matchScore' } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ])
      .toArray();

    const sourceBreakdown = await imagesCollection
      .aggregate([
        { $group: { _id: '$source', count: { $sum: 1 } } },
      ])
      .toArray();

    const avgMatchScore = await imagesCollection
      .aggregate([
        { $group: { _id: null, avgScore: { $avg: '$matchScore' } } },
      ])
      .toArray();

    res.json({
      success: true,
      data: {
        totalImages,
        topQueries,
        sourceBreakdown,
        averageMatchScore: avgMatchScore[0]?.avgScore || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message,
    });
  }
});

// SPA Fallback - Serve index.html for any non-API routes
app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api')) {
    res.status(404).json({
      success: false,
      message: 'Route not found',
      path: req.path,
    });
    return;
  }
  
  // Serve index.html for all other routes (SPA)
  res.sendFile(path.join(__dirname, 'dist', 'index.html'), (err) => {
    if (err) {
      res.status(500).json({
        success: false,
        message: 'Failed to load application',
        error: err.message,
      });
    }
  });
});

// Error handler
app.use((err, req, res) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message,
  });
});

// Start server
const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`\n🚀 Server is running on http://localhost:${PORT}`);
      console.log(`📊 API Documentation:`);
      console.log(`   - GET  /api/health                    (Health check)`);
      console.log(`   - POST /api/images                    (Save image)`);
      console.log(`   - GET  /api/images                    (Get all images)`);
      console.log(`   - GET  /api/images/:imageId           (Get image by ID)`);
      console.log(`   - GET  /api/images/search?q=          (Search images)`);
      console.log(`   - GET  /api/images/source/:source     (Get by source)`);
      console.log(`   - DELETE /api/images/:imageId         (Delete image)`);
      console.log(`   - PUT  /api/images/:imageId           (Update image)`);
      console.log(`   - GET  /api/statistics                (Get statistics)\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\n🛑 Shutting down gracefully...');
  process.exit(0);
});

startServer();
