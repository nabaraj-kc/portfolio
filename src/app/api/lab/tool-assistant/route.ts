import { NextResponse } from "next/server";
import { getLabToolSystemPrompt } from "@/lib/ai-prompts";
import { checkRateLimit } from "@/lib/rate-limiter";

export const runtime = "nodejs";

// Streaming tool assistant using Server-Sent Events
export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "client-ip";
    const rl = checkRateLimit(`tool-assistant-${ip}`, { limit: 30, windowMs: 60 * 1000 });
    
    if (!rl.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait a minute before making more AI requests." },
        { status: 429 }
      );
    }

    const { toolName, messages, attachments = [], currentToolState, skipThinking } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format." }, { status: 400 });
    }

    const toolContextPrompt = getLabToolSystemPrompt(toolName || "Lab Tool", currentToolState);

    // Use streaming via ReadableStream
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        let lastError: any = null;

        try {
          const geminiKey = process.env.GEMINI_API_KEY;
          const apiKey = process.env.OPENROUTER_API_KEY;

          // Build messages
          const processedMessages = [...messages];
          if (attachments.length > 0 && processedMessages.length > 0) {
            const lastMsgIndex = processedMessages.length - 1;
            const attachmentTexts = attachments
              .map((att: any) => {
                if (att.textContent) {
                  return `\n\n[ATTACHED FILE: ${att.name}]\n--- FILE CONTENT ---\n${att.textContent}\n--- END ---`;
                }
                return `\n\n[ATTACHED FILE: ${att.name} (Type: ${att.type})]`;
              })
              .join("");
            processedMessages[lastMsgIndex] = {
              ...processedMessages[lastMsgIndex],
              content: `${processedMessages[lastMsgIndex].content}${attachmentTexts}`,
            };
          }

          // 1. Try Native Gemini Streaming with Failover
          if (geminiKey) {
            const geminiModels = [
              "gemini-2.0-flash",
              "gemini-1.5-flash",
              "gemini-1.5-pro",
            ];

            const { GoogleGenerativeAI } = await import("@google/generative-ai");
            const genAI = new GoogleGenerativeAI(geminiKey);

            for (const modelName of geminiModels) {
              try {
                console.log(`[Lab Tool API] Trying Gemini model: ${modelName}`);
                const geminiModel = genAI.getGenerativeModel({ 
                  model: modelName,
                  systemInstruction: toolContextPrompt
                });
                
                const history = processedMessages.slice(0, -1).map((m: any) => ({
                  role: m.role === "assistant" ? "model" : "user",
                  parts: [{ text: m.content }]
                }));
                const lastMsg = processedMessages[processedMessages.length - 1]?.content || "";

                const chat = geminiModel.startChat({ history });
                const result = await chat.sendMessageStream(lastMsg);
                
                for await (const chunk of result.stream) {
                  const chunkText = chunk.text();
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token: chunkText })}\n\n`));
                }
                controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                controller.close();
                return; // End here if successful
              } catch (geminiErr: any) {
                console.warn(`[Lab Tool API] Gemini model ${modelName} failed:`, geminiErr.message || geminiErr);
                lastError = geminiErr;
              }
            }
          }

          // 2. Fallback to OpenRouter if Gemini fails or no key
          if (apiKey) {
            const formattedMessages = [
              { role: "system", content: toolContextPrompt },
              ...processedMessages.map((m: any) => ({
                role: m.role === "model" ? "assistant" : m.role,
                content: m.content,
              })),
            ];

            const openRouterModels = [
              "google/gemini-2.5-flash",
              "google/gemini-2.5-flash:free",
              "openrouter/auto"
            ];

            for (const modelName of openRouterModels) {
              try {
                console.log(`[Lab Tool API] Trying OpenRouter model: ${modelName}`);
                const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`,
                    "HTTP-Referer": "http://localhost:3000",
                    "X-Title": "Krrishmay Labs",
                  },
                  body: JSON.stringify({
                    model: modelName,
                    messages: formattedMessages,
                    stream: true,
                    temperature: 0.7,
                    max_tokens: 4096,
                  }),
                });

                if (res.ok && res.body) {
                  const reader = res.body.getReader();
                  const decoder = new TextDecoder();

                  while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split("\n");
                    for (const line of lines) {
                      if (line.startsWith("data: ")) {
                        const data = line.slice(6).trim();
                        if (data === "[DONE]") continue;
                        try {
                          const parsed = JSON.parse(data);
                          const token = parsed.choices?.[0]?.delta?.content;
                          if (token) {
                            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token })}\n\n`));
                          }
                        } catch {}
                      }
                    }
                  }
                  controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                  controller.close();
                  return;
                } else {
                  const errText = await res.text();
                  console.warn(`[Lab Tool API] OpenRouter model ${modelName} response not OK:`, errText);
                  lastError = new Error(`OpenRouter response error: ${errText}`);
                }
              } catch (orErr: any) {
                console.warn(`[Lab Tool API] OpenRouter model ${modelName} failed:`, orErr.message || orErr);
                lastError = orErr;
              }
            }
          }

          // If we reach here, all providers failed
          const errMsg = lastError?.message || "All translation API models failed or rate-limited.";
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: errMsg })}\n\n`));
          controller.close();
        } catch (err: any) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: err.message || "Failed" })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("Lab Tool Assistant API Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to generate response." }, { status: 500 });
  }
}
