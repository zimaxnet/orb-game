import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const uri = process.env.MONGO_URI || "mongodb://<account-name>:<primary-key>@<account-name>.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@<account-name>@";

// Create a MongoClient with Azure Cosmos DB specific configuration
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  tls: true,
  tlsAllowInvalidCertificates: false,
  // Remove deprecated options for Azure Cosmos DB compatibility
  // useUnifiedTopology: true,
  // useNewUrlParser: true,
});

async function testConnection() {
  try {
    console.log('🔌 Attempting to connect to Azure Cosmos DB for MongoDB...');
    console.log('📡 Connection string:', uri.replace(/\/\/.*@/, '//***:***@'));
    
    // Connect the client to the server
    await client.connect();
    console.log('✅ Client connected successfully');
    
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
    
    // Provide specific troubleshooting tips
    if (error.message.includes('authentication failed')) {
      console.log('\n💡 Authentication troubleshooting:');
      console.log('   - Check if the primary key is correct');
      console.log('   - Verify the account name in the connection string');
      console.log('   - Ensure the Cosmos DB account is active');
    } else if (error.message.includes('Command Hello not supported')) {
      console.log('\n💡 Azure Cosmos DB troubleshooting:');
      console.log('   - This error is common with Azure Cosmos DB');
      console.log('   - Try using the connection string from Azure Portal');
      console.log('   - Check if the Cosmos DB account supports MongoDB API');
    }
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
    console.log('🔌 Azure Cosmos DB connection closed');
  }
}

// Run the test
testConnection().catch(console.error); 