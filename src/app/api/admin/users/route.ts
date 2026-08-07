import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { cookies } from "next/headers";

async function checkAdmin() {
  const cookieStore = await cookies();
  // admin_session is set by /api/admin/login — must match exactly
  const token = cookieStore.get("admin_session")?.value;
  return token === (process.env.ADMIN_SESSION_TOKEN || "nkc-admin-secret-2026");
}

export async function GET() {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const client = await clientPromise;
    const db = client.db();

    const [users, comments, likes, chats, behaviours] = await Promise.all([
      db.collection("users").find({}).sort({ createdAt: -1 }).toArray(),
      db.collection("comments").find({}).toArray(),
      db.collection("likes").find({}).toArray(),
      db.collection("chats").find({}).toArray(),
      db.collection("behaviour").find({}).toArray(),
    ]);

    const enriched = users.map((u: any) => {
      const email = u.email;
      const userComments = comments.filter((c: any) => c.userEmail === email);
      const userLikes = likes.filter((l: any) => l.userEmail === email);
      const userChats = chats.filter((c: any) => c.userEmail === email);
      const userViews = behaviours.filter((b: any) => b.userEmail === email);

      return {
        _id: u._id.toString(),
        email,
        // Google auth saves field as 'username', email auth may use 'name' or 'displayName'
        name: u.username || u.name || u.displayName || "Anonymous",
        // Google auth saves picture, email auth saves avatar
        avatar: u.picture || u.avatar || null,
        provider: u.provider || (u.googleId ? "google" : "email"),
        registeredAt: u.createdAt || u.registeredAt,
        lastLoginAt: u.lastLoginAt,
        commentsCount: userComments.length,
        likesCount: userLikes.length,
        chatsCount: userChats.length,
        viewsCount: userViews.length,
        recentActivity: [
          ...userComments.slice(-2).map((c: any) => ({ type: "comment", text: c.text?.slice(0, 50), date: c.createdAt })),
          ...userLikes.slice(-2).map((l: any) => ({ type: "like", text: l.pageId, date: l.createdAt })),
          ...userChats.slice(-2).map((c: any) => ({ type: "chat", text: c.title?.slice(0, 50), date: c.updatedAt })),
        ].sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()).slice(0, 5),
      };
    });

    return NextResponse.json(enriched);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
