// AIMCS Memory Service - Shared Demo System
// Handles storage and retrieval of chat completions for memory/context
// 
// DEMO SYSTEM FEATURES:
// - Shared memories across all users for collaborative learning
// - PII removal to protect privacy in shared environment
// - Cross-user memory retrieval and search
// - Enhanced community knowledge base

class MemoryService {
  constructor() {
    this.memoryStore = new Map(); // In-memory storage (can be replaced with database)
    this.maxMemorySize = 1000; // Maximum number of stored completions
    this.similarityThreshold = 0.8; // Threshold for considering queries similar
  }

  // Generate a memory key from user message (shared across all users for demo)
  generateMemoryKey(message, userId = 'default') {
    const cleanMessage = message.toLowerCase().trim();
    // For demo system, use shared key without userId to allow cross-user memory sharing
    return `shared:${this.hashString(cleanMessage)}`;
  }

  // Simple hash function for message
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  // Remove PII from messages for shared demo system
  removePII(message) {
    if (!message) return message;
    
    let sanitized = message;
    
    // Remove email addresses
    sanitized = sanitized.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]');
    
    // Remove phone numbers (various formats)
    sanitized = sanitized.replace(/\b(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, '[PHONE]');
    
    // Remove credit card numbers
    sanitized = sanitized.replace(/\b\d{4}[-.\s]?\d{4}[-.\s]?\d{4}[-.\s]?\d{4}\b/g, '[CARD]');
    
    // Remove social security numbers
    sanitized = sanitized.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]');
    
