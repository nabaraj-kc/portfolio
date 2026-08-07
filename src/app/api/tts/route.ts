import { NextResponse } from "next/server";
import { EdgeTTS } from "node-edge-tts";
import fs from "fs";
import path from "path";
import os from "os";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const text = searchParams.get("text");
    const voice = searchParams.get("voice") || "en-US-AvaNeural";

    if (!text) {
      return new NextResponse("Text parameter is required", { status: 400 });
    }

    const tts = new EdgeTTS({
      voice: voice,
      lang: "en-US",
      outputFormat: "audio-24khz-48kbitrate-mono-mp3",
    });

    const tempFilePath = path.join(os.tmpdir(), `tts-${Date.now()}-${Math.random().toString(36).substring(7)}.mp3`);
    
    await tts.ttsPromise(text, tempFilePath);
    
    const audioBuffer = fs.readFileSync(tempFilePath);
    
    // Clean up
    fs.unlinkSync(tempFilePath);

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("TTS API Error:", error);
    return new NextResponse("Failed to generate speech", { status: 500 });
  }
}
