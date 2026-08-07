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
export const maxDuration = 300; // 5-minute max (Vercel Pro) — adjust as needed

// ─────────────────────────────────────────────────────────────────────────────
// TIMEZONE HELPER  (pure Intl — no external deps)
// Returns the current wall-clock time in Asia/Kathmandu (UTC+05:45)
// ─────────────────────────────────────────────────────────────────────────────
function getKathmanduTimeInfo(): {
  currentHHMM: string;
  currentDateStr: string; // "YYYY-MM-DD" in Kathmandu local date
  nowIso: string;
} {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kathmandu",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = fmt.formatToParts(now);
  let hour = "00", minute = "00", year = "", month = "", day = "";
  for (const p of parts) {
    if (p.type === "hour")   hour   = p.value;
    if (p.type === "minute") minute = p.value;
    if (p.type === "year")   year   = p.value;
    if (p.type === "month")  month  = p.value;
    if (p.type === "day")    day    = p.value;
  }
  // Intl may return "24" at midnight — normalise
  if (hour === "24") hour = "00";
  const currentHHMM   = `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
  const currentDateStr = `${year}-${month}-${day}`; // e.g. "2026-08-07"
  return { currentHHMM, currentDateStr, nowIso: now.toISOString() };
}

// Convert the stored "lastRun" ISO string to a Kathmandu calendar date string
function isoToKathmanduDate(iso: string): string {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kathmandu",
    year: "numeric", month: "2-digit", day: "2-digit",
  });
  const parts = fmt.formatToParts(new Date(iso));
  let y = "", mo = "", d = "";
  for (const p of parts) {
    if (p.type === "year")  y  = p.value;
    if (p.type === "month") mo = p.value;
    if (p.type === "day")   d  = p.value;
  }
  return `${y}-${mo}-${d}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────────────────────
function isAuthorized(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET || "nkc-cron-secret-2026";
  const auth = request.headers.get("authorization") || "";
  if (auth === `Bearer ${cronSecret}`) return true;

  // Vercel sends CRON_SECRET as the Authorization header automatically
  // but also allow query-string secret for manual test calls
  const url = new URL(request.url);
  if (url.searchParams.get("secret") === cronSecret) return true;

  // Also allow admin cookie for browser-originated test calls
  const cookie = request.headers.get("cookie") || "";
  const adminSecret = process.env.ADMIN_SESSION_TOKEN || "nkc-admin-secret-2026";
  if (cookie.includes(`admin_session=${adminSecret}`)) return true;

  return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// LLM HELPERS
// ─────────────────────────────────────────────────────────────────────────────
async function getApiKey(db: any, name: string, envKey: string): Promise<string> {
  try {
    const record = await db.collection("apikeys").findOne({ name });
    return record?.value || process.env[envKey] || "";
  } catch {
    return process.env[envKey] || "";
  }
}

async function llmGenerate(prompt: string, db: any): Promise<string> {
  const geminiKey     = await getApiKey(db, "Gemini",     "GEMINI_API_KEY");
  const openrouterKey = await getApiKey(db, "OpenRouter", "OPENROUTER_API_KEY");
  const mistralKey    = await getApiKey(db, "Mistral",    "MISTRAL_API_KEY");

  const errors: string[] = [];

  // ── 1. Mistral (working key, reliable) ──────────────────────────────────
  if (mistralKey) {
    const mistralModels = ["mistral-small-latest", "open-mistral-7b", "mistral-medium-latest"];
    for (const model of mistralModels) {
      try {
        console.log(`[Publish LLM] Trying Mistral model: ${model}`);
        const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization:   `Bearer ${mistralKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [{ role: "user", content: prompt }],
            max_tokens: 3000,
            temperature: 0.7,
          }),
        });
        if (res.status === 429) {
          console.warn(`[Publish LLM] Mistral ${model} rate-limited, trying next...`);
          continue;
        }
        if (!res.ok) {
          const errText = await res.text();
          console.error(`[Publish LLM] Mistral ${model} error ${res.status}:`, errText.slice(0, 200));
          errors.push(`mistral/${model}: ${res.status}`);
          break; // Non-rate-limit error — skip all Mistral models
        }
        const d    = await res.json();
        const text = d.choices?.[0]?.message?.content;
        if (text) {
          console.log(`[Publish LLM] ✅ Mistral ${model} succeeded (${text.length} chars)`);
          return text;
        }
      } catch (e: any) {
        console.error(`[Publish LLM] Mistral ${model} threw:`, e.message);
        errors.push(`mistral/${model}: ${e.message}`);
      }
    }
  }

  // ── 2. OpenRouter FREE models (no credits needed) ─────────────────────────
  if (openrouterKey) {
    // Use free-tier models only — these don't require purchased credits
    const freeModels = [
      "google/gemma-3-27b-it:free",
      "google/gemma-4-31b-it:free",
      "meta-llama/llama-3.1-8b-instruct:free",
      "mistralai/mistral-7b-instruct:free",
      "openai/gpt-oss-20b:free",
    ];
    for (const model of freeModels) {
      try {
        console.log(`[Publish LLM] Trying OpenRouter free model: ${model}`);
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization:   `Bearer ${openrouterKey}`,
            "HTTP-Referer":  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
            "X-Title":       "Nabaraj KC Portfolio",
          },
          body: JSON.stringify({
            model,
            messages: [{ role: "user", content: prompt }],
            max_tokens: 2500,
          }),
        });
        if (res.status === 429 || res.status === 402) {
          console.warn(`[Publish LLM] OpenRouter ${model} error ${res.status} — skipping`);
          continue;
        }
        if (!res.ok) {
          const errText = await res.text();
          console.warn(`[Publish LLM] OpenRouter ${model} error ${res.status}:`, errText.slice(0, 120));
          continue;
        }
        const d    = await res.json();
        const text = d.choices?.[0]?.message?.content;
        if (text) {
          console.log(`[Publish LLM] ✅ OpenRouter ${model} succeeded`);
          return text;
        }
      } catch (e: any) {
        console.error(`[Publish LLM] OpenRouter ${model} threw:`, e.message);
        errors.push(`openrouter/${model}: ${e.message}`);
      }
    }
  }

  // ── 3. Gemini (fallback — may have invalid key) ─────────────────────────
  if (geminiKey) {
    for (const model of ["gemini-2.0-flash", "gemini-1.5-flash"]) {
      try {
        console.log(`[Publish LLM] Trying Gemini model: ${model}`);
        const genAI  = new GoogleGenerativeAI(geminiKey);
        const m      = genAI.getGenerativeModel({ model });
        const result = await m.generateContent(prompt);
        console.log(`[Publish LLM] ✅ Gemini ${model} succeeded`);
        return result.response.text();
      } catch (e: any) {
        const msg = e.message || "";
        console.error(`[Publish LLM] Gemini ${model} failed:`, msg.slice(0, 120));
        errors.push(`gemini/${model}: ${msg.slice(0, 80)}`);
        if (!/(429|quota|rate|exhausted|resource_exhausted)/i.test(msg)) break;
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

// ─────────────────────────────────────────────────────────────────────────────
// CONTENT GENERATOR
// ─────────────────────────────────────────────────────────────────────────────
async function generateContent(type: "article" | "research", db: any) {
  const coll = type === "article" ? "articles" : "research";
  console.log(`[Publish] ── Generating ${type} ──`);

  const existing = await db.collection(coll)
    .find({}).sort({ _id: -1 }).limit(15).toArray();
  const existingTitles = existing.map((x: any) => x.title).join(", ");
  console.log(`[Publish] ${type}: Found ${existing.length} existing items to avoid duplicates`);

  const ragResult = await discoverTrendingTopic(existing.map((x: any) => x.title), type);
  console.log(`[Publish] ${type}: RAG topic discovered → "${ragResult.topic}"`);

  const context = await deepResearchTopic(ragResult.topic);
  console.log(`[Publish] ${type}: Deep research complete. Sources: ${context.sources.length}`);

  const outline     = await llmGenerate(getAutonomousOutlinePrompt(type, context.context, existingTitles), db);
  const fullContent = await llmGenerate(getAutonomousWriterPrompt(type, outline, context.context), db);

  let parsed: any = null;
  for (let i = 0; i < 3; i++) {
    const raw = await llmGenerate(getAutonomousEditorPrompt(type, outline, fullContent), db);
    parsed = parseJSON(raw);
    if (parsed?.title) { console.log(`[Publish] ${type}: Editor JSON parsed OK on attempt ${i + 1}`); break; }
    console.warn(`[Publish] ${type}: Editor parse attempt ${i + 1} failed — retrying`);
  }

  // Fallback document if editor fails
  if (!parsed || !parsed.title) {
    console.warn(`[Publish] ${type}: All editor attempts failed — using fallback skeleton`);
    const slug = `${type}-${ragResult.topic.toLowerCase().replace(/\W+/g, "-").slice(0, 40)}-${Date.now()}`;
    parsed = {
      slug, title: ragResult.topic,
      excerpt: outline.slice(0, 160),
      abstract: outline.slice(0, 200),
      keywords: ["AI", "Software"],
      date: new Date().toLocaleDateString("en-US"),
      readTime: "7 min read",
      tag: type === "research" ? "AI Research" : "Engineering",
      author: "Nabaraj KC",
      content: fullContent || outline,
      generatedBy: "auto-publish-engine-v3",
      publishedAt: new Date().toISOString(),
    };
  }

  // Normalise fields
  if (!parsed.content)  parsed.content  = fullContent;
  if (parsed.title)     parsed.title    = shortenTitle(parsed.title);
  if (parsed.content)   parsed.wordCount = parsed.content.split(/\s+/).length;
  parsed.published    = true;
  parsed.status       = "published";
  parsed.publishedAt  = new Date().toISOString();
  parsed.generatedBy  = parsed.generatedBy || "auto-publish-engine-v3";
  parsed.sources      = context.sources.map((s: any) => ({ title: s.title, url: s.url }));

  // Cover image
  const coverUrl = await generateAndUploadCoverImage(
    parsed.keywords || [parsed.tag || "AI"],
    parsed.slug,
    `autonomous/${type === "article" ? "articles" : "research"}`,
    parsed.title,
    parsed.tag
  ).catch((e: any) => {
    console.warn(`[Publish] ${type}: Cover image failed (non-fatal):`, e.message);
    return "";
  });
  parsed.coverImage = coverUrl;

  // Deduplicate slug
  const exists = await db.collection(coll).findOne({ slug: parsed.slug });
  if (exists) parsed.slug = `${parsed.slug}-${Date.now()}`;

  await db.collection(coll).insertOne(parsed);
  console.log(`[Publish] ✅ ${type} saved to DB: "${parsed.title}" (slug: ${parsed.slug})`);

  return parsed;
}

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL NOTIFICATION
// ─────────────────────────────────────────────────────────────────────────────
async function sendPublishEmail(article: any, research: any) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
    });
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const date    = new Date().toLocaleString("en-US", { timeZone: "Asia/Kathmandu" });
    await transporter.sendMail({
      from:    `"AI Publishing Engine" <${process.env.GMAIL_USER}>`,
      to:      process.env.ADMIN_EMAIL || "nabarajkc43@gmail.com",
      subject: `✅ Daily Content Published — ${date} NPT`,
      html: `
        <h2>Daily AI Publishing Complete ✅</h2>
        <p><b>Article:</b> ${article.title}<br>
           <a href="${baseUrl}/articles/${article.slug}">Read article →</a></p>
        <p><b>Research Paper:</b> ${research.title}<br>
           <a href="${baseUrl}/research/${research.slug}">Read paper →</a></p>
        <p style="color:#999;font-size:11px">
          Auto-published by the Nabaraj KC AI Brain at ${date} (Asia/Kathmandu)
        </p>
      `,
    });
    console.log("[Publish] ✅ Notification email sent");
  } catch (e: any) {
    console.error("[Publish] Email send failed (non-fatal):", e.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN HANDLER  (called by Vercel Cron every 15 min)
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(request: Request) {
  // ── 1. Auth ────────────────────────────────────────────────────────────────
  if (!isAuthorized(request)) {
    console.warn("[Publish Cron] ⛔ Unauthorized request");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db     = client.db();

    // ── 2. Fetch schedule config ─────────────────────────────────────────────
    const config        = (await db.collection("aiconfig").findOne({})) || {};
    const enabled       = config.autoPublishEnabled ?? true;
    const scheduledTime = config.autoPublishTime    || "08:00"; // HH:MM in NPT
    const lastRunIso    = config.autoPublishLastRun  || null;
    const lastStatus    = config.autoPublishLastStatus || "IDLE";

    // ── 3. Timezone arithmetic ───────────────────────────────────────────────
    const { currentHHMM, currentDateStr, nowIso } = getKathmanduTimeInfo();

    // Convert "HH:MM" → total minutes-since-midnight for comparison
    const toMinutes = (hhmm: string) => {
      const [h, m] = hhmm.split(":").map(Number);
      return h * 60 + m;
    };
    const currentMin   = toMinutes(currentHHMM);
    const scheduledMin = toMinutes(scheduledTime);

    // Has the engine already run today (in Kathmandu date)?
    const lastRunKathmanduDate = lastRunIso ? isoToKathmanduDate(lastRunIso) : "";
    const hasRunToday          = lastRunKathmanduDate === currentDateStr;

    // Is another run currently in progress (guard against parallel invocations)?
    const isRunning =
      lastStatus === "RUNNING" &&
      lastRunIso &&
      Date.now() - new Date(lastRunIso).getTime() < 10 * 60 * 1000; // 10-min stale guard

    // ── 4. Detailed decision log ─────────────────────────────────────────────
    console.log("─────────────────────────────────────────────────");
    console.log("[Publish Cron] 🕐 Schedule check");
    console.log(`  Kathmandu now  : ${currentHHMM}  (${currentDateStr})`);
    console.log(`  Scheduled at   : ${scheduledTime} NPT`);
    console.log(`  Engine enabled : ${enabled}`);
    console.log(`  Has run today  : ${hasRunToday}  (last run date: ${lastRunKathmanduDate || "never"})`);
    console.log(`  Is running     : ${!!isRunning}`);
    console.log(`  Last status    : ${lastStatus}`);
    console.log(`  Current min    : ${currentMin}, Scheduled min: ${scheduledMin}`);

    // Window: only fire if we are at or past the scheduled minute, but no more
    // than 14 minutes late (matching our 15-min cron cadence with 1-min buffer)
    const minutesLate = currentMin - scheduledMin;
    const inFireWindow = minutesLate >= 0 && minutesLate < 14;

    console.log(`  Minutes late   : ${minutesLate}  |  In fire window: ${inFireWindow}`);
    console.log("─────────────────────────────────────────────────");

    // ── 5. Decision ──────────────────────────────────────────────────────────
    const shouldRun = enabled && inFireWindow && !hasRunToday && !isRunning;

    if (!shouldRun) {
      const reason = !enabled
        ? "engine disabled"
        : !inFireWindow
          ? `not in fire window (${minutesLate < 0 ? "too early" : "already fired this hour"})`
          : hasRunToday
            ? "already ran today"
            : "another run in progress";

      console.log(`[Publish Cron] ⏭ Skipping — ${reason}`);
      return NextResponse.json({
        success: true,
        executedNow: false,
        reason,
        currentTimeNPT: currentHHMM,
        scheduledTimeNPT: scheduledTime,
        hasRunToday,
        isRunning: !!isRunning,
        lastRun: lastRunIso,
        lastStatus,
      });
    }

    // ── 6. Acquire optimistic lock ───────────────────────────────────────────
    console.log(`[Publish Cron] 🚀 Firing! currentTime=${currentHHMM} NPT, scheduledTime=${scheduledTime} NPT`);
    await db.collection("aiconfig").updateOne(
      {},
      { $set: { autoPublishLastRun: nowIso, autoPublishLastStatus: "RUNNING" } },
      { upsert: true }
    );

    // ── 7. Generate & publish BOTH in parallel ───────────────────────────────
    // Use Promise.allSettled so that one failure doesn't cancel the other
    console.log("[Publish Cron] 📝 Starting parallel generation of article + research paper...");
    const [articleResult, researchResult] = await Promise.allSettled([
      generateContent("article",  db),
      generateContent("research", db),
    ]);

    // Collect outcomes
    const article  = articleResult.status  === "fulfilled" ? articleResult.value  : null;
    const research = researchResult.status === "fulfilled" ? researchResult.value : null;
    const errors: string[] = [];

    if (articleResult.status  === "rejected") {
      errors.push(`Article failed: ${articleResult.reason?.message || articleResult.reason}`);
      console.error("[Publish Cron] ❌ Article generation failed:", articleResult.reason?.message);
    }
    if (researchResult.status === "rejected") {
      errors.push(`Research failed: ${researchResult.reason?.message || researchResult.reason}`);
      console.error("[Publish Cron] ❌ Research generation failed:", researchResult.reason?.message);
    }

    // ── 8. Persist final status ───────────────────────────────────────────────
    const bothSucceeded = article && research;
    const finalStatus   = errors.length === 0
      ? "SUCCESS"
      : bothSucceeded
        ? `PARTIAL: ${errors.join("; ")}`
        : `FAILED: ${errors.join("; ")}`;

    await db.collection("aiconfig").updateOne(
      {},
      { $set: { autoPublishLastStatus: finalStatus } },
      { upsert: true }
    );

    if (bothSucceeded) {
      console.log(`[Publish Cron] ✅ Published: "${article.title}" + "${research.title}"`);
      // Send email non-blocking — don't await to keep response fast
      sendPublishEmail(article, research).catch(() => {});
    } else {
      console.warn(`[Publish Cron] ⚠ Partial/full failure. Status: ${finalStatus}`);
    }

    return NextResponse.json({
      success:    errors.length === 0,
      executedNow: true,
      finalStatus,
      article:  article  ? { title: article.title,  slug: article.slug  } : null,
      research: research ? { title: research.title, slug: research.slug } : null,
      errors:   errors.length > 0 ? errors : undefined,
    });

  } catch (error: any) {
    console.error("[Publish Cron] 💥 Fatal error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
