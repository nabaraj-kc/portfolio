import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import dns from "dns";

export async function GET() {
  try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
    const uri = process.env.MONGODB_URI as string;
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db();
    const settings = await db.collection("settings").findOne({});
    await client.close();
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
