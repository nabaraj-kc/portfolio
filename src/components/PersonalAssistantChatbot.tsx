"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { MessageSquare, X, Send, Sparkles, Loader2, Minimize2, User, Bot, ExternalLink } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export default function PersonalAssistantChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    // Input Validation Guardrail
    const isGreeting = ["hi", "hello", "hey", "sup", "yo"].includes(query.toLowerCase());
    if (query.length < 3 && !isGreeting) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "user",
          content: query,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Could you please provide a bit more context? I'm here to answer detailed questions about Nabaraj's work, experience, and projects.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setInput("");
      return;
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const apiMessages = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          model: "krrishmay-4o",
        }),
      });

      const data = await res.json();
      
      // Fallback Fix: If data.reply is explicitly empty but successful, that's unusual.
      // But we prevent falling back to a hardcoded string if there's an actual response object.
      let replyText = data.reply || data.response;
      if (!replyText) {
         if (data.error) replyText = `Error: ${data.error}`;
         else replyText = "I encountered an issue processing that. Could you try asking in a different way?";
      }

      // Clean out any raw thought tags
      replyText = replyText.replace(/<thought>[\s\S]*?<\/thought>/g, "").trim();

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, I encountered a network issue. You can reach out directly via email at nabarajkc43@gmail.com or phone at +977 9761696109.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const starterChips = [
    { label: "Who is Nabaraj?", prompt: "Who is Nabaraj KC and what does he do?" },
    { label: "Tech Stack & Skills", prompt: "What are Nabaraj's primary technical skills and architecture focus?" },
    { label: "Research & Projects", prompt: "Tell me about Nabaraj's research papers and portfolio projects." },
    { label: "Contact Details", prompt: "How can I contact Nabaraj KC directly?" },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .chatbot-scrollbar::-webkit-scrollbar { width: 5px; }
        .chatbot-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .chatbot-scrollbar::-webkit-scrollbar-thumb { background: #E8E8E6; border-radius: 4px; }
        .chatbot-scrollbar::-webkit-scrollbar-thumb:hover { background: #D1D1D1; }
      `}} />

      {/* Floating Trigger Button - Z-index fixed */}
      <div className="fixed bottom-6 right-6 z-[100]">
        {!isOpen && (
          <div className="absolute -top-10 right-0 pointer-events-none hidden sm:block whitespace-nowrap">
            <span className="bg-[#202020] text-[#F5F1E8] text-[11px] font-mono px-3 py-1.5 rounded-full shadow-lg border border-white/10 animate-bounce">
              Ask Nabaraj's AI Assistant ✨
            </span>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 cursor-pointer relative ${
            isOpen
              ? "bg-[#202020] text-[#F5F1E8] border border-white/20"
              : "bg-[#C85A17] text-white hover:bg-[#B24D11]"
          }`}
          aria-label="Open Personal AI Assistant"
        >
          {/* Online green indicator dot */}
          {!isOpen && (
            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
          )}

          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <div className="relative w-8 h-8 flex items-center justify-center">
              <Image
                src="/icon.svg"
                alt="AI Assistant Logo"
                width={28}
                height={28}
                className="object-contain"
                unoptimized
              />
            </div>
          )}
        </button>
      </div>

      {/* Floating Popup Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-32px)] sm:w-[390px] h-[530px] max-h-[82vh] bg-white border border-[#8F8F8F]/25 rounded-2xl shadow-2xl z-[100] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          
          {/* Header - Flexbox refactored */}
          <div className="bg-[#202020] text-[#F5F1E8] px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8 rounded-full bg-[#C85A17]/20 border border-[#C85A17] flex items-center justify-center overflow-hidden shrink-0">
                <Image
                  src="/icon.svg"
                  alt="Nabaraj AI"
                  width={20}
                  height={20}
                  className="object-contain"
                  unoptimized
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-semibold text-sm tracking-tight text-white leading-none">
                    Nabaraj's AI Assistant
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse mt-0.5" />
                </div>
                <p className="font-mono text-[9px] text-white/60 uppercase tracking-wider mt-1 leading-none">
                  Krrishmay AI Engine • Live Knowledge
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-white/60 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10 shrink-0"
              title="Close chat"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area - Gap 3 (12px), Scrollbar customized */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAFAF8] chatbot-scrollbar">
            {/* Welcome Bubble */}
            <div className="flex gap-2 items-end">
              <div className="w-6 h-6 rounded-full bg-[#C85A17]/20 border border-[#C85A17] flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                <Image src="/icon.svg" alt="Nabaraj AI" width={14} height={14} className="object-contain" unoptimized />
              </div>
              <div className="bg-white border border-[#8F8F8F]/20 rounded-2xl rounded-bl-sm px-3.5 py-3 text-[13px] text-[#202020] leading-relaxed shadow-xs max-w-[85%] relative pb-6">
                <p className="font-medium text-[#C85A17] mb-1 font-mono text-[11px]">Hi there! 👋</p>
                I'm Nabaraj KC's personal AI assistant. I have full live knowledge of his background, research papers, portfolio projects, skills, and contact details. Ask me anything!
                <span className="absolute bottom-1.5 right-2.5 text-[10px] font-mono text-[#8F8F8F]/70">
                  {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>

            {/* Starter Prompt Chips */}
            {messages.length === 0 && (
              <div className="space-y-1.5 pt-2 pl-8">
                <p className="font-mono text-[10px] uppercase tracking-wider text-[#8F8F8F] px-1 font-semibold">
                  Suggested Questions:
                </p>
                <div className="flex flex-col gap-1.5">
                  {starterChips.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(chip.prompt)}
                      className="text-left px-3 py-2 rounded-xl bg-white border border-[#8F8F8F]/20 hover:border-[#C85A17] text-[11px] text-[#202020] hover:text-[#C85A17] transition-all flex items-center justify-between group shadow-2xs"
                    >
                      <span className="font-mono font-medium">{chip.label}</span>
                      <span className="text-[10px] text-[#8F8F8F] group-hover:text-[#C85A17]">→</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Conversation Messages */}
            {messages.map((msg, index) => {
              const isUser = msg.role === "user";
              const showAvatar = index === 0 || messages[index - 1].role !== msg.role || messages.length - 1 === index;
              const nextIsSame = index < messages.length - 1 && messages[index + 1].role === msg.role;
              
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2 items-end ${isUser ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center overflow-hidden shrink-0 shadow-xs transition-opacity ${
                      showAvatar ? "opacity-100" : "opacity-0 invisible"
                    } ${isUser ? "bg-[#202020] text-[#F5F1E8]" : "bg-[#C85A17]/20 border border-[#C85A17]"}`}
                  >
                    {isUser ? <User className="w-3.5 h-3.5" /> : <Image src="/icon.svg" alt="Nabaraj AI" width={14} height={14} className="object-contain" unoptimized />}
                  </div>

                  <div
                    className={`rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed max-w-[85%] shadow-xs relative pb-5 ${
                      isUser
                        ? `bg-[#202020] text-[#F5F1E8] ${nextIsSame ? "rounded-br-sm" : "rounded-br-sm"}` // Keep simple border radius for now, can refine later
                        : `bg-white border border-[#8F8F8F]/20 text-[#202020] ${nextIsSame ? "rounded-bl-sm" : "rounded-bl-sm"}`
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    <span
                      className={`absolute bottom-1 right-2.5 text-[10px] font-mono leading-none ${
                        isUser ? "text-white/50" : "text-[#8F8F8F]/70"
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex gap-2 items-end">
                <div className="w-6 h-6 rounded-full bg-[#C85A17]/20 border border-[#C85A17] flex items-center justify-center overflow-hidden shrink-0">
                  <Image src="/icon.svg" alt="Nabaraj AI" width={14} height={14} className="object-contain" unoptimized />
                </div>
                <div className="bg-white border border-[#8F8F8F]/20 rounded-2xl rounded-bl-sm px-4 py-3 text-xs text-[#8F8F8F] flex items-center gap-2 shadow-xs">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C85A17]" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-white border-t border-[#8F8F8F]/20 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about Nabaraj's work..."
                className="flex-1 bg-[#FAFAF8] border border-[#8F8F8F]/25 rounded-xl px-3.5 py-2.5 text-xs text-[#202020] placeholder-[#8F8F8F]/60 focus:outline-none focus:border-[#C85A17] focus:ring-1 focus:ring-[#C85A17]/30 transition-all font-sans"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="p-2.5 rounded-xl bg-[#202020] text-[#F5F1E8] hover:bg-[#C85A17] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
                title="Send message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
            <div className="mt-2 flex items-center justify-between text-[9px] font-mono text-[#8F8F8F] px-1">
              <span>Powered by Krrishmay AI</span>
              <a
                href="https://krrishmay.nabarajkc.com.np"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#C85A17] inline-flex items-center gap-0.5"
              >
                Full Chat Platform <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
