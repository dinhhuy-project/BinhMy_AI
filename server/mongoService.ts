import { MongoClient, Db, Collection } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DATABASE_NAME = process.env.DATABASE_NAME || 'test';
const COLLECTION_NAME = 'search_results';

let client: MongoClient | null = null;
let db: Db | null = null;
let collection: Collection | null = null;

/**
 * Kết nối đến MongoDB
 */
export const connectDB = async (): Promise<void> => {
  if (client) {
    console.log('MongoDB already connected');
    return;
  }

  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DATABASE_NAME);
    collection = db.collection(COLLECTION_NAME);
    
    console.log('✓ MongoDB connected successfully');
    
    // Tạo index cho trường query để tối ưu tìm kiếm
    await collection.createIndex({ query: 1 });
    await collection.createIndex({ createdAt: -1 });
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error);
    throw error;
  }
};

/**
 * Ngắt kết nối MongoDB
 */
export const disconnectDB = async (): Promise<void> => {
  if (client) {
    await client.close();
    client = null;
    db = null;
    collection = null;
    console.log('✓ MongoDB disconnected');
  }
};

/**
 * Lưu kết quả tìm kiếm ảnh lên MongoDB
 */
export const saveSearchResult = async (data: {
  query: string;
  imageFileName: string;
  imageUrl?: string;
  matchScore: number;
  matchReason: string;
  imageMimeType: string;
  metadata?: Record<string, any>;
}): Promise<any> => {
  if (!collection) {
    throw new Error('Database not connected');
  }

  const result = await collection.insertOne({
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return result;
};

/**
 * Lấy tất cả kết quả tìm kiếm
 */
export const getAllSearchResults = async (): Promise<any[]> => {
  if (!collection) {
    throw new Error('Database not connected');
  }

  return await collection
    .find({})
    .sort({ createdAt: -1 })
    .limit(100)
    .toArray();
};

/**
 * Tìm kiếm kết quả theo query
 */
export const searchResultsByQuery = async (query: string): Promise<any[]> => {
  if (!collection) {
    throw new Error('Database not connected');
  }

  return await collection
    .find({ query: { $regex: query, $options: 'i' } })
    .sort({ createdAt: -1 })
    .toArray();
};

/**
 * Lấy kết quả tìm kiếm theo ID
 */
export const getSearchResultById = async (id: string): Promise<any | null> => {
  if (!collection) {
    throw new Error('Database not connected');
  }

  const { ObjectId } = await import('mongodb');
  return await collection.findOne({ _id: new ObjectId(id) });
};

/**
 * Cập nhật kết quả tìm kiếm
 */
export const updateSearchResult = async (
  id: string,
  updateData: Record<string, any>
): Promise<any> => {
  if (!collection) {
    throw new Error('Database not connected');
  }

  const { ObjectId } = await import('mongodb');
  const result = await collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...updateData, updatedAt: new Date() } }
  );

  return result;
};

/**
 * Xóa kết quả tìm kiếm
 */
export const deleteSearchResult = async (id: string): Promise<any> => {
  if (!collection) {
    throw new Error('Database not connected');
  }

  const { ObjectId } = await import('mongodb');
  return await collection.deleteOne({ _id: new ObjectId(id) });
};

/**
 * Lấy thống kê
 */
export const getStatistics = async (): Promise<any> => {
  if (!collection) {
    throw new Error('Database not connected');
  }

  const totalResults = await collection.countDocuments();
  const topQueries = await collection
    .aggregate([
      { $group: { _id: '$query', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ])
    .toArray();

  return {
    totalResults,
    topQueries,
  };
};
