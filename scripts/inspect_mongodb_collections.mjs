import { MongoClient } from "mongodb";

const uri = "mongodb+srv://nabarajkc43_db_user:k9CqUxjCvU7nr1NZ@cluster0.yc85kzi.mongodb.net/portfolio?retryWrites=true&w=majority&appName=Cluster0";

async function inspectDB() {
  console.log("\n=== INSPECTING MONGODB COLLECTIONS ===");
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("portfolio");
    const collections = await db.listCollections().toArray();
    console.log("Collections in 'portfolio' DB:", collections.map(c => c.name));

    for (const c of collections) {
      const count = await db.collection(c.name).countDocuments();
      console.log(`- Collection '${c.name}': ${count} documents`);
      if (count > 0 && (c.name.includes("research") || c.name.includes("paper") || c.name.includes("article"))) {
        const samples = await db.collection(c.name).find({}).limit(2).toArray();
        console.log(`  Sample titles from '${c.name}':`, samples.map(s => s.title || s.name || s.slug || s._id));
      }
    }
  } catch (err) {
    console.error("MongoDB Inspection Error:", err.message);
  } finally {
    await client.close();
  }

  console.log("\n=== INSPECTION COMPLETE ===\n");
}

inspectDB();
