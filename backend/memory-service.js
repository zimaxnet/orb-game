// AIMCS Memory Service
// Handles storage and retrieval of chat completions for memory/context

class MemoryService {
  constructor() {
    this.memoryStore = new Map(); // In-memory storage (can be replaced with database)
    this.maxMemorySize = 1000; // Maximum number of stored completions
    this.similarityThreshold = 0.8; // Threshold for considering queries similar
  }

  // Generate a memory key from user message
  generateMemoryKey(message, userId = 'default') {
    const cleanMessage = message.toLowerCase().trim();
    return `${userId}:${this.hashString(cleanMessage)}`;
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

  // Store a completion in memory
  async storeCompletion(userMessage, aiResponse, metadata = {}) {
    try {
      const memoryKey = this.generateMemoryKey(userMessage, metadata.userId);
      
      const memoryEntry = {
        id: memoryKey,
        userMessage: userMessage,
        aiResponse: aiResponse,
        timestamp: new Date().toISOString(),
        metadata: {
          ...metadata,
          searchUsed: metadata.searchUsed || false,
          audioGenerated: metadata.audioGenerated || false,
          model: metadata.model || 'gpt-4o-mini',
          tokens: metadata.tokens || 0
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

  // Retrieve a completion from memory
  async retrieveCompletion(userMessage, userId = 'default') {
    try {
      const memoryKey = this.generateMemoryKey(userMessage, userId);
      const exactMatch = this.memoryStore.get(memoryKey);
      
      if (exactMatch) {
        // Update usage stats
        exactMatch.usageCount += 1;
        exactMatch.lastUsed = new Date().toISOString();
        console.log(`Memory hit (exact): ${memoryKey}`);
        return exactMatch;
      }

      // Try fuzzy matching for similar queries
      const fuzzyMatch = this.findSimilarMemory(userMessage, userId);
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

  // Find similar memories using simple keyword matching
  findSimilarMemory(userMessage, userId = 'default') {
    const userMemories = Array.from(this.memoryStore.values())
      .filter(memory => memory.metadata.userId === userId)
      .sort((a, b) => b.usageCount - a.usageCount); // Sort by usage

    const userWords = userMessage.toLowerCase().split(/\s+/);
    
    for (const memory of userMemories) {
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

  // Search memories by keyword
  searchMemories(query, userId = 'default', limit = 10) {
    const userMemories = Array.from(this.memoryStore.values())
      .filter(memory => memory.metadata.userId === userId);
    
    const queryWords = query.toLowerCase().split(/\s+/);
    
    const scoredMemories = userMemories.map(memory => {
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