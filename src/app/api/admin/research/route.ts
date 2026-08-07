import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { extractTimestamp, formatExactPublishTime } from "@/lib/data";
import { ObjectId } from "mongodb";

// GET /api/admin/research
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    // Fetch all items from research collection
    const items = await db.collection("research").find({}).toArray();
    
    let papersList: any[] = [];
    let focusAreasList: any[] = [];

    for (const item of items) {
      if (item.focusAreas && Array.isArray(item.focusAreas)) {
        focusAreasList.push(...item.focusAreas);
      }
      if (item.papers && Array.isArray(item.papers)) {
        // Legacy papers array
        for (const p of item.papers) {
          papersList.push({
            ...p,
            _id: p._id?.toString() || p.id || p.slug,
            id: p.id || p.slug || p._id?.toString(),
            slug: p.slug || p.id,
            title: p.title,
            tag: p.tag || p.conference || "AI Research Specification",
            abstract: p.abstract || p.excerpt || p.content || "",
            publishedAt: p.publishedAt || item.publishedAt,
            createdAt: p.createdAt || item.createdAt,
            date: p.date || item.date || "2026",
            author: p.author || "Nabaraj KC",
          });
        }
      } else if (item.title || item.slug) {
        // Individual paper document
        papersList.push({
          ...item,
          _id: item._id?.toString(),
          id: item._id?.toString() || item.id || item.slug,
          slug: item.slug || item.id,
          title: item.title,
          conference: item.conference || item.tag || "AI Research Specification",
          tag: item.tag || item.conference || "AI Research Specification",
          year: item.year || item.date || "2026",
          abstract: item.abstract || item.excerpt || item.content || "",
          excerpt: item.excerpt || item.abstract || "",
          tags: item.tags || item.keywords || [],
          publishedAt: item.publishedAt,
          createdAt: item.createdAt,
          date: item.date,
          coverImage: item.coverImage,
          generatedBy: item.generatedBy || "autonomous-ai",
          requestedBy: item.requestedBy,
          wordCount: item.wordCount,
          author: item.author || "Nabaraj KC",
        });
      }
    }

    const mappedPapers = papersList.map((p) => ({
      ...p,
      formattedPublishTime: formatExactPublishTime(p),
      timestamp: extractTimestamp(p),
    }));

    mappedPapers.sort((a, b) => b.timestamp - a.timestamp);

    return NextResponse.json({
      papers: mappedPapers,
      focusAreas: focusAreasList,
    });
  } catch (error) {
    console.error("GET /api/admin/research error:", error);
    return NextResponse.json({ papers: [], focusAreas: [] });
  }
}

// POST /api/admin/research — Insert single research paper or focus area
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db();

    // If payload is single paper or item
    const paperPayload = body.type === "paper" && body.item ? body.item : body;
    
    if (paperPayload.title || paperPayload.slug) {
      const slug = paperPayload.slug?.trim() || `research-${Date.now()}`;
      const doc = {
        ...paperPayload,
        slug,
        conference: paperPayload.conference || paperPayload.tag || "AI Research Specification",
        tag: paperPayload.tag || paperPayload.conference || "AI Research Specification",
        year: paperPayload.year || paperPayload.date || "2026",
        publishedAt: paperPayload.publishedAt || new Date().toISOString(),
        createdAt: paperPayload.createdAt || new Date().toISOString(),
        published: true,
        status: "published",
      };

      const result = await db.collection("research").insertOne(doc);
      const created = { ...doc, _id: result.insertedId.toString(), id: result.insertedId.toString() };
      return NextResponse.json(created, { status: 201 });
    }

    // Focus area legacy handling
    if (body.type === "area" && body.item) {
      const configDoc = (await db.collection("research").findOne({ focusAreas: { $exists: true } })) || {};
      const focusAreas = configDoc.focusAreas || [];
      const newArea = { ...body.item, id: body.item.id || Date.now().toString() };
      focusAreas.unshift(newArea);

      await db.collection("research").updateOne(
        { focusAreas: { $exists: true } },
        { $set: { focusAreas } },
        { upsert: true }
      );
      return NextResponse.json({ success: true, area: newArea }, { status: 201 });
    }

    return NextResponse.json({ error: "Title or slug required for research paper." }, { status: 400 });
  } catch (error) {
    console.error("POST /api/admin/research error:", error);
    return NextResponse.json({ error: "Failed to add research item." }, { status: 500 });
  }
}

// PUT /api/admin/research — Update single research paper document
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db();

    const { _id, id, slug, ...updateData } = body;
    const targetId = _id || id;

    const conditions: any[] = [];
    if (targetId) {
      const cleanId = String(targetId).trim();
      conditions.push({ _id: cleanId });
      conditions.push({ id: cleanId });
      conditions.push({ slug: cleanId });
      if (ObjectId.isValid(cleanId)) {
        conditions.push({ _id: new ObjectId(cleanId) });
      }
    }
    if (slug && typeof slug === "string" && slug.trim().length > 0) {
      conditions.push({ slug: slug.trim() });
    }

    if (conditions.length === 0) {
      return NextResponse.json({ error: "Valid _id, id or slug required for update." }, { status: 400 });
    }

    const result = await db.collection("research").updateOne(
      { $or: conditions },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Research paper not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, ...body });
  } catch (error) {
    console.error("PUT /api/admin/research error:", error);
    return NextResponse.json({ error: "Failed to update research data." }, { status: 500 });
  }
}

// DELETE /api/admin/research — Delete single research paper document
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id, slug, _id } = body || {};
    const targetId = _id || id;

    const client = await clientPromise;
    const db = client.db();

    const conditions: any[] = [];
    if (targetId) {
      const cleanId = String(targetId).trim();
      conditions.push({ _id: cleanId });
      conditions.push({ id: cleanId });
      conditions.push({ slug: cleanId });
      if (ObjectId.isValid(cleanId)) {
        conditions.push({ _id: new ObjectId(cleanId) });
      }
    }
    if (slug && typeof slug === "string" && slug.trim().length > 0) {
      conditions.push({ slug: slug.trim() });
    }

    if (conditions.length === 0) {
      console.warn("[DELETE /api/admin/research] Rejected: missing target identifier");
      return NextResponse.json({ error: "Valid ID or slug required for deletion." }, { status: 400 });
    }

    const query = { $or: conditions };

    // Delete single document matching query
    const result = await db.collection("research").deleteOne(query);
    console.log(`[DELETE /api/admin/research] Deleted ${result.deletedCount} research document(s) matching:`, query);

    // Also pull paper from legacy container arrays if present
    const pullKey = targetId || slug;
    if (pullKey) {
      await db.collection("research").updateMany(
        { papers: { $elemMatch: { $or: [{ id: pullKey }, { slug: pullKey }] } } },
        { $pull: { papers: { $or: [{ id: pullKey }, { slug: pullKey }] } } } as any
      );
    }

    return NextResponse.json({ success: true, deletedCount: result.deletedCount });
  } catch (error: any) {
    console.error("DELETE /api/admin/research error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete research item." }, { status: 500 });
  }
}
