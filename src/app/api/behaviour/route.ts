import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { event, pageId, title, email, details } = body;

    if (!event) {
      return NextResponse.json({ error: "event field is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const behaviourLog = {
      event,
      pageId: pageId || "unknown",
      title: title || "",
      email: email || "anonymous",
      details: details || {},
      timestamp: new Date(),
    };

    await db.collection("behaviour").insertOne(behaviourLog);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Behaviour POST failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
