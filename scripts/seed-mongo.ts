import { MongoClient } from "mongodb";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function seed() {
  console.log("Starting data seeding to MongoDB...");
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("No MONGODB_URI");
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();

  const dataDir = path.join(process.cwd(), "data");

  const files = [
    { name: "projects", file: "projects.json" },
    { name: "articles", file: "articles.json" },
    { name: "experience", file: "experience.json" },
    { name: "research", file: "research.json" },
    { name: "lab", file: "lab.json" },
    { name: "settings", file: "settings.json" },
    { name: "messages", file: "messages.json" },
    { name: "aiconfig", file: "ai-config.json" },
  ];

  for (const item of files) {
    const filePath = path.join(dataDir, item.file);
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      
      const collection = db.collection(item.name);
      
      // Clear existing
      await collection.deleteMany({});
      
      // Insert
      if (Array.isArray(data)) {
        if (data.length > 0) {
          await collection.insertMany(data);
          console.log(`✅ Seeded ${data.length} items into ${item.name} collection.`);
        } else {
          console.log(`⚠️ ${item.file} is empty.`);
        }
      } else {
        // It's a single object (like settings.json)
        await collection.insertOne(data);
        console.log(`✅ Seeded document into ${item.name} collection.`);
      }
    } else {
      console.log(`❌ File not found: ${item.file}`);
    }
  }

  console.log("🎉 Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Failed to seed data:", err);
  process.exit(1);
});
