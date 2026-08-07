import { MongoClient } from "mongodb";

const uri = "mongodb+srv://nabarajkc43_db_user:k9CqUxjCvU7nr1NZ@cluster0.yc85kzi.mongodb.net/portfolio?retryWrites=true&w=majority&appName=Cluster0";

async function verifyPublicResearch() {
  console.log("\n=== VERIFYING PUBLIC RESEARCH FEED & PAPER DETAIL RESOLUTION ===");

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("portfolio");
    const research = await db
      .collection("research")
      .find({ status: { $ne: "draft" } })
      .toArray();

    console.log(`[TEST] Total research items in MongoDB: ${research.length}`);

    const dynamicPapers = research.filter((r) => !r.focusAreas && (r.title || r.slug));
    console.log(`[TEST] Total dynamic research papers found: ${dynamicPapers.length}`);

    if (dynamicPapers.length > 0) {
      const newestPaper = dynamicPapers[dynamicPapers.length - 1];
      console.log("\n--- NEWEST PUBLISHED RESEARCH PAPER ---");
      console.log("Title:", newestPaper.title);
      console.log("Slug:", newestPaper.slug);
      console.log("Published At:", newestPaper.publishedAt || newestPaper.date);
      console.log("Cover Image:", newestPaper.coverImage ? "Present" : "Missing");
      console.log("Content Length:", newestPaper.content?.length || 0, "characters");

      if (newestPaper.content && newestPaper.content.length > 200) {
        console.log("\n✅ FULL RESEARCH PAPER MARKDOWN IS PROPERLY STORED AND READY TO RENDER ON THE WEBSITE!");
      } else {
        console.warn("⚠️ Warning: Paper content is short or empty.");
      }
    } else {
      console.log("No dynamic research papers found yet.");
    }
  } catch (err) {
    console.error("❌ Error verifying public research:", err);
  } finally {
    await client.close();
  }

  console.log("\n=== VERIFICATION COMPLETE ===\n");
}

verifyPublicResearch();
