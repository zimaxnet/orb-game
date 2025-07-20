const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = "mongodb+srv://derek:yFlZ76aFaPRBD1rO@orbgame-cluster.rpcaamg.mongodb.net/?retryWrites=true&w=majority&appName=OrbGame-Cluster";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    
    // Check different possible database names
    const dbNames = ["orbgame", "test", "development", "production"];
    
    for (const dbName of dbNames) {
      console.log(`\n=== Checking database: ${dbName} ===`);
      const db = client.db(dbName);
      
      // List all collections
      const collections = await db.listCollections().toArray();
      console.log("Collections:", collections.map(c => c.name));
      
      if (collections.length > 0) {
        for (const collection of collections) {
          const coll = db.collection(collection.name);
          const count = await coll.countDocuments();
          console.log(`  ${collection.name}: ${count} documents`);
          
          if (count > 0) {
            const sample = await coll.find({}).limit(1).toArray();
            console.log(`  Sample document:`, JSON.stringify(sample[0], null, 2));
          }
        }
      }
    }

  } finally {
    await client.close();
  }
}
run().catch(console.dir); 