    // Remove IP addresses
    sanitized = sanitized.replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP]');
    
    // Remove names (simple pattern - could be enhanced)
    sanitized = sanitized.replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, '[NAME]');
    
    // Remove addresses (basic pattern)
    sanitized = sanitized.replace(/\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Court|Ct|Place|Pl|Way|Circle|Cir)\b/gi, '[ADDRESS]');
    
    return sanitized;
  }

  // Store a completion in memory (shared across all users for demo)
  async storeCompletion(userMessage, aiResponse, metadata = {}) {
    try {
      // Remove PII from user message for shared demo system
      const sanitizedMessage = this.removePII(userMessage);
      const memoryKey = this.generateMemoryKey(sanitizedMessage, metadata.userId);
      
      const memoryEntry = {
        id: memoryKey,
        userMessage: sanitizedMessage, // Store sanitized version
        aiResponse: aiResponse,
        timestamp: new Date().toISOString(),
        metadata: {
          ...metadata,
          searchUsed: metadata.searchUsed || false,
          audioGenerated: metadata.audioGenerated || false,
          model: metadata.model || 'gpt-4o-mini',
          tokens: metadata.tokens || 0,
          originalUserId: metadata.userId, // Keep track of original user for analytics
          isShared: true // Flag to indicate this is shared memory
        },
        usageCount: 1,
        lastUsed: new Date().toISOString()
      };

      // Check if we already have this memory
      const existing = this.memoryStore.get(memoryKey);
      if (existing) {
        // Update existing memory with new usage
        existing.usageCount += 1;
        existing.lastUsed = new Date().toISOString();
        existing.aiResponse = aiResponse; // Update with latest response
        existing.metadata = { ...existing.metadata, ...metadata };
      } else {
        // Add new memory
        this.memoryStore.set(memoryKey, memoryEntry);
        
        // Cleanup if we exceed max size
        if (this.memoryStore.size > this.maxMemorySize) {
          this.cleanupOldMemories();
        }
      }

      console.log(`Memory stored: ${memoryKey} (${this.memoryStore.size} total)`);
      return memoryEntry;
    } catch (error) {
      console.error('Error storing memory:', error);
      return null;
    }
  }

  // Retrieve a completion from memory (shared across all users for demo)
  async retrieveCompletion(userMessage, userId = 'default') {
    try {
      // Sanitize the query for shared memory lookup
      const sanitizedMessage = this.removePII(userMessage);
      const memoryKey = this.generateMemoryKey(sanitizedMessage, userId);
      const exactMatch = this.memoryStore.get(memoryKey);
      
      if (exactMatch) {
        // Update usage stats
        exactMatch.usageCount += 1;
        exactMatch.lastUsed = new Date().toISOString();
        console.log(`Memory hit (exact): ${memoryKey}`);
        return exactMatch;
      }

      // Try fuzzy matching for similar queries across all users
      const fuzzyMatch = this.findSimilarMemory(sanitizedMessage, userId);
      if (fuzzyMatch) {
        console.log(`Memory hit (fuzzy): ${fuzzyMatch.id}`);
        return fuzzyMatch;
      }

      console.log(`Memory miss: ${memoryKey}`);
      return null;
    } catch (error) {
      console.error('Error retrieving memory:', error);
      return null;
    }
  }

  // Find similar memories using simple keyword matching (shared across all users)
  findSimilarMemory(userMessage, userId = 'default') {
    // For demo system, search across ALL memories, not just user-specific
    const allMemories = Array.from(this.memoryStore.values())
      .sort((a, b) => b.usageCount - a.usageCount); // Sort by usage

    const userWords = userMessage.toLowerCase().split(/\s+/);
    
    for (const memory of allMemories) {
      const memoryWords = memory.userMessage.toLowerCase().split(/\s+/);
      const commonWords = userWords.filter(word => 
        memoryWords.includes(word) && word.length > 3
      );
      
      const similarity = commonWords.length / Math.max(userWords.length, memoryWords.length);
      
      if (similarity >= this.similarityThreshold) {
        // Update usage stats
        memory.usageCount += 1;
        memory.lastUsed = new Date().toISOString();
        return memory;
      }
    }
    
    return null;
  }

  // Cleanup old memories to maintain size limit
  cleanupOldMemories() {
    const memories = Array.from(this.memoryStore.entries());
    
    // Sort by last used (oldest first) and usage count (least used first)
    memories.sort((a, b) => {
      const aScore = new Date(a[1].lastUsed).getTime() + (a[1].usageCount * 1000);
      const bScore = new Date(b[1].lastUsed).getTime() + (b[1].usageCount * 1000);
      return aScore - bScore;
    });

    // Remove oldest/least used memories
    const toRemove = memories.slice(0, Math.floor(this.maxMemorySize * 0.1)); // Remove 10%
    toRemove.forEach(([key]) => {
      this.memoryStore.delete(key);
    });

    console.log(`Cleaned up ${toRemove.length} old memories`);
  }

  // Get memory statistics
  getMemoryStats() {
    const memories = Array.from(this.memoryStore.values());
    const totalUsage = memories.reduce((sum, m) => sum + m.usageCount, 0);
    
    return {
      totalMemories: this.memoryStore.size,
      totalUsage: totalUsage,
      averageUsage: totalUsage / Math.max(memories.length, 1),
      oldestMemory: memories.length > 0 ? Math.min(...memories.map(m => new Date(m.timestamp))) : null,
      newestMemory: memories.length > 0 ? Math.max(...memories.map(m => new Date(m.timestamp))) : null
    };
  }

  // Search memories by keyword (shared across all users for demo)
  searchMemories(query, userId = 'default', limit = 10) {
    // For demo system, search across ALL memories, not just user-specific
    const allMemories = Array.from(this.memoryStore.values());
    
    const queryWords = query.toLowerCase().split(/\s+/);
    
    const scoredMemories = allMemories.map(memory => {
      const memoryWords = memory.userMessage.toLowerCase().split(/\s+/);
      const commonWords = queryWords.filter(word => 
        memoryWords.includes(word) && word.length > 2
      );
      
      const score = commonWords.length / Math.max(queryWords.length, memoryWords.length);
      return { ...memory, score };
    });

    return scoredMemories
      .filter(memory => memory.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  // Export memories for backup
  exportMemories() {
    return Array.from(this.memoryStore.values());
  }

  // Import memories from backup
  importMemories(memories) {
    memories.forEach(memory => {
      if (memory.id && memory.userMessage && memory.aiResponse) {
        this.memoryStore.set(memory.id, memory);
      }
    });
    console.log(`Imported ${memories.length} memories`);
  }
}

export default MemoryService; 