"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Paperclip, X, FileText, RotateCcw, Check, Copy, Maximize2, Minimize2 } from "lucide-react";
import Image from "next/image";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Attachment {
  name: string;
  textContent?: string;
  url?: string;
  type: string;
  size: number;
}

interface LabChatPanelProps {
  toolName: string;
  currentToolState?: any;
  className?: string;
  initialMessage?: string;
  compact?: boolean;
}

export default function LabChatPanel({
  toolName,
  currentToolState,
  className = "",
  initialMessage,
  compact = false,
}: LabChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        initialMessage ||
        `Hello! I'm your ${toolName} assistant. Ask me anything or attach files — I'll help you get the best results.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [copied, setCopied] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Esc key to exit fullscreen
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isFullscreen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming, isFullscreen]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((f) => {
      const reader = new FileReader();
      const isText =
        f.type.startsWith("text/") ||
        f.name.match(/\.(py|ts|js|tsx|jsx|json|csv|md|txt|html|css|java|go|rs|sql|c|cpp|h|yaml|yml)$/i);
      if (isText) {
        reader.onload = (ev) =>
          setAttachments((p) => [
            ...p,
            { name: f.name, textContent: ev.target?.result as string, type: f.type, size: f.size },
          ]);
        reader.readAsText(f);
      } else {
        reader.onload = (ev) =>
          setAttachments((p) => [
            ...p,
            { name: f.name, url: ev.target?.result as string, type: f.type, size: f.size },
          ]);
        reader.readAsDataURL(f);
      }
    });
    if (fileRef.current) fileRef.current.value = "";
  };

  const send = useCallback(
    async (override?: string) => {
      const text = override || input;
      if ((!text.trim() && attachments.length === 0) || loading) return;

      const userMsg: Message = {
        role: "user",
        content: text + (attachments.length > 0 ? `\n[Attached: ${attachments.map((a) => a.name).join(", ")}]` : ""),
      };
      const history = [...messages, userMsg];
      setMessages(history);
      setInput("");
      const atts = [...attachments];
      setAttachments([]);
      setLoading(true);
      setStreaming("");

      abortRef.current = new AbortController();

      try {
        const res = await fetch("/api/lab/tool-assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            toolName,
            messages: history,
            attachments: atts,
            currentToolState,
          }),
          signal: abortRef.current.signal,
        });

        if (!res.ok || !res.body) {
          const err = await res.json().catch(() => ({ error: "Request failed" }));
          throw new Error(err.error || "Request failed");
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.error) throw new Error(parsed.error);
              if (parsed.token) {
                accumulated += parsed.token;
                setStreaming(accumulated);
              }
            } catch (parseErr) {}
          }
        }

        setMessages((prev) => [...prev, { role: "assistant", content: accumulated || "..." }]);
        setStreaming("");
      } catch (err: any) {
        if (err.name === "AbortError") return;
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `⚠️ ${err.message || "Something went wrong."}` },
        ]);
        setStreaming("");
      } finally {
        setLoading(false);
      }
    },
    [input, attachments, messages, loading, toolName, currentToolState]
  );

  const pills = [
    "Summarize the results",
    "How can I improve this?",
    "What are the key issues?",
  ];

  const copyMsg = (idx: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(idx);
    setTimeout(() => setCopied(null), 1800);
  };

  const cleanText = (t: string) => {
    return t
      .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold
      .replace(/__(.*?)__/g, "$1") // Remove bold alternate
      .replace(/^###?\s+/gm, "") // Remove headers
      .replace(/^[-*]\s+/gm, "• "); // Replace markdown list bullets with clean dot
  };

  return (
    <div 
      className={`flex flex-col bg-white overflow-hidden transition-all duration-300 ${
        isFullscreen 
          ? "fixed inset-0 z-50 rounded-none shadow-2xl" 
          : `rounded-2xl border border-[#E8E8E6] ${className}`
      }`}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#E8E8E6] bg-[#FAFAF9] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-black overflow-hidden flex items-center justify-center shrink-0 shadow-sm border border-black/10">
            <img src="/ai-logo.svg" alt="AI Logo" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = "/globe.svg")} />
          </div>
          <div className="leading-none">
            <p className="text-[13px] font-semibold text-[#1A1A1A]">AI Assistant</p>
            <p className="text-[10px] text-[#9B9B98] mt-0.5 font-mono uppercase tracking-wider">
              {toolName} · Streaming
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg text-[#9B9B98] hover:text-[#1A1A1A] hover:bg-[#F0F0EE] transition-colors"
            title={isFullscreen ? "Exit Fullscreen (Esc)" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <div className="w-px h-4 bg-[#E8E8E6] mx-1" />
          <button
            onClick={() => {
              abortRef.current?.abort();
              setMessages([
                {
                  role: "assistant",
                  content:
                    initialMessage ||
                    `Hello! I'm your ${toolName} assistant. Ask me anything!`,
                },
              ]);
              setStreaming("");
              setLoading(false);
            }}
            className="p-1.5 rounded-lg text-[#9B9B98] hover:text-[#1A1A1A] hover:bg-[#F0F0EE] transition-colors"
            title="Clear chat"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className={`flex-1 overflow-y-auto p-4 min-h-0 ${isFullscreen ? 'bg-[#FAFAF9]' : ''}`}>
        <div className={`mx-auto w-full space-y-4 ${isFullscreen ? 'max-w-3xl py-4' : 'max-w-none'}`}>
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              {m.role === "assistant" && (
                <div className="w-7 h-7 rounded-full bg-black overflow-hidden border border-[#E8E8E6] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <img src="/ai-logo.svg" alt="AI" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = "/globe.svg")} />
                </div>
              )}
              <div
                className={`group relative max-w-[85%] rounded-2xl px-4 py-3 text-[14px] leading-relaxed ${
                  m.role === "user"
                    ? "bg-[#1A1A1A] text-white rounded-br-sm shadow-sm"
                    : "bg-white text-[#1A1A1A] border border-[#E8E8E6] rounded-bl-sm shadow-sm"
                }`}
              >
                {m.content.split(/```([^`]*?)```/g).map((part, pi) => {
                  if (pi % 2 === 1) {
                    const firstNewline = part.indexOf("\n");
                    const lang = firstNewline > -1 ? part.slice(0, firstNewline) : "";
                    const code = firstNewline > -1 ? part.slice(firstNewline + 1) : part;
                    return (
                      <div key={pi} className="my-3 rounded-xl overflow-hidden bg-[#1A1A1A] text-sm font-mono border border-white/10">
                        {lang && (
                          <div className="px-3 py-1.5 bg-[#2A2A2A] text-[#9B9B98] text-[10px] uppercase tracking-wider flex justify-between items-center">
                            <span>{lang}</span>
                            <button
                              onClick={() => copyMsg(i * 100 + pi, code)}
                              className="hover:text-white transition-colors p-1"
                            >
                              {copied === i * 100 + pi ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        )}
                        <pre className="p-4 overflow-x-auto text-[#E0E0DC] text-[13px] leading-relaxed"><code>{code}</code></pre>
                      </div>
                    );
                  }
                  return <span key={pi} className="whitespace-pre-wrap">{cleanText(part)}</span>;
                })}
                {m.role === "assistant" && (
                  <button
                    onClick={() => copyMsg(i, m.content)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-md bg-white/80 backdrop-blur-sm border border-[#E8E8E6] text-[#9B9B98] hover:text-[#1A1A1A] transition-all shadow-sm"
                  >
                    {copied === i ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Streaming message */}
          {streaming && (
            <div className="flex gap-3 justify-start">
              <div className="w-7 h-7 rounded-full bg-black overflow-hidden border border-[#E8E8E6] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                <img src="/ai-logo.svg" alt="AI" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = "/globe.svg")} />
              </div>
              <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-white border border-[#E8E8E6] px-4 py-3 text-[14px] text-[#1A1A1A] leading-relaxed shadow-sm">
                <span className="whitespace-pre-wrap">{cleanText(streaming)}</span>
                <span className="inline-block w-1.5 h-4 bg-violet-500 ml-1 animate-pulse align-middle rounded-sm" />
              </div>
            </div>
          )}

          {/* Loading dots */}
          {loading && !streaming && (
            <div className="flex gap-3 justify-start">
              <div className="w-7 h-7 rounded-full bg-black overflow-hidden border border-[#E8E8E6] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                <img src="/ai-logo.svg" alt="AI" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = "/globe.svg")} />
              </div>
              <div className="bg-white border border-[#E8E8E6] rounded-2xl rounded-bl-sm px-5 py-4 flex gap-1.5 items-center shadow-sm h-[46px]">
                {[0, 1, 2].map((d) => (
                  <div
                    key={d}
                    className="w-1.5 h-1.5 rounded-full bg-[#9B9B98] animate-bounce"
                    style={{ animationDelay: `${d * 120}ms` }}
                  />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className={`shrink-0 bg-white border-t border-[#E8E8E6] ${isFullscreen ? 'bg-[#FAFAF9]' : ''}`}>
        <div className={`mx-auto w-full ${isFullscreen ? 'max-w-3xl' : 'max-w-none'}`}>
          
          {/* Prompt pills */}
          {!compact && (
            <div className={`px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar ${isFullscreen ? '' : 'bg-[#FAFAF9] border-b border-[#E8E8E6]'}`}>
              {pills.map((p, i) => (
                <button
                  key={i}
                  onClick={() => send(p)}
                  disabled={loading}
                  className="shrink-0 text-[12px] font-medium px-4 py-2 rounded-full border border-[#E8E8E6] text-[#5C5C5A] hover:border-[#1A1A1A] hover:text-[#1A1A1A] transition-colors bg-white shadow-sm whitespace-nowrap"
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="px-4 pt-3 flex gap-2 flex-wrap">
              {attachments.map((a, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 bg-[#FAFAF9] border border-[#E8E8E6] rounded-lg px-3 py-2 text-[12px] text-[#1A1A1A] shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                  <span className="max-w-[150px] truncate font-mono">{a.name}</span>
                  <button
                    onClick={() => setAttachments((p) => p.filter((_, j) => j !== i))}
                    className="text-[#9B9B98] hover:text-red-500 transition-colors ml-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-4 py-4 flex items-end gap-3">
            <input ref={fileRef} type="file" multiple onChange={handleFile} className="hidden" />
            <button
              onClick={() => fileRef.current?.click()}
              className="w-10 h-10 rounded-xl bg-[#FAFAF9] border border-[#E8E8E6] hover:border-[#1A1A1A]/30 flex items-center justify-center shrink-0 mb-0.5 transition-colors shadow-sm"
            >
              <Paperclip className="w-4 h-4 text-[#9B9B98]" />
            </button>
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Ask anything... (Shift+Enter for new line)"
              className="flex-1 bg-white border border-[#E8E8E6] rounded-xl px-4 py-3 text-[14px] text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]/40 focus:ring-4 focus:ring-black/5 transition-all resize-none placeholder:text-[#B5B5B0] max-h-[200px] leading-relaxed shadow-sm"
              style={{ minHeight: 46 }}
            />
            <button
              onClick={() => send()}
              disabled={loading || (!input.trim() && attachments.length === 0)}
              className="w-10 h-10 rounded-xl bg-[#1A1A1A] hover:bg-violet-600 disabled:opacity-40 text-white flex items-center justify-center shrink-0 mb-0.5 transition-colors shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
