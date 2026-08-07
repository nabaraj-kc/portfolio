// @ts-nocheck
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const projects = await db.collection("projects").find({}).sort({ _id: -1 }).toArray();
    return NextResponse.json(projects.map((p) => ({ ...p, _id: p._id.toString() })));
  } catch (error) {
    console.error(error);
    // Return empty array (not 500) so the frontend doesn't crash with .map() errors
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db();
    const newProject = { ...body, id: body.id || Date.now().toString() };
    await db.collection("projects").insertOne(newProject);
    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create project." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db();
    
    // We use the string 'id' field that was created in the old json setup
    const { id, _id, ...updateData } = body; 
    const result = await db.collection("projects").updateOne(
      { id: id },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) return NextResponse.json({ error: "Not found." }, { status: 404 });
    return NextResponse.json(body);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update project." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    const client = await clientPromise;
    const db = client.db();
    
    await db.collection("projects").deleteOne({ id: id });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete project." }, { status: 500 });
  }
}

