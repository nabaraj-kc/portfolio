import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { discoverTrendingTopic, deepResearchTopic } from "@/lib/rag-engine";
import { generateAndUploadCoverImage } from "@/lib/firebase-storage";
import { shortenTitle } from "@/lib/title-utils";
import {
  getAutonomousOutlinePrompt,
  getAutonomousWriterPrompt,
  getAutonomousEditorPrompt,
} from "@/lib/ai-prompts";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

function getKathmanduTimeInfo() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kathmandu",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(now);
  let hour = "00", minute = "00", year = "", month = "", day = "";
  parts.forEach((p) => {
    if (p.type === "hour") hour = p.value;
    if (p.type === "minute") minute = p.value;
    if (p.type === "year") year = p.value;
    if (p.type === "month") month = p.value;
    if (p.type === "day") day = p.value;
  });
  if (hour === "24") hour = "00";
  const currentHHMM = `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
  const currentDateStr = `${year}-${month}-${day}`;
  return { currentHHMM, currentDateStr, nowIso: now.toISOString() };
}

// ── Minimal inline LLM helpers ──────────────────────────────────────────────

async function llmGenerate(prompt: string, db: any): Promise<string> {
  const getApiKey = async (name: string, envKey: string) => {
    try {
      const record = await db.collection("apikeys").findOne({ name });
      return record?.value || process.env[envKey] || "";
    } catch {
      return process.env[envKey] || "";
    }
  };

  const mistralKey    = await getApiKey("Mistral",    "MISTRAL_API_KEY");
  const geminiKey     = await getApiKey("Gemini",     "GEMINI_API_KEY");
  const openrouterKey = await getApiKey("OpenRouter", "OPENROUTER_API_KEY");

  const errors: string[] = [];

  // ── 1. Mistral (primary — verified working key) ───────────────────────────
  if (mistralKey) {
    for (const model of ["mistral-small-latest", "open-mistral-7b", "mistral-medium-latest"]) {
      try {
        console.log(`[Cron LLM] Trying Mistral: ${model}`);
        const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization:  `Bearer ${mistralKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [{ role: "user", content: prompt }],
            max_tokens: 3000,
            temperature: 0.7,
          }),
        });
        if (res.status === 429) { console.warn(`[Cron LLM] Mistral ${model} rate-limited`); continue; }
        if (!res.ok) {
          const e = await res.text();
          console.error(`[Cron LLM] Mistral ${model} ${res.status}:`, e.slice(0, 180));
          errors.push(`mistral/${model}: HTTP ${res.status}`);
          break; // Non-429 error — skip other Mistral models
        }
        const d    = await res.json();
        const text = d.choices?.[0]?.message?.content;
        if (text) { console.log(`[Cron LLM] ✅ Mistral ${model} OK`); return text; }
      } catch (e: any) {
        console.error(`[Cron LLM] Mistral ${model} threw:`, e.message);
        errors.push(`mistral/${model}: ${e.message}`);
      }
    }
  }

  // ── 2. OpenRouter FREE tier (no credits needed) ───────────────────────────
  if (openrouterKey) {
    const freeModels = [
      "google/gemma-3-27b-it:free",
      "google/gemma-4-31b-it:free",
      "meta-llama/llama-3.1-8b-instruct:free",
      "mistralai/mistral-7b-instruct:free",
    ];
    for (const model of freeModels) {
      try {
        console.log(`[Cron LLM] Trying OpenRouter free: ${model}`);
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization:  `Bearer ${openrouterKey}`,
            "HTTP-Referer": process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
            "X-Title":      "Nabaraj KC Portfolio",
          },
          body: JSON.stringify({
            model,
            messages: [{ role: "user", content: prompt }],
            max_tokens: 2500,
          }),
        });
        if (res.status === 429 || res.status === 402) {
          console.warn(`[Cron LLM] OpenRouter ${model} ${res.status} — skip`);
          continue;
        }
        if (!res.ok) { const e = await res.text(); console.warn(`[Cron LLM] OR ${model} ${res.status}`); errors.push(e.slice(0, 80)); continue; }
        const d    = await res.json();
        const text = d.choices?.[0]?.message?.content;
        if (text) { console.log(`[Cron LLM] ✅ OpenRouter ${model} OK`); return text; }
      } catch (e: any) {
        errors.push(`openrouter/${model}: ${e.message}`);
      }
    }
  }

  // ── 3. Gemini (last resort — key may be invalid) ──────────────────────────
  if (geminiKey) {
    for (const model of ["gemini-2.0-flash", "gemini-1.5-flash"]) {
      try {
        console.log(`[Cron LLM] Trying Gemini: ${model}`);
        const genAI  = new GoogleGenerativeAI(geminiKey);
        const m      = genAI.getGenerativeModel({ model });
        const result = await m.generateContent(prompt);
        console.log(`[Cron LLM] ✅ Gemini ${model} OK`);
        return result.response.text();
      } catch (e: any) {
        const msg = e.message || "";
        console.error(`[Cron LLM] Gemini ${model} failed:`, msg.slice(0, 120));
        errors.push(`gemini/${model}: ${msg.slice(0, 80)}`);
        if (!/(429|quota|rate|exhausted)/i.test(msg)) break;
      }
    }
  }

  throw new Error(`All LLM providers failed. Errors: ${errors.join(" | ")}`);
}

