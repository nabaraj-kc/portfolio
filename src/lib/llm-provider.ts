import { GoogleGenerativeAI } from "@google/generative-ai";

export interface ChatMessage {
  role: "user" | "assistant" | "system" | "model";
  content: string;
}

export interface AttachmentData {
  name: string;
  type: string;
  url?: string; // Base64 Data URL e.g. data:application/pdf;base64,...
}

export interface GenerateOptions {
  model: string;
  messages: ChatMessage[];
  systemPrompt: string;
  attachments?: AttachmentData[];
  isDeepThink?: boolean;
  activePills?: string[];
  temperature?: number;
  maxTokens?: number;
}

// Check if an error represents a rate limit / quota exceeded
function isRateLimitError(err: any): boolean {
  if (!err) return false;
  const msg = (err.message || String(err)).toLowerCase();
  return (
    msg.includes("429") ||
    msg.includes("rate limit") ||
    msg.includes("quota") ||
    msg.includes("resource_exhausted") ||
    msg.includes("too many requests")
  );
}

// Master Entry Point with Failover Architecture
export async function generateLLMResponse(options: GenerateOptions): Promise<string> {
  const { model, messages, systemPrompt, attachments = [], isDeepThink, activePills = [], temperature = 0.7, maxTokens = 4096 } = options;

  let finalSystemPrompt = systemPrompt;
  const isReasoning = isDeepThink || activePills.includes("reasoning");

  if (isReasoning) {
    finalSystemPrompt +=
      "\n\nDEEPTHINK MODE ACTIVATED: Before answering the user, you MUST output a detailed, multi-step chain of thought wrapped EXACTLY inside <thought> and </thought> XML tags. Only output the final answer after the </thought> tag.";
  }

  // Enrich last message with extracted text content from attachments (PDFs, code, text files)
  const processedMessages = [...messages];
  if (attachments.length > 0 && processedMessages.length > 0) {
    const lastMsgIndex = processedMessages.length - 1;
    const lastMsg = processedMessages[lastMsgIndex];

    const attachmentTexts = attachments
      .map((att: any) => {
        if (att.textContent) {
          return `\n\n[ATTACHED FILE: ${att.name}]\n--- FILE EXTRACTED CONTENT ---\n${att.textContent}\n--- END ATTACHED FILE ---`;
        }
        return `\n\n[ATTACHED FILE: ${att.name} (Type: ${att.type})]`;
      })
      .join("");

    processedMessages[lastMsgIndex] = {
      ...lastMsg,
      content: `${lastMsg.content}${attachmentTexts}`,
    };
  }

  // Determine Primary Provider Order based on Model & Role
  let providerOrder: Array<"gemini" | "mistral" | "openrouter"> = ["openrouter", "gemini", "mistral"];

  if (attachments.length > 0) {
    // Gemini has native multimodal PDF/Image/Audio parsing — try it first
    providerOrder = ["gemini", "openrouter", "mistral"];
  } else if (model.includes("mistral")) {
    providerOrder = ["mistral", "openrouter", "gemini"];
  }

  const errors: string[] = [];

  // Try providers in order
  for (const provider of providerOrder) {
    try {
      if (provider === "gemini" && process.env.GEMINI_API_KEY) {
        return await tryGeminiChain(processedMessages, finalSystemPrompt, attachments, temperature, maxTokens);
      }
      if (provider === "mistral" && process.env.MISTRAL_API_KEY) {
        return await tryMistralChain(processedMessages, finalSystemPrompt, process.env.MISTRAL_API_KEY, temperature, maxTokens);
      }
      if (provider === "openrouter" && process.env.OPENROUTER_API_KEY) {
        return await tryOpenRouterChain(processedMessages, finalSystemPrompt, process.env.OPENROUTER_API_KEY, temperature, maxTokens);
      }
    } catch (err: any) {
      console.warn(`[LLM Orchestrator] Provider ${provider} failed:`, err.message || err);
      errors.push(`${provider}: ${err.message || String(err)}`);
    }
  }

  throw new Error(`All AI Providers failed or rate-limited. Details: ${errors.join("; ")}`);
}

