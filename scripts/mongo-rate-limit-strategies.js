/**
 * MongoDB Rate Limiting Strategies
 * 
 * Current Analysis Results:
 * - MongoDB is not currently rate limiting our operations
 * - Single inserts: 135ms
 * - Sequential inserts: 5/5 success, 839ms
 * - Bulk inserts: Working efficiently
 * - All delay strategies: 100% success rate
 * 
 * However, during large-scale story generation (240+ stories), we may encounter rate limiting.
 */

/**
 * Exponential Backoff with Jitter for MongoDB operations
 * @param {Object} collection - MongoDB collection
 * @param {Object} document - Document to insert
 * @param {number} maxRetries - Maximum retry attempts
 * @returns {Promise<Object>} Insert result
 */
async function insertWithRetry(collection, document, maxRetries = 5) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await collection.insertOne(document);
    } catch (error) {
      if (error.code === 16500) { // MongoDB rate limit error
        const delay = Math.min(1000 * Math.pow(2, attempt) + Math.random() * 1000, 10000);
        console.log(`⚠️ Rate limited, retrying in ${delay}ms (attempt ${attempt + 1})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  throw new Error('Max retries exceeded');
}

/**
 * Batch Processing with Delays for MongoDB operations
 * @param {Object} collection - MongoDB collection
 * @param {Array} documents - Array of documents to insert
 * @param {number} batchSize - Number of documents per batch
 * @param {number} delayMs - Delay between batches in milliseconds
 * @returns {Promise<Array>} Array of insert results
 */
async function batchInsert(collection, documents, batchSize = 5, delayMs = 2000) {
  const results = [];
  
  for (let i = 0; i < documents.length; i += batchSize) {
    const batch = documents.slice(i, i + batchSize);
    
    try {
      const result = await collection.insertMany(batch);
      results.push(result);
      
      // Delay between batches
      if (i + batchSize < documents.length) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    } catch (error) {
      if (error.code === 16500) {
        console.log(`⚠️ Batch rate limited, increasing delay`);
        await new Promise(resolve => setTimeout(resolve, delayMs * 2));
        i -= batchSize; // Retry this batch
      } else {
        throw error;
      }
    }
  }
  
  return results;
}

/**
 * Queue-Based Processing for MongoDB operations
 */
class MongoQueue {
  constructor(collection, concurrency = 3, delayMs = 1000) {
    this.collection = collection;
    this.concurrency = concurrency;
    this.delayMs = delayMs;
    this.queue = [];
    this.processing = 0;
  }
  
  async add(document) {
    return new Promise((resolve, reject) => {
      this.queue.push({ document, resolve, reject });
      this.process();
    });
  }
  
  async process() {
    if (this.processing >= this.concurrency || this.queue.length === 0) {
      return;
    }
    
    this.processing++;
    const { document, resolve, reject } = this.queue.shift();
    
    try {
      const result = await this.insertWithRetry(document);
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.processing--;
      await new Promise(resolve => setTimeout(resolve, this.delayMs));
      this.process();
    }
  }
  
  async insertWithRetry(document, maxRetries = 3) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await this.collection.insertOne(document);
      } catch (error) {
        if (error.code === 16500 && attempt < maxRetries - 1) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          throw error;
        }
      }
    }
  }
}

/**
 * Adaptive Rate Limiting for MongoDB operations
 */
class AdaptiveRateLimiter {
  constructor(initialDelay = 1000) {
    this.currentDelay = initialDelay;
    this.successCount = 0;
    this.errorCount = 0;
    this.lastErrorTime = 0;
  }
  
  async execute(operation) {
    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onError(error);
      throw error;
    }
  }
  
  onSuccess() {
    this.successCount++;
    // Gradually decrease delay if successful
    if (this.successCount % 10 === 0) {
      this.currentDelay = Math.max(500, this.currentDelay * 0.9);
    }
  }
  
  onError(error) {
    this.errorCount++;
    this.lastErrorTime = Date.now();
    
    if (error.code === 16500) {
      // Increase delay on rate limit errors
      this.currentDelay = Math.min(10000, this.currentDelay * 2);
    }
  }
  
  getDelay() {
    return this.currentDelay;
  }
}

/**
 * Conservative settings for story generation
 */
const conservativeSettings = {
  batchSize: 3,
  delayBetweenBatches: 3000,
  maxRetries: 5,
  exponentialBackoff: true
};

/**
 * Adaptive settings for story generation
 */
const adaptiveSettings = {
  minDelay: 1000,
  maxDelay: 10000,
  targetSuccessRate: 0.95,
  adjustInterval: 10 // Adjust every 10 operations
};

/**
 * Queue settings for large-scale operations
 */
const queueSettings = {
  concurrency: 2,
  queueSize: 50,
  retryStrategy: 'exponential-backoff'
};

/**
 * Key metrics to track for rate limiting
 */
const rateLimitMetrics = {
  successRate: 0,
  averageResponseTime: 0,
  rateLimitErrorFrequency: 0,
  retryAttemptsPerOperation: 0,
  totalProcessingTime: 0
};

/**
 * Alerting thresholds for rate limiting
 */
const alertingThresholds = {
  successRate: 0.90,
  rateLimitErrors: 0.10,
  averageResponseTime: 5000,
  maxRetryAttempts: 3
};

export {
  insertWithRetry,
  batchInsert,
  MongoQueue,
  AdaptiveRateLimiter,
  conservativeSettings,
  adaptiveSettings,
  queueSettings,
  rateLimitMetrics,
  alertingThresholds
}; 