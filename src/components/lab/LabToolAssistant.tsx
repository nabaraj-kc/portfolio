"use client";

import { useState, useRef } from "react";
import { Send, Paperclip, X, Sparkles, Copy, Check, Bot, FileText, Code2, RefreshCw } from "lucide-react";

export interface LabAttachment {
  name: string;
  type: string;
  size: number;
  textContent?: string;
  url?: string;
}

export interface LabMessage {
  role: "user" | "assistant";
  content: string;
}

interface LabToolAssistantProps {
  toolName: string;
  currentToolState?: any;
  initialPromptPills?: string[];
  onApplySuggestion?: (suggestedText: string) => void;
}

export default function LabToolAssistant({
  toolName,
  currentToolState,
  initialPromptPills = ["Explain how this tool works", "Analyze my current input", "Suggest optimizations"],
  onApplySuggestion,
}: LabToolAssistantProps) {
  const [messages, setMessages] = useState<LabMessage[]>([
    {
      role: "assistant",
      content: `Hello! I am your dedicated AI Assistant for **${toolName}**. \n\nYou can chat with me, upload files (PDFs, code files, text documents), or ask for real-time analysis and refactoring recommendations. How can I assist you?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<LabAttachment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const isTextOrCode =
        file.type.startsWith("text/") ||
        file.name.match(/\.(py|ts|js|jsx|tsx|json|csv|md|txt|html|css|cpp|c|java|go|rs|sql|sh)$/i);

      const reader = new FileReader();

      if (isTextOrCode) {
        reader.onload = (event) => {
          setAttachments((prev) => [
            ...prev,
            {
              name: file.name,
              type: file.type || "text/plain",
              size: file.size,
              textContent: event.target?.result as string,
            },
          ]);
        };
        reader.readAsText(file);
      } else {
        // Base64 for PDF or Image
        reader.onload = (event) => {
          setAttachments((prev) => [
            ...prev,
            {
              name: file.name,
              type: file.type || "application/octet-stream",
              size: file.size,
              url: event.target?.result as string,
            },
          ]);
        };
        reader.readAsDataURL(file);
      }
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Send Message Handler
  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim() && attachments.length === 0) return;
    if (isLoading) return;

    const userMessage: LabMessage = {
      role: "user",
      content: textToSend + (attachments.length > 0 ? `\n[Attached ${attachments.length} file(s)]` : ""),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    const currentAttachments = [...attachments];
    setAttachments([]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/lab/tool-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolName,
          messages: newMessages,
          attachments: currentAttachments,
          currentToolState,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to respond");

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `⚠️ **Error:** ${err.message || "Something went wrong."}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="w-full bg-[#FFFFFF] border border-[#8F8F8F]/20 rounded-2xl shadow-whisper overflow-hidden flex flex-col font-sans">
      {/* Header Bar */}
      <div className="bg-[#F3F4F2] px-6 py-4 border-b border-[#8F8F8F]/15 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#16171A] text-[#F3F4F2] flex items-center justify-center">
            <Bot className="w-4 h-4 text-[#C85A17]" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-[#202020] font-sans leading-none">
              {toolName} Assistant
            </h4>
            <span className="font-mono text-[10px] text-[#8F8F8F]">
              POWERED BY CLAUDE ENGINE • CONTEXT-AWARE
            </span>
          </div>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                role: "assistant",
                content: `Chat history reset. How can I help you with **${toolName}**?`,
              },
            ])
          }
          className="font-mono text-xs text-[#8F8F8F] hover:text-[#C85A17] transition-colors uppercase tracking-wider"
        >
          Reset Chat
        </button>
      </div>

      {/* Messages Scroll View */}
      <div className="p-6 space-y-4 max-h-[420px] overflow-y-auto no-scrollbar bg-[#FFFFFF]">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[90%] sm:max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-[#16171A] text-[#F3F4F2] rounded-br-xs font-sans"
                  : "bg-[#F3F4F2] text-[#202020] border border-[#8F8F8F]/15 rounded-bl-xs font-sans"
              }`}
            >
              {/* Message Content Renderer */}
              <div className="whitespace-pre-wrap space-y-2">
                {msg.content.split("\n\n").map((chunk, cIdx) => {
                  // Render Code Blocks
                  if (chunk.startsWith("```")) {
                    const lines = chunk.split("\n");
                    const code = lines.slice(1, -1).join("\n");
                    const lang = lines[0].replace("```", "") || "code";

                    return (
                      <div
                        key={cIdx}
                        className="my-2 bg-[#16171A] text-[#F3F4F2] rounded-xl overflow-hidden border border-[#8F8F8F]/20 font-mono text-xs"
                      >
                        <div className="flex items-center justify-between px-3 py-1.5 bg-[#202226] text-[#8F8F8F] border-b border-[#8F8F8F]/15 text-[10px]">
                          <span>{lang.toUpperCase()}</span>
                          <button
                            onClick={() => copyToClipboard(code, idx)}
                            className="flex items-center gap-1 text-white/70 hover:text-white transition-colors"
                          >
                            {copiedIndex === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedIndex === idx ? "Copied" : "Copy"}</span>
                          </button>
                        </div>
                        <pre className="p-3 overflow-x-auto text-[11px] leading-relaxed">
                          <code>{code}</code>
                        </pre>
                      </div>
                    );
                  }

                  return <p key={cIdx}>{chunk}</p>;
                })}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs font-mono text-[#8F8F8F] py-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#C85A17]" />
            <span>Claude Assistant analyzing files &amp; prompt...</span>
          </div>
        )}
      </div>

      {/* Preset Action Prompt Pills */}
      <div className="px-6 py-2 bg-[#F3F4F2]/50 border-t border-[#8F8F8F]/15 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="font-mono text-[10px] text-[#8F8F8F] uppercase shrink-0">Prompts:</span>
        {initialPromptPills.map((pill, pIdx) => (
          <button
            key={pIdx}
            onClick={() => handleSend(pill)}
            className="shrink-0 font-mono text-[11px] bg-white hover:bg-[#C85A17]/10 hover:text-[#C85A17] border border-[#8F8F8F]/20 px-2.5 py-1 rounded-full text-[#202020]/80 transition-colors"
          >
            {pill}
          </button>
        ))}
      </div>

      {/* File Attachment Preview Strip */}
      {attachments.length > 0 && (
        <div className="px-6 py-2 bg-white border-t border-[#8F8F8F]/15 flex items-center gap-2 flex-wrap">
          {attachments.map((att, aIdx) => (
            <div
              key={aIdx}
              className="inline-flex items-center gap-1.5 bg-[#F3F4F2] text-[#202020] border border-[#8F8F8F]/20 px-2.5 py-1 rounded-lg text-xs font-mono"
            >
              <FileText className="w-3.5 h-3.5 text-[#C85A17]" />
              <span className="truncate max-w-[140px]">{att.name}</span>
              <span className="text-[10px] text-[#8F8F8F]">({(att.size / 1024).toFixed(1)}KB)</span>
              <button
                onClick={() => removeAttachment(aIdx)}
                className="hover:text-red-600 transition-colors ml-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Box Bar */}
      <div className="p-4 bg-white border-t border-[#8F8F8F]/15 flex items-center gap-2">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileUpload}
          className="hidden"
          accept=".pdf,.txt,.py,.ts,.js,.jsx,.tsx,.json,.csv,.md,.html,.css,.cpp,.java,.rs,.sql"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          title="Upload file or code snippet"
          className="p-2.5 rounded-xl bg-[#F3F4F2] hover:bg-[#8F8F8F]/20 text-[#202020] transition-colors shrink-0"
        >
          <Paperclip className="w-4 h-4 text-[#8F8F8F]" />
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={`Ask ${toolName} assistant or upload code/file...`}
          className="flex-grow bg-[#F3F4F2] border border-[#8F8F8F]/20 rounded-xl px-4 py-2.5 text-xs font-mono text-[#202020] focus:outline-none focus:border-[#C85A17]"
        />

        <button
          onClick={() => handleSend()}
          disabled={isLoading || (!input.trim() && attachments.length === 0)}
          className="p-2.5 rounded-xl bg-[#16171A] hover:bg-[#C85A17] text-white disabled:opacity-40 transition-colors shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
