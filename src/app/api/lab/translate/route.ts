import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Offline dictionary fallback for common terms if external API key/quota is depleted
const DICTIONARY: Record<string, string> = {
  "ke cha": "के छ",
  "ke chha": "के छ",
  "namaste": "नमस्ते",
  "dhanyabad": "धन्यवाद",
  "dhanyabaad": "धन्यवाद",
  "kasto cha": "कस्तो छ",
  "kasto chha": "कस्तो छ",
  "subha prabhat": "शुभ प्रभात",
  "timro naam ke ho": "तिम्रो नाम के हो?",
  "mero naam nabaraj ho": "मेरो नाम नवराज हो।",
  "ma nepal ma baschu": "म नेपालमा बस्छु।",
  "ma nepal ma baschhu": "म नेपालमा बस्छु।",
  "hello": "नमस्ते",
  "thank you": "धन्यवाद",
  "how are you": "तपाईंलाई कस्तो छ?",
  "what is your name": "तपाईंको नाम के हो?",
  "good morning": "शुभ प्रभात",
  "i live in nepal": "म नेपालमा बस्छु।",
  "how much does this cost": "यसको मूल्य कति पर्छ?",
};

export async function POST(request: Request) {
  try {
    const { from, to, text } = await request.json();

    if (!text || !text.trim()) {
      return NextResponse.json({ translation: "" });
    }

    const cleanInput = text.trim().toLowerCase().replace(/[?.!]+$/, "");

    // Quick dictionary check
    if (DICTIONARY[cleanInput]) {
      return NextResponse.json({ translation: DICTIONARY[cleanInput] });
    }

    const langNames: Record<string, string> = {
      nepali: "Devanagari Nepali",
      roman: "Roman Nepali (transliteration)",
      english: "English",
    };

    const fromLang = langNames[from] || from;
    const toLang = langNames[to] || to;

    const systemPrompt = `You are a real-time instant translator between ${fromLang} and ${toLang}.
Translate the input accurately from ${fromLang} to ${toLang}.

STRICT INSTRUCTIONS:
- Return ONLY the direct translation.
- Do NOT output explanations, notes, quotes, or markdown.
- Preserve proper nouns and intent.`;

    const geminiKey = process.env.GEMINI_API_KEY;
    const apiKey = process.env.OPENROUTER_API_KEY;

    // 1. Try Gemini Native
    if (geminiKey) {
      const models = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"];
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(geminiKey);

      for (const mName of models) {
        try {
          const model = genAI.getGenerativeModel({ model: mName });
          const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\nInput: ${text}` }] }],
            generationConfig: { maxOutputTokens: 256, temperature: 0.1 }
          });
          const translated = result.response.text().trim();
          if (translated) {
            return NextResponse.json({ translation: translated });
          }
        } catch (err) {
          console.warn(`[Translate Route] Gemini ${mName} failed:`, err);
        }
      }
    }

    // 2. OpenRouter Fallback Chain
    if (apiKey) {
      const openRouterModels = [
        "google/gemma-4-31b-it:free",
        "openrouter/auto",
        "meta-llama/llama-3.3-70b-instruct:free",
        "deepseek/deepseek-chat:free"
      ];

      for (const mName of openRouterModels) {
        try {
          const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
              "HTTP-Referer": "http://localhost:3000",
              "X-Title": "Krrishmay Translator",
            },
            body: JSON.stringify({
              model: mName,
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: text }
              ],
              temperature: 0.1,
              max_tokens: 256
            }),
          });

          if (res.ok) {
            const data = await res.json();
            const translated = (data.choices?.[0]?.message?.content || "").trim();
            if (translated) {
              return NextResponse.json({ translation: translated });
            }
          }
        } catch (err) {
          console.warn(`[Translate Route] OpenRouter ${mName} failed:`, err);
        }
      }
    }

    // Heuristic translation fallback if API endpoints are offline
    if (from === "roman" && to === "nepali") {
      if (cleanInput.includes("ke cha") || cleanInput.includes("ke chha")) return NextResponse.json({ translation: "के छ" });
      if (cleanInput.includes("namaste")) return NextResponse.json({ translation: "नमस्ते" });
    }

    return NextResponse.json({ translation: text });

  } catch (error: any) {
    console.error("Translate API error:", error);
    return NextResponse.json({ translation: request ? "" : "" });
  }
}
