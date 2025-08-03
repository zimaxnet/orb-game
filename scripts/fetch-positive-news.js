#!/usr/bin/env node

/**
 * Manual Positive News Fetcher
 * ---------------------------------
 * Usage: node scripts/fetch-positive-news.js [category]
 * If no category supplied, fetch for all predefined categories.
 */

import dotenv from 'dotenv';
import PositiveNewsService from '../backend/positive-news-service.js';

dotenv.config();

const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error('❌ MONGO_URI not set');
  process.exit(1);
}
if (!process.env.PERPLEXITY_API_KEY) {
  console.error('❌ PERPLEXITY_API_KEY not set');
  process.exit(1);
}

const categoryArg = process.argv[2];

(async () => {
  const svc = new PositiveNewsService(mongoUri);
  await svc.initialize();
  if (categoryArg) {
    console.log(`🔄 Fetching positive news for ${categoryArg} ...`);
    await svc.fetchAndStorePositiveNews(categoryArg);
  } else {
    console.log('🔄 Fetching positive news for all categories ...');
    await svc.updatePositiveNews();
  }
  console.log('✅ Done');
  process.exit(0);
})(); 