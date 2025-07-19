import { MongoClient } from 'mongodb';

class Profile {
  constructor(data = {}) {
    this.name = data.name || '';
    this.age = data.age || null;
    this.interests = data.interests || [];
    this.home = data.home || '';
    this.occupation = data.occupation || '';
    this.conversation_preferences = data.conversation_preferences || [];
  }

  toString() {
    return JSON.stringify(this);
  }
}

class Memory {
  constructor(data = {}) {
    this.id = data.id || Date.now().toString();
    this.created_at = data.created_at || new Date().toISOString();
    this.context = data.context || '';
    this.category = data.category || '';
    this.content = data.content || '';
    this.superseded_ids = data.superseded_ids || [];
  }

  toString() {
    return JSON.stringify(this);
  }
}

class AgentExperience {
  constructor(data = {}) {
    this.procedural_knowledge = data.procedural_knowledge || '';
    this.common_scenarios = data.common_scenarios || [];
    this.effective_strategies = data.effective_strategies || [];
    this.known_pitfalls = data.known_pitfalls || [];
    this.tool_patterns = data.tool_patterns || [];
    this.heuristics = data.heuristics || [];
    this.user_feedback = data.user_feedback || [];
    this.improvement_areas = data.improvement_areas || [];
  }

  toString() {
    return JSON.stringify(this);
  }
}

class AdvancedMemoryService {
  constructor(mongoUri, dbName = 'aimcs') {
    this.mongoUri = mongoUri;
    this.dbName = dbName;
    this.client = null;
    this.db = null;
    this.users = null;
    this.agents = null;
    this.tasks = null;
  }

  async initialize() {
    try {
          // Initialize MongoDB client with correct TLS options for Atlas
    this.client = new MongoClient(this.mongoUri, {
      tls: true,
      tlsAllowInvalidCertificates: false,
      // Remove deprecated options for MongoDB 3.6 compatibility
      // useUnifiedTopology: true,
      // useNewUrlParser: true,
    });
      await this.client.connect();
      this.db = this.client.db(this.dbName);
      this.users = this.db.collection('users');
      this.agents = this.db.collection('agents');
      this.tasks = this.db.collection('tasks');
      
      // Create text index for memory search
      try {
        await this.users.createIndex({ "memories.content": "text" });
        console.log('✅ Text index created for memory search');
      } catch (indexError) {
        console.warn('⚠️ Text index creation failed (may already exist):', indexError.message);
      }
      
      console.log('✅ MongoDB Atlas connected successfully');
    } catch (error) {
      console.error('❌ MongoDB Atlas connection failed:', error.message);
      throw error;
    }
  }

  async connect() {
    await this.initialize();
  }

  async close() {
    await this.client.close();
  }

  // Methods for updating and retrieving profiles, memories, etc.
  async updateUserProfile(userId, profileData) {
    const profile = new Profile(profileData);
    await this.users.updateOne({ userId }, { $set: { profile: profile } }, { upsert: true });
  }

  async getRelevantMemories(query, limit = 5) {
    try {
      // Search for users with memories containing the query
      const users = await this.users.find({
        "memories.content": { $regex: query, $options: 'i' }
      }).limit(limit).toArray();
      
      const memories = [];
      users.forEach(user => {
        if (user.memories) {
          user.memories.forEach(memory => {
            if (memory.content && memory.content.toLowerCase().includes(query.toLowerCase())) {
              memories.push({
                id: memory.id,
                content: memory.content,
                created_at: memory.created_at
              });
            }
          });
        }
      });
      
      return memories.slice(0, limit);
    } catch (error) {
      console.warn('Memory search failed:', error.message);
      return [];
    }
  }

  async storeMemory(userId, content, context = '', category = 'general') {
    try {
      const memory = new Memory({
        context,
        category,
        content
      });
      
      await this.users.updateOne(
        { userId },
        { 
          $push: { memories: memory },
          $set: { lastUpdated: new Date().toISOString() }
        },
        { upsert: true }
      );
      
      return memory;
    } catch (error) {
      console.error('Failed to store memory:', error.message);
      throw error;
    }
  }

  async getUserProfile(userId) {
    try {
      const user = await this.users.findOne({ userId });
      return user?.profile || new Profile();
    } catch (error) {
      console.warn('Failed to get user profile:', error.message);
      return new Profile();
    }
  }
}

export default AdvancedMemoryService; 