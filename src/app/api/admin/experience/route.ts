// @ts-nocheck
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const items = await db.collection("experience").find({}).sort({ _id: -1 }).toArray();
    return NextResponse.json(items.map((e) => ({ ...e, _id: e._id.toString() })));
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
    
    await db.collection("experience").insertOne(newItem);
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create entry." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db();
    
    const { id, _id, ...updateData } = body;
    const result = await db.collection("experience").updateOne(
      { id: id },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) return NextResponse.json({ error: "Not found." }, { status: 404 });
    return NextResponse.json(body);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update entry." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    const client = await clientPromise;
    const db = client.db();
    
    await db.collection("experience").deleteOne({ id: id });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete entry." }, { status: 500 });
  }
}

