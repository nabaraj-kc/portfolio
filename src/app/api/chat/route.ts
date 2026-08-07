import { NextResponse } from "next/server";
import { generateLLMResponse } from "@/lib/llm-provider";
import { getAiConfig } from "@/lib/data";
import { performWebSearch } from "@/lib/web-search";
import { KRRISHMAY_SYSTEM_PROMPT } from "@/lib/ai-prompts";

// ─── CONTENT INTENT DETECTION ────────────────────────────────────────────────
// Detects when a user wants Krrishmay to write and publish content.
// Returns { type, topic } or null if no content intent found.

function detectContentIntent(message: string): { type: "article" | "research"; topic: string } | null {
  const msg = message.trim();

  // Research paper patterns — check first (more specific)
  const researchPatterns = [
    /(?:write|create|generate|draft|publish|produce|make)\s+(?:me\s+)?(?:a\s+)?research\s+(?:paper|study|analysis|report|thesis|specification)\s+(?:about|on|covering|regarding|exploring|titled?)\s+(.+)/i,
    /(?:write|create|generate|draft|publish|produce|make)\s+(?:me\s+)?(?:an?\s+)?(?:academic|scientific|technical|scholarly)\s+(?:paper|article|study|report)\s+(?:about|on|covering|regarding|exploring)\s+(.+)/i,
    /(?:write|create|generate|draft|publish)\s+(?:me\s+)?a\s+paper\s+(?:about|on|covering|regarding|exploring)\s+(.+)/i,
    /(?:can\s+you\s+)?(?:write|create|generate|draft|publish|produce)\s+(?:me\s+)?a\s+research\s+(?:paper|study|analysis)\s+(?:about|on|for|regarding)\s+(.+)/i,
    /research\s+paper\s+(?:about|on|covering|for|regarding)\s+(.+)/i,
    /publish\s+(?:a\s+)?(?:research|academic|scientific)\s+(?:paper|study|article)\s+(?:on|about)\s+(.+)/i,
    /i\s+(?:need|want)\s+(?:a\s+)?(?:research\s+)?paper\s+(?:on|about|covering)\s+(.+)/i,
  ];

  // Article / blog patterns
  const articlePatterns = [
    /(?:write|create|generate|draft|publish|produce|make)\s+(?:me\s+)?(?:an?\s+)?(?:article|blog\s+post|blog|post|essay|write-?up|piece)\s+(?:about|on|covering|regarding|exploring|titled?)\s+(.+)/i,
    /(?:can\s+you\s+)?(?:write|create|generate|draft|publish|produce)\s+(?:me\s+)?an?\s+article\s+(?:about|on|for|regarding|covering)\s+(.+)/i,
    /(?:write|create|generate|draft|publish)\s+(?:me\s+)?a\s+(?:technical\s+)?blog\s+(?:post\s+)?(?:about|on|covering|regarding)\s+(.+)/i,
    /publish\s+an?\s+article\s+(?:about|on|covering)\s+(.+)/i,
    /i\s+(?:need|want)\s+(?:an?\s+)?article\s+(?:on|about|covering)\s+(.+)/i,
    /write\s+(?:something\s+)?(?:about|on)\s+(.+)\s+(?:and\s+)?publish\s+it/i,
  ];

  for (const p of researchPatterns) {
    const m = msg.match(p);
    if (m?.[1]) {
      // Clean trailing punctuation and filler
      const topic = m[1].trim().replace(/[?.!]+$/, "").replace(/^(?:the\s+topic\s+of\s+|a\s+topic\s+of\s+)/i, "");
      if (topic.length > 3) return { type: "research", topic };
    }
  }

  for (const p of articlePatterns) {
    const m = msg.match(p);
    if (m?.[1]) {
      const topic = m[1].trim().replace(/[?.!]+$/, "").replace(/^(?:the\s+topic\s+of\s+|a\s+topic\s+of\s+)/i, "");
      if (topic.length > 3) return { type: "article", topic };
    }
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const { messages, attachments, isDeepThink, activePills = [], model = "krrishmay-4o", userEmail } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format." }, { status: 400 });
    }

    const config: any = await getAiConfig();
    // Use the centralized hardened system prompt; allow admin override via DB config only if it significantly differs
    const dbPrompt = config?.systemPrompt || "";
    let systemPrompt =
      (dbPrompt && dbPrompt.length > 100 && !dbPrompt.includes("Be concise, intelligent, and helpful")
        ? dbPrompt
        : KRRISHMAY_SYSTEM_PROMPT) +
      "\n\nMULTIMODAL & FILE CAPABILITIES: You possess full capability to view, read, parse, and analyze all attached PDFs, images, text documents, code files, and audio. When files are attached, analyze their contents thoroughly and answer the user's questions directly based on the attached file contents.";

    const lastUserMessage = messages[messages.length - 1]?.content || "";

    // Content Generation — Krrishmay writes and publishes articles/research on request
    const contentIntent = detectContentIntent(lastUserMessage);
    if (contentIntent) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        const genRes = await fetch(`${baseUrl}/api/generate-content`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: contentIntent.type,
            topic: contentIntent.topic,
            requestedBy: userEmail || "krrishmay-user",
          }),
        });
        const genData = await genRes.json();
        if (genData.success) {
          const label = contentIntent.type === "research" ? "research paper" : "article";
          const reply =
            `Done. I wrote and published a ${label} on "${contentIntent.topic}".\n\n` +
            `**${genData.title}**\n\n` +
            `${genData.wordCount ? `${genData.wordCount} words — ` : ""}[Read it here](${genData.url})\n\n` +
            `Researched from live sources via Tavily, published under Nabaraj KC's authorship. Live and indexed now.`;
          return NextResponse.json({ reply });
        } else {
          return NextResponse.json({
            reply: `Generation failed for topic "${contentIntent.topic}": ${genData.error || "Unknown error"}. Try again or rephrase the topic.`,
          });
        }
      } catch (err) {
        console.error("Content generation via Krrishmay failed:", err);
        // Fall through to normal LLM response
      }
    }

    // Image Generation Hook
    const isImageRequest = activePills.includes("create-image") || /create an image|generate an image|draw me/i.test(lastUserMessage);
    if (isImageRequest) {
      systemPrompt += `\n\nIMAGE GENERATION: The user wants to create an image. You DO have the capability to create images! To generate an image, you MUST output a markdown image tag with a highly detailed, descriptive prompt URL-encoded. Format exactly like this: ![Generated Image](/api/generate-image?prompt={URL_ENCODED_DETAILED_DESCRIPTION}) . Do NOT say you cannot create images. Just output the markdown!`;
    }

    // Web Search / RAG Hook
    const searchRegex = /search the web|latest|current|today|now|202[4-9]|who is|what is|where is|when did|richest|nabarajkc|weather|price/i;
    const isSearchRequest = activePills.includes("deep-research") || searchRegex.test(lastUserMessage);
    if (isSearchRequest && !/create an image|generate an image/i.test(lastUserMessage)) {
      const searchResults = await performWebSearch(lastUserMessage);
      if (searchResults) {
        systemPrompt += `\n\nLIVE INTERNET DATA RETRIEVED:\n${searchResults}\n\nUse the above live search results to answer the user's query accurately. If they are asking about Nabaraj KC or his portfolio, prioritize the deep-scraped content.`;
      }
    }

    const reply = await generateLLMResponse({
      model,
      messages,
      attachments,
      systemPrompt,
      isDeepThink,
      activePills,
      temperature: config?.temperature ?? 0.7,
      maxTokens: config?.maxTokens ?? 4096,
    });

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process chat." },
      { status: 500 }
    );
  }
}
