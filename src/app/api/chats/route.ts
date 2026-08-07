// @ts-nocheck
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Helper to retrieve user email from session cookie
async function getUserEmail(): Promise<string> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("user_session");
    if (session && session.value) {
      const user = JSON.parse(decodeURIComponent(session.value));
      return user.email || "guest";
    }
  } catch (e) {
    console.error("Error reading chat user session:", e);
  }
  return "guest";
}

// GET: Fetch saved chats for the logged-in user
export async function GET() {
  try {
    const email = await getUserEmail();
    const client = await clientPromise;
    const db = client.db();

    // Query chats belonging specifically to the logged-in user
    const chats = await db
      .collection("chats")
      .find({ userEmail: email })
      .sort({ updatedAt: -1 })
      .toArray();

    return NextResponse.json(
      chats.map((c: any) => ({
        ...c,
        _id: c._id.toString(),
      }))
    );
  } catch (error) {
    console.error("GET /api/chats failed:", error);
    return NextResponse.json([]);
  }
}

// POST: Save or Update a chat session
export async function POST(request: Request) {
  try {
    const { chatId, title, messages, model } = await request.json();
    const email = await getUserEmail();
    const client = await clientPromise;
    const db = client.db();

    const now = new Date();

    if (chatId) {
      // Update existing chat (must also match the user's email to prevent hijacking)
      await db.collection("chats").updateOne(
        { _id: new ObjectId(chatId), userEmail: email },
        {
          $set: {
            messages,
            updatedAt: now,
            model: model || "krrishmay-4o",
            ...(title ? { title } : {}),
          },
        }
      );
      return NextResponse.json({ success: true, chatId });
    } else {
      // Create new chat session linked to userEmail
      const chatTitle = title || (messages?.[0]?.content ? messages[0].content.slice(0, 32) + "..." : "New Chat");
      const result = await db.collection("chats").insertOne({
        title: chatTitle,
        messages: messages || [],
        model: model || "krrishmay-4o",
        userEmail: email,
        createdAt: now,
        updatedAt: now,
      });

      return NextResponse.json({ success: true, chatId: result.insertedId.toString() });
    }
  } catch (error) {
    console.error("POST /api/chats failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE: Remove a chat session
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get("chatId");
    if (!chatId) {
      return NextResponse.json({ error: "chatId is required" }, { status: 400 });
    }

    const email = await getUserEmail();
    const client = await clientPromise;
    const db = client.db();

    // Delete chat session (only if it belongs to the user)
    await db.collection("chats").deleteOne({
      _id: new ObjectId(chatId),
      userEmail: email,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/chats failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

