import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const uri = process.env.MONGO_URI || "mongodb://<account-name>:<primary-key>@<account-name>.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@<account-name>@";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  tls: true,
  tlsAllowInvalidCertificates: false,
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

async function testConnection() {
  try {
    console.log('🔌 Attempting to connect to Azure Cosmos DB for MongoDB...');
    
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();
    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Successfully connected to Azure Cosmos DB for MongoDB!");
    
    // Test database access
      const db = client.db('orbgame');
  console.log('✅ Database "orbgame" accessible');
    
    // List collections to verify access
    const collections = await db.listCollections().toArray();
    console.log('📋 Available collections:', collections.map(c => c.name));
    
    // Test basic operations
    const testCollection = db.collection('test_connection');
    await testCollection.insertOne({ 
      test: true, 
      timestamp: new Date().toISOString(),
      message: 'Connection test successful'
    });
    console.log('✅ Write operation successful');
    
    const result = await testCollection.findOne({ test: true });
    console.log('✅ Read operation successful');
    
    // Clean up test data
    await testCollection.deleteOne({ test: true });
    console.log('✅ Cleanup operation successful');
    
  } catch (error) {
    console.error('❌ Azure Cosmos DB connection test failed:', error.message);
    console.error('Error details:', error);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
    console.log('🔌 Azure Cosmos DB connection closed');
  }
}

// Run the test
testConnection().catch(console.error); 