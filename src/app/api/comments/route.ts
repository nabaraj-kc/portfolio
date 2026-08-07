import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get("pageId");

    if (!pageId) {
      return NextResponse.json({ error: "pageId parameter is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const comments = await db
      .collection("comments")
      .find({ pageId })
      .sort({ createdAt: 1 })
      .toArray();

    return NextResponse.json(
      comments.map((c: any) => ({
        id: c._id.toString(),
        author: c.author,
        text: c.text,
        date: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "Just now",
      }))
    );
  } catch (error) {
    console.error("Comments GET failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pageId, author, text } = body;

    if (!pageId || !text) {
      return NextResponse.json({ error: "pageId and text are required" }, { status: 400 });
    }

    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("user_session");
    let authorEmail = "guest";
    if (sessionCookie && sessionCookie.value) {
      try {
        const user = JSON.parse(decodeURIComponent(sessionCookie.value));
        authorEmail = user.email || "guest";
      } catch (e) {
        console.error("Failed parsing comment session:", e);
      }
    }

    const client = await clientPromise;
    const db = client.db();
    
    const newComment = {
      pageId,
      author: author || "Anonymous Reader",
      authorEmail,
      text,
      createdAt: new Date(),
    };

    await db.collection("comments").insertOne(newComment);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Comments POST failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
