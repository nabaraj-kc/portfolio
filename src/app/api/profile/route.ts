import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import clientPromise from "@/lib/mongodb";

// Dynamically resolve parent domain for sharing sessions across subdomains
function getCookieDomain(request: Request): string | undefined {
  const host = request.headers.get("host") || "";
  const hostname = host.split(":")[0];
  if (hostname === "localhost" || hostname.endsWith(".localhost")) {
    return ".localhost";
  }
  const parts = hostname.split(".");
  if (parts.length >= 2) {
    const isDoubleExtension = hostname.endsWith(".com.np") || hostname.endsWith(".co.uk") || hostname.endsWith(".org.np");
    const dotCount = isDoubleExtension ? 3 : 2;
    if (parts.length >= dotCount) {
      return "." + parts.slice(-dotCount).join(".");
    }
  }
  return undefined;
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("user_session");
    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let user;
    try {
      user = JSON.parse(decodeURIComponent(sessionCookie.value));
    } catch (e) {
      return NextResponse.json({ error: "Invalid session" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // 1. Fetch user comments
    const comments = await db
      .collection("comments")
      .find({ authorEmail: user.email })
      .sort({ createdAt: -1 })
      .toArray();

    // 2. Fetch user likes
    const likes = await db
      .collection("likes")
      .find({ email: user.email })
      .sort({ createdAt: -1 })
      .toArray();

    // 3. Fetch user chats count or chats list
    const chats = await db
      .collection("chats")
      .find({ userEmail: user.email })
      .sort({ updatedAt: -1 })
      .toArray();

    return NextResponse.json({
      comments: comments.map((c: any) => ({
        id: c._id.toString(),
        pageId: c.pageId,
        text: c.text,
        createdAt: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "Just now"
      })),
      likes: likes.map((l: any) => ({
        pageId: l.pageId,
        createdAt: l.createdAt ? new Date(l.createdAt).toLocaleDateString() : "Just now"
      })),
      chats: chats.map((ch: any) => ({
        id: ch._id.toString(),
        title: ch.title,
        updatedAt: ch.updatedAt ? new Date(ch.updatedAt).toLocaleDateString() : "Just now"
      })),
    });
  } catch (error) {
    console.error("Profile GET Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("user_session");
    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let user;
    try {
      user = JSON.parse(decodeURIComponent(sessionCookie.value));
    } catch (e) {
      return NextResponse.json({ error: "Invalid session" }, { status: 400 });
    }

    const { username, picture } = await request.json();
    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection("users");

    // Update MongoDB profile
    await usersCollection.updateOne(
      { email: user.email },
      {
        $set: {
          username,
          ...(picture ? { picture } : {}),
          updatedAt: new Date(),
        },
      }
    );

    // Update active cookie session
    const updatedPayload = {
      ...user,
      username,
      ...(picture ? { picture } : {}),
    };

    const domain = getCookieDomain(request);

    cookieStore.set({
      name: "user_session",
      value: JSON.stringify(updatedPayload),
      domain,
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return NextResponse.json({ success: true, user: updatedPayload });
  } catch (error) {
    console.error("Profile API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
