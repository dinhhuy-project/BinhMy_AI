#!/usr/bin/env node

/**
 * Setup script for Railway deployment
 * Run this after setting environment variables on Railway
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

// Check if .env exists
if (fs.existsSync(envPath)) {
  console.log('✓ .env file already exists');
} else if (fs.existsSync(envExamplePath)) {
  // Copy .env.example to .env
  fs.copyFileSync(envExamplePath, envPath);
  console.log('✓ Created .env from .env.example');
} else {
  console.warn('⚠ Warning: Neither .env nor .env.example found');
}

// Verify critical environment variables
const requiredVars = ['MONGODB_URI', 'VITE_GEMINI_API_KEY', 'NODE_ENV'];
const missingVars = requiredVars.filter(
  (v) => !process.env[v]
);

if (missingVars.length > 0) {
  console.warn(`\n⚠ Missing environment variables: ${missingVars.join(', ')}`);
  console.warn('Please set these variables in Railway dashboard or .env file\n');
} else {
  console.log('✓ All required environment variables are set');
}

console.log('\n✅ Setup complete! Ready for deployment.');
