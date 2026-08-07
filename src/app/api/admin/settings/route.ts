import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const settings = await db.collection("settings").findOne({});
    if (settings) {
      return NextResponse.json({ ...settings, _id: settings._id.toString() });
    }
    return NextResponse.json({});
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to read settings." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db();
    
    const { _id, ...updateData } = body;
    // Update the single settings document (upsert if it doesn't exist)
    await db.collection("settings").updateOne(
      {}, 
      { $set: updateData },
      { upsert: true }
    );
    return NextResponse.json(body);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update settings." }, { status: 500 });
  }
}