function parseJSON(raw: string): any {
  let cleaned = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  const m = cleaned.match(/\{[\s\S]*\}/);
  if (m) cleaned = m[0];
  cleaned = cleaned.replace(/,\s*}/g, "}").replace(/,\s*]/g, "]");
  try { return JSON.parse(cleaned); } catch { return null; }
}

async function generateContent(type: "article" | "research", db: any) {
  const existing = await db.collection(type === "article" ? "articles" : "research")
    .find({}).sort({ _id: -1 }).limit(15).toArray();
  const existingTitles = existing.map((x: any) => x.title).join(", ");

  const ragResult = await discoverTrendingTopic(existing.map((x: any) => x.title), type);
  const context = await deepResearchTopic(ragResult.topic);

  const outline = await llmGenerate(getAutonomousOutlinePrompt(type, context.context, existingTitles), db);
  const fullContent = await llmGenerate(getAutonomousWriterPrompt(type, outline, context.context), db);

  let parsed: any = null;
  for (let i = 0; i < 3; i++) {
    const raw = await llmGenerate(getAutonomousEditorPrompt(type, outline, fullContent), db);
    parsed = parseJSON(raw);
    if (parsed?.title) break;
  }

  if (!parsed) {
    const slug = `${type}-${ragResult.topic.toLowerCase().replace(/\W+/g, "-").slice(0, 40)}-${Date.now()}`;
    parsed = {
      slug, title: ragResult.topic, excerpt: outline.slice(0, 160),
      abstract: outline.slice(0, 200), keywords: ["AI", "Software"],
      date: new Date().toLocaleDateString("en-US"), readTime: "7 min read",
      tag: type === "research" ? "AI Research" : "Engineering",
      author: "Nabaraj KC", content: fullContent || outline,
      generatedBy: "cron-engine-v2", publishedAt: new Date().toISOString(),
    };
  }
  if (!parsed.content) parsed.content = fullContent;
  if (parsed.title) parsed.title = shortenTitle(parsed.title);
  if (parsed.content) parsed.wordCount = parsed.content.split(/\s+/).length;

  const coverUrl = await generateAndUploadCoverImage(
    parsed.keywords || [parsed.tag || "AI"],
    parsed.slug,
    `autonomous/${type === "article" ? "articles" : "research"}`,
    parsed.title,
    parsed.tag
  ).catch(() => "");

  parsed.coverImage = coverUrl;
  parsed.published = true;
  parsed.status = "published";
  parsed.sources = context.sources.map((s: any) => ({ title: s.title, url: s.url }));

  const coll = type === "article" ? "articles" : "research";
  const existing2 = await db.collection(coll).findOne({ slug: parsed.slug });
  if (existing2) parsed.slug = `${parsed.slug}-${Date.now()}`;
  await db.collection(coll).insertOne(parsed);

  return parsed;
}

