import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { cookies } from "next/headers";

async function checkAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin-token")?.value;
  return token === process.env.ADMIN_SESSION_TOKEN;
}

export async function GET() {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const client = await clientPromise;
    const db = client.db();
    const keys = await db.collection("apikeys").find({}).toArray();
    // Mask values - only show last 6 chars
    return NextResponse.json(keys.map((k: any) => ({
      _id: k._id.toString(),
      name: k.name,
      label: k.label || k.name,
      maskedValue: k.value ? `${"*".repeat(Math.max(0, k.value.length - 6))}${k.value.slice(-6)}` : "",
      updatedAt: k.updatedAt,
    })));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch API keys" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { name, label, value } = await request.json();
    if (!name || !value) {
      return NextResponse.json({ error: "name and value are required" }, { status: 400 });
    }
    const client = await clientPromise;
    const db = client.db();
    await db.collection("apikeys").updateOne(
      { name },
      { $set: { name, label: label || name, value, updatedAt: new Date().toISOString() } },
      { upsert: true }
    );
    return NextResponse.json({ success: true, message: `API key "${name}" saved.` });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to save API key" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { name } = await request.json();
    const client = await clientPromise;
    const db = client.db();
    await db.collection("apikeys").deleteOne({ name });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete API key" }, { status: 500 });
  }
}
