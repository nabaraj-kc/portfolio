// @ts-nocheck
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const lab = await db.collection("lab").find({}).sort({ _id: -1 }).toArray();
    return NextResponse.json(lab.map((l) => ({ ...l, _id: l._id.toString() })));
  } catch (error) {
    console.error(error);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db();
    const newItem = { ...body, id: body.id || Date.now().toString() };
    
    await db.collection("lab").insertOne(newItem);
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create lab prototype." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db();
    
    const { id, _id, ...updateData } = body;
    const result = await db.collection("lab").updateOne(
      { id: id },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) return NextResponse.json({ error: "Not found." }, { status: 404 });
    return NextResponse.json(body);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update lab prototype." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    const client = await clientPromise;
    const db = client.db();
    
    await db.collection("lab").deleteOne({ id: id });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete lab prototype." }, { status: 500 });
  }
}

