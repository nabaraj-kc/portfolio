// @ts-nocheck
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const messages = await db.collection("messages").find({}).sort({ _id: -1 }).toArray();
    return NextResponse.json(messages.map((m) => ({ ...m, _id: m._id.toString() })));
  } catch (error) {
    console.error(error);
    return NextResponse.json([]);
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    const client = await clientPromise;
    const db = client.db();
    
    await db.collection("messages").deleteOne({ id: id });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete message." }, { status: 500 });
  }
}

