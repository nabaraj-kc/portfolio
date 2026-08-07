import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get("pageId");
    const email = searchParams.get("email");

    if (!pageId) {
      return NextResponse.json({ error: "pageId is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const count = await db.collection("likes").countDocuments({ pageId });
    
    let hasLiked = false;
    if (email) {
      const userLike = await db.collection("likes").findOne({ pageId, email });
      hasLiked = !!userLike;
    }

    return NextResponse.json({ count, hasLiked });
  } catch (error) {
    console.error("Likes GET failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pageId, email } = body;

    if (!pageId) {
      return NextResponse.json({ error: "pageId is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Use a fallback identifier if not logged in
    const userIdentifier = email || "anonymous-guest";

    const existingLike = await db.collection("likes").findOne({ pageId, email: userIdentifier });

    if (existingLike) {
      await db.collection("likes").deleteOne({ pageId, email: userIdentifier });
    } else {
      await db.collection("likes").insertOne({
        pageId,
        email: userIdentifier,
        createdAt: new Date(),
      });
    }

    const count = await db.collection("likes").countDocuments({ pageId });
    const hasLiked = !existingLike;

    return NextResponse.json({ count, hasLiked });
  } catch (error) {
    console.error("Likes POST failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
