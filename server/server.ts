import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, disconnectDB, saveSearchResult, getAllSearchResults, searchResultsByQuery, getStatistics } from './mongoService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

/**
 * POST /api/search-results
 * Lưu kết quả tìm kiếm ảnh lên MongoDB
 */
app.post('/api/search-results', async (req: Request, res: Response) => {
  try {
    const {
      query,
      imageFileName,
      imageUrl,
      matchScore,
      matchReason,
      imageMimeType,
      metadata,
    } = req.body;

    // Validation
    if (!query || !imageFileName || matchScore === undefined) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: query, imageFileName, matchScore',
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

    const result = await saveSearchResult({
      query,
      imageFileName,
      imageUrl,
      matchScore,
      matchReason,
      imageMimeType: imageMimeType || 'image/jpeg',
      metadata: metadata || {},
    });

    res.status(201).json({
      success: true,
      message: 'Search result saved successfully',
      data: {
        id: result.insertedId,
        ...req.body,
      },
    });
  } catch (error) {
    console.error('Error saving search result:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save search result',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/search-results
 * Lấy tất cả kết quả tìm kiếm
 */
app.get('/api/search-results', async (req: Request, res: Response) => {
  try {
    const results = await getAllSearchResults();

    res.json({
      success: true,
      data: results,
      count: results.length,
    });
  } catch (error) {
    console.error('Error fetching search results:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch search results',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/search-results/search
 * Tìm kiếm kết quả theo query
 */
app.get('/api/search-results/search', async (req: Request, res: Response) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Query parameter "q" is required',
      });
      return;
    }

    const results = await searchResultsByQuery(q);

    res.json({
      success: true,
      query: q,
      data: results,
      count: results.length,
    });
  } catch (error) {
    console.error('Error searching results:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search results',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/statistics
 * Lấy thống kê
 */
app.get('/api/statistics', async (req: Request, res: Response) => {
  try {
    const statistics = await getStatistics();

    res.json({
      success: true,
      data: statistics,
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response) => {
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
      console.log(`   - POST /api/search-results            (Save search result)`);
      console.log(`   - GET  /api/search-results            (Get all results)`);
      console.log(`   - GET  /api/search-results/search     (Search by query)`);
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
  await disconnectDB();
  process.exit(0);
});

startServer();
