import mongoose, { Schema, Document } from 'mongoose';

export interface SearchResult extends Document {
  query: string;
  imageFileName: string;
  imageUrl?: string;
  matchScore: number;
  matchReason: string;
  imageMimeType: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const searchResultSchema = new Schema<SearchResult>({
  query: {
    type: String,
    required: true,
    index: true,
  },
  imageFileName: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    default: null,
  },
  matchScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  matchReason: {
    type: String,
    required: true,
  },
  imageMimeType: {
    type: String,
    default: 'image/jpeg',
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {},
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export const SearchResultModel = mongoose.model<SearchResult>(
  'SearchResult',
  searchResultSchema
);
