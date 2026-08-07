import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { extractTimestamp } from "@/lib/data";
import { ObjectId } from "mongodb";

// GET /api/admin/articles
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const articles = await db.collection("articles").find({}).toArray();

    const mapped = articles
      .filter((a: any) => a && (a.title || a.slug))
      .map((a: any) => ({
        ...a,
        _id: a._id?.toString() || a.id || a.slug,
        id: a._id?.toString() || a.id || a.slug,
        slug: a.slug || `article-${Date.now()}`,
        timestamp: extractTimestamp(a),
      }));

    mapped.sort((a: any, b: any) => b.timestamp - a.timestamp);
    return NextResponse.json(mapped);
  } catch (error: any) {
    console.error("GET /api/admin/articles error STACK:", error?.stack || error);
    return NextResponse.json([]);
  }
}

// POST /api/admin/articles — Create single article document
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db();

    const slug = body.slug?.trim() || `article-${Date.now()}`;
    const doc = {
      ...body,
      slug,
      publishedAt: body.publishedAt || new Date().toISOString(),
      createdAt: body.createdAt || new Date().toISOString(),
      published: body.published !== false,
      status: body.status || "published",
    };

    const result = await db.collection("articles").insertOne(doc);
    const created = { ...doc, _id: result.insertedId.toString(), id: result.insertedId.toString() };
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/articles error:", error);
    return NextResponse.json({ error: "Failed to create article." }, { status: 500 });
  }
}

// PUT /api/admin/articles — Update single article document
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db();

    const { slug, _id, id, ...updateData } = body;
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
      return NextResponse.json({ error: "Valid _id or slug required for update." }, { status: 400 });
    }

    const result = await db.collection("articles").updateOne(
      { $or: conditions },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Article not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, ...body });
  } catch (error) {
    console.error("PUT /api/admin/articles error:", error);
    return NextResponse.json({ error: "Failed to update article." }, { status: 500 });
  }
}

// DELETE /api/admin/articles — Delete single article document
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { slug, _id, id } = body || {};
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
      console.warn("[DELETE /api/admin/articles] Rejected: missing target identifier");
      return NextResponse.json({ error: "Valid slug or ID is required for deletion." }, { status: 400 });
    }

    const query = { $or: conditions };
    const result = await db.collection("articles").deleteOne(query);
    console.log(`[DELETE /api/admin/articles] Deleted ${result.deletedCount} article document(s) matching:`, query);

    return NextResponse.json({ success: true, deletedCount: result.deletedCount });
  } catch (error: any) {
    console.error("DELETE /api/admin/articles error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete article." }, { status: 500 });
  }
}