// ----------------------------------------------------------------------
// 1. GEMINI MULTIMODAL (PDF, IMAGES, DOCUMENTS) MODEL CHAIN FAILOVER
// ----------------------------------------------------------------------
async function tryGeminiChain(
  messages: ChatMessage[],
  systemInstruction: string,
  attachments: AttachmentData[],
  temperature: number,
  maxOutputTokens: number
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

  // Valid Gemini model slugs — verified working for free-tier API keys
  const geminiModels = [
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
  ];

  const genAI = new GoogleGenerativeAI(apiKey);

  // Build chat history (all but last message)
  const history = messages
    .slice(0, -1)
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : ("user" as const),
      parts: [{ text: m.content }],
    }));

  const lastMsg = messages[messages.length - 1]?.content || "";

  // Convert PDF and image attachments into proper Gemini Part objects
  const attachmentParts: any[] = attachments
    .map((att) => {
      if (att.url && att.url.includes("base64,")) {
        const [header, data] = att.url.split("base64,");
        // Determine mime type
        let mimeType = att.type;
        if (!mimeType || mimeType === "application/octet-stream") {
          if (att.name.endsWith(".pdf")) mimeType = "application/pdf";
          else if (att.name.match(/\.(png|jpg|jpeg|webp|gif)$/i)) mimeType = "image/png";
          else if (att.name.match(/\.(mp3|wav|ogg|m4a)$/i)) mimeType = "audio/mp3";
          else if (att.name.match(/\.(mp4|webm|mov|avi)$/i)) mimeType = "video/mp4";
          else mimeType = "text/plain";
        }
        return {
          inlineData: {
            mimeType,
            data,
          },
        };
      }
      return null;
    })
    .filter(Boolean);

  for (const modelName of geminiModels) {
    try {
      const geminiModel = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction,
      });

      if (attachmentParts.length > 0) {
        // For multimodal: use generateContent with proper Content structure
        // Build the user parts array: text + all attachment inlineData parts
        const userParts: any[] = [
          ...attachmentParts,
          { text: lastMsg || "Please analyze the attached file(s) and describe their content in detail." },
        ];

        // Include chat history as prior turns, then the multimodal user turn
        const contents: any[] = [
          ...history,
          {
            role: "user",
            parts: userParts,
          },
        ];

        const result = await geminiModel.generateContent({ contents });
        const response = await result.response;
        return response.text();
      } else {
        // Standard text chat with history
        const chat = geminiModel.startChat({
          history,
          generationConfig: {
            temperature,
            maxOutputTokens,
          },
        });
        const result = await chat.sendMessage(lastMsg);
        const response = await result.response;
        return response.text();
      }
    } catch (err: any) {
      console.warn(`[Gemini Chain] Model ${modelName} error:`, err.message || err);
      // If it's a rate limit, try next model; if it's a non-rate-limit error on last model, throw
      const isLast = geminiModels.indexOf(modelName) === geminiModels.length - 1;
      if (!isRateLimitError(err) && isLast) {
        throw err;
      }
      if (!isRateLimitError(err) && !isLast) {
        // For 404/auth errors, skip to next model silently
        continue;
      }
    }
  }

  throw new Error("All Gemini models failed or rate-limited.");
}

// ----------------------------------------------------------------------
// 2. MISTRAL MODEL CHAIN FAILOVER
// ----------------------------------------------------------------------
async function tryMistralChain(
  messages: ChatMessage[],
  systemPrompt: string,
  apiKey: string,
  temperature: number,
  maxTokens: number
): Promise<string> {
  const mistralModels = ["mistral-small-latest", "open-mistral-7b", "mistral-medium-latest"];

  const formattedMessages = [
    { role: "system", content: systemPrompt },
    ...messages.map((m) => ({
      role: m.role === "model" ? "assistant" : m.role,
      content: m.content,
    })),
  ];

  for (const modelName of mistralModels) {
    try {
      const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: modelName,
          messages: formattedMessages,
          temperature,
          max_tokens: maxTokens,
        }),
      });

      if (res.status === 429) {
        console.warn(`[Mistral Chain] Model ${modelName} 429 Rate Limited. Trying next model...`);
        continue;
      }

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Mistral API Error ${res.status}: ${errText}`);
      }

      const data = await res.json();
      const text = data.choices?.[0]?.message?.content;
      if (text) return text;
    } catch (err: any) {
      console.warn(`[Mistral Chain] Model ${modelName} error:`, err.message || err);
      if (mistralModels.indexOf(modelName) === mistralModels.length - 1) {
        throw err;
      }
    }
  }

  throw new Error("All Mistral models rate-limited.");
}

// ----------------------------------------------------------------------
// 3. OPENROUTER MODEL CHAIN FAILOVER
// ----------------------------------------------------------------------
async function tryOpenRouterChain(
  messages: ChatMessage[],
  systemPrompt: string,
  apiKey: string,
  temperature: number,
  maxTokens: number
): Promise<string> {
  // Verified free OpenRouter models (queried from /api/v1/models July 2025)
  // Using openrouter/free as primary — OpenRouter auto-routes to best available free model
  const openRouterModels = [
    "openrouter/auto",
    "google/gemma-4-31b-it:free",
    "nvidia/nemotron-3-super-120b-a12b:free",
    "inclusionai/ling-3.0-flash:free",
    "nvidia/nemotron-3-nano-30b-a3b:free",
    "openai/gpt-oss-20b:free",
  ];

  const formattedMessages = [
    { role: "system", content: systemPrompt },
    ...messages.map((m) => ({
      role: m.role === "model" ? "assistant" : m.role,
      content: m.content,
    })),
  ];

  for (const modelName of openRouterModels) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Krrishmay AI",
        },
        body: JSON.stringify({
          model: modelName,
          messages: formattedMessages,
          temperature,
          max_tokens: maxTokens,
        }),
      });

      if (res.status === 429) {
        console.warn(`[OpenRouter Chain] Model ${modelName} 429 Rate Limited. Trying next model...`);
        continue;
      }

      if (!res.ok) {
        const errText = await res.text();
        console.warn(`[OpenRouter Chain] Model ${modelName} error ${res.status}:`, errText);
        continue; // Try next model on any error
      }

      const data = await res.json();
      const text = data.choices?.[0]?.message?.content;
      if (text) return text;
    } catch (err: any) {
      console.warn(`[OpenRouter Chain] Model ${modelName} error:`, err.message || err);
      // Continue to next model
    }
  }

  throw new Error("All OpenRouter free models failed.");
}