async function sendPublishEmail(article: any, research: any) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
    });
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const date = new Date().toLocaleDateString("en-US");
    await transporter.sendMail({
      from: `"AI Publishing Engine" <${process.env.GMAIL_USER}>`,
      to: "nabarajkc43@gmail.com",
      subject: `Daily Content Published — ${date}`,
      html: `
        <h2>Daily AI Publishing Complete ✅</h2>
        <p><b>Article:</b> ${article.title}<br><a href="${baseUrl}/articles/${article.slug}">Read article</a></p>
        <p><b>Research Paper:</b> ${research.title}<br><a href="${baseUrl}/research/${research.slug}">Read paper</a></p>
        <p style="color:#666;font-size:12px">Generated by Nabaraj KC Autonomous AI Brain – ${date}</p>
      `,
    });
  } catch (e: any) {
    console.error("[Cron Check] Email error:", e.message);
  }
}

export async function GET(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const config = (await db.collection("aiconfig").findOne({})) || {};

    const enabled = config.autoPublishEnabled ?? true;
    const scheduledTime = config.autoPublishTime || "08:00";
    const lastRunIso = config.autoPublishLastRun || null;
    const lastStatus = config.autoPublishLastStatus || "IDLE";

    const { currentHHMM, currentDateStr, nowIso } = getKathmanduTimeInfo();

    let lastRunDateStr = "";
    if (lastRunIso) {
      const f = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Kathmandu", year: "numeric", month: "2-digit", day: "2-digit",
      });
      const parts = f.formatToParts(new Date(lastRunIso));
      let y = "", mo = "", d = "";
      parts.forEach((p) => {
        if (p.type === "year") y = p.value;
        if (p.type === "month") mo = p.value;
        if (p.type === "day") d = p.value;
      });
      lastRunDateStr = `${y}-${mo}-${d}`;
    }

    const hasRunToday = lastRunDateStr === currentDateStr;
    const isRunning =
      lastStatus === "RUNNING" &&
      lastRunIso &&
      Date.now() - new Date(lastRunIso).getTime() < 10 * 60 * 1000;

    const currentMinutes = parseInt(currentHHMM.split(":")[0]) * 60 + parseInt(currentHHMM.split(":")[1]);
    const scheduledMinutes = parseInt(scheduledTime.split(":")[0]) * 60 + parseInt(scheduledTime.split(":")[1]);
    const isPastTime = currentMinutes >= scheduledMinutes;

    const shouldRun = enabled && isPastTime && !hasRunToday && !isRunning;

    if (!shouldRun) {
      return NextResponse.json({
        success: true,
        executedNow: false,
        enabled,
        currentTime: currentHHMM,
        scheduledTime,
        hasRunToday,
        isRunning: !!isRunning,
        lastRun: lastRunIso,
        lastStatus,
      });
    }

    // ── OPTIMISTIC LOCK ───────────────────────────────────────────────────
    await db.collection("aiconfig").updateOne(
      {},
      { $set: { autoPublishLastRun: nowIso, autoPublishLastStatus: "RUNNING" } },
      { upsert: true }
    );

    console.log(`[Cron] ✅ Triggering at ${currentHHMM} for schedule ${scheduledTime}`);

    // ── FIRE-AND-FORGET inline (no HTTP loopback) ─────────────────────────
    (async () => {
      try {
        const [article, research] = await Promise.all([
          generateContent("article", db),
          generateContent("research", db),
        ]);

        await db.collection("aiconfig").updateOne(
          {},
          { $set: { autoPublishLastStatus: "SUCCESS" } },
          { upsert: true }
        );

        console.log(`[Cron] ✅ Published: "${article.title}" + "${research.title}"`);
        await sendPublishEmail(article, research);
      } catch (err: any) {
        console.error("[Cron] ❌ Background generation error:", err.message);
        await db.collection("aiconfig").updateOne(
          {},
          { $set: { autoPublishLastStatus: `FAILED: ${err.message}` } },
          { upsert: true }
        );
      }
    })();

    return NextResponse.json({
      success: true,
      executedNow: true,
      currentTime: currentHHMM,
      scheduledTime,
      message: "Content generation started in background. Check back in 3-4 minutes.",
    });

  } catch (error: any) {
    console.error("[Cron Check Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
