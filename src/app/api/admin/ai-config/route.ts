import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const config = await db.collection("aiconfig").findOne({});
    if (config) {
      return NextResponse.json({ ...config, _id: config._id.toString() });
    }
    
    // Return a fallback default configuration if the database is empty
    return NextResponse.json({
      systemName: "O AI OS / Krrishmay Assistant",
      subdomain: "krrishmay.nabarajkc.com.np",
      status: "ONLINE",
      activeAgents: 108,
      systemPrompt: "You are Krrishmay, an autonomous AI assistant powered by the O AI operating system developed by Nabaraj KC.",
      hardwareHooks: {
        cpuMonitoring: true,
        gpuBoost: true,
        audioStream: true,
        cameraFeed: true,
        arduinoSerial: true,
      },
      primaryModel: "O-Swarm-v2 (DeepSeek / Gemini Hybrid)",
      maxTokens: 4096,
      temperature: 0.7,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to read AI config." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db();
    
    const { _id, ...updateData } = body;
    await db.collection("aiconfig").updateOne(
      {},
      { $set: updateData },
      { upsert: true }
    );
    return NextResponse.json(body);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update AI config." }, { status: 500 });
  }
}
