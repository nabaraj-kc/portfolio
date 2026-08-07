"use client";

import { useState, useEffect } from "react";
import Sidebar, { SavedChat } from "@/components/chatbot/Sidebar";
import ModelSelector from "@/components/chatbot/ModelSelector";
import GreetingBlock from "@/components/chatbot/GreetingBlock";
import ChatInputCard from "@/components/chatbot/ChatInputCard";
import MessageList from "@/components/chatbot/MessageList";
import { Message } from "@/components/chatbot/MessageBubble";
import { Sparkles, Code, Compass, Terminal, BookOpen, Clock, Layers, ArrowRight, Menu, Plus } from "lucide-react";

export default function KrrishmayPage() {
  const [activeNav, setActiveNav] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState("krrishmay-4o");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Database Chats State
  const [savedChats, setSavedChats] = useState<SavedChat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  const userName = "Judha";
  const isDark = theme === "dark";

  // Fetch saved chats on mount
  const fetchChats = async () => {
    try {
      const res = await fetch("/api/chats");
      const data = await res.json();
      if (Array.isArray(data)) {
        setSavedChats(data);
      }
    } catch (e) {
      console.error("Failed to load chats:", e);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  // Save current chat to MongoDB whenever messages update
  const saveChatToDB = async (updatedMessages: Message[], chatIdToUse: string | null) => {
    if (updatedMessages.length === 0) return;

    try {
      const res = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: chatIdToUse,
          messages: updatedMessages,
          model: selectedModel,
          title: updatedMessages[0]?.content?.slice(0, 32) + "...",
        }),
      });
      const data = await res.json();
      if (data.chatId && !chatIdToUse) {
        setActiveChatId(data.chatId);
      }
      fetchChats();
    } catch (e) {
      console.error("Failed to save chat to DB:", e);
    }
  };

  // Helper to parse <thought> tags
  const parseThoughtAndContent = (raw: string) => {
    const match = raw.match(/<thought>([\s\S]*?)<\/thought>/);
    if (match) {
      return {
        thought: match[1].trim(),
        content: raw.replace(/<thought>[\s\S]*?<\/thought>/, "").trim(),
      };
    }
    return { thought: undefined, content: raw };
  };

  // Handle Send Message
  const handleSend = async (userText: string, activePills: string[], attachments: any[] = []) => {
    if ((!userText.trim() && attachments.length === 0) || isGenerating) return;

    // Attach file descriptions to content if present
    let fullContent = userText;
    if (attachments.length > 0) {
      const fileNames = attachments.map((a) => `[File Attached: ${a.name}]`).join("\n");
      fullContent = `${fullContent}\n\n${fileNames}`;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: fullContent,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsGenerating(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          attachments,
          activePills,
          isDeepThink: activePills.includes("reasoning"),
          model: selectedModel,
        }),
      });

      const data = await response.json();

      let assistantMessage: Message;

      if (data.error) {
        assistantMessage = {
          id: Date.now().toString(),
          role: "assistant",
          content: "Core AI systems offline. Missing API Key.",
        };
      } else {
        const { thought, content } = parseThoughtAndContent(data.reply || "");
        assistantMessage = {
          id: Date.now().toString(),
          role: "assistant",
          content: content || "*(Empty response)*",
          thought,
        };
      }

      const finalMessages = [...newMessages, assistantMessage];
      setMessages(finalMessages);
      saveChatToDB(finalMessages, activeChatId);
    } catch (e) {
      console.error(e);
      const errMsg: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "Connection to core systems severed.",
      };
      const finalMessages = [...newMessages, errMsg];
      setMessages(finalMessages);
      saveChatToDB(finalMessages, activeChatId);
    } finally {
      setIsGenerating(false);
    }
  };

  // Start New Chat
  const handleNewChat = () => {
    setMessages([]);
    setActiveChatId(null);
    setActiveNav("home");
  };

  // Select Saved Chat
  const handleSelectChat = (chat: SavedChat) => {
    setActiveChatId(chat._id);
    setMessages(chat.messages || []);
    if (chat.model) setSelectedModel(chat.model);
  };

  // Delete Saved Chat
  const handleDeleteChat = async (chatId: string) => {
    try {
      await fetch("/api/chats", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId }),
      });
      if (activeChatId === chatId) {
        handleNewChat();
      }
      fetchChats();
    } catch (e) {
      console.error("Failed to delete chat:", e);
    }
  };

  return (
    <div
      className={`flex h-screen w-screen overflow-hidden font-sans transition-colors duration-200 ${
        isDark ? "bg-[#050505] text-white" : "bg-[#FAFBFE] text-[#1F2023]"
      }`}
    >
      {/* 1. Sidebar */}
      <Sidebar
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        savedChats={savedChats}
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        onNewChat={handleNewChat}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        theme={theme}
        onToggleTheme={() => setTheme(isDark ? "light" : "dark")}
        isMobileOpen={isSidebarOpen}
        setIsMobileOpen={setIsSidebarOpen}
      />

      {/* 2. Main Panel */}
      <main className={`flex-1 h-screen flex flex-col relative overflow-hidden transition-colors ${isDark ? "bg-[#0A0A0A]" : "bg-[#FAFBFE]"}`}>
        
        {/* Top Bar with Hamburger, Model Selector & New Chat */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-3 pointer-events-auto">
            <button 
              className="md:hidden p-2 rounded-lg bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] shadow-sm"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            <ModelSelector currentModel={selectedModel} onSelectModel={setSelectedModel} />
          </div>
          
          <button
            onClick={handleNewChat}
            className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#C85A17]/10 hover:bg-[#C85A17]/25 text-[#C85A17] border border-[#C85A17]/30 text-xs font-mono font-medium transition-colors"
            title="Start a new chat session"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto flex flex-col justify-between pt-16 pb-6 px-4">
          
          {/* View 1: Home View (Chat / Greeting) */}
          {activeNav === "home" && (
            <>
              {messages.length === 0 ? (
                <div className="flex-1 flex flex-col justify-center items-center my-auto w-full max-w-[680px] mx-auto px-2">
                  <GreetingBlock userName={userName} accentText="Assist You Today?" />
                  
                  {/* Intelligent Starter Chips */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full mt-6">
                    {[
                      { label: "Architecture Overview", prompt: "Explain the multi-agent consensus architecture in O AI OS" },
                      { label: "Sub-Second Voice AI", prompt: "Summarize the research paper on Sub-Second Speculative Decoding" },
                      { label: "CardioRisk AI Model", prompt: "How does CardioRisk AI evaluate cardiac risk using PyTorch?" },
                      { label: "Publish AI Article", prompt: "Write an article about Voice AI Agents and publish it" },
                    ].map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(chip.prompt, ["reasoning"])}
                        className={`text-left p-3.5 rounded-xl border text-xs transition-all flex flex-col justify-between gap-1 hover:border-[#C85A17] group ${
                          isDark
                            ? "bg-[#111] border-[#222] text-gray-300 hover:text-white"
                            : "bg-white border-gray-200/80 text-gray-700 hover:text-black shadow-2xs"
                        }`}
                      >
                        <span className="font-semibold text-[#C85A17] font-mono text-[10px] uppercase tracking-wider">
                          {chip.label}
                        </span>
                        <span className="line-clamp-2 leading-relaxed opacity-90 group-hover:opacity-100">
                          {chip.prompt}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex-1 w-full">
                  <MessageList messages={messages} isGenerating={isGenerating} theme={theme} />
                </div>
              )}

              {/* Input Card */}
              <div className="w-full max-w-[680px] mx-auto pt-4 flex-shrink-0">
                <ChatInputCard onSend={handleSend} isGenerating={isGenerating} theme={theme} />
              </div>
            </>
          )}

          {/* View 2: Explore Tab */}
          {activeNav === "explore" && (
            <div className="flex-1 max-w-4xl mx-auto w-full py-8 space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Explore Capabilities</h2>
                <p className="text-sm text-[#8A8F98]">Discover featured AI workflows and prompt templates.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: "Deep Research Mode", desc: "Synthesize academic papers and system architectures.", icon: Compass },
                  { title: "Code & Prototype Generation", desc: "Build Next.js components, APIs, and database schemas.", icon: Code },
                  { title: "Reasoning & DeepThink", desc: "Multi-step logical reasoning with visible thought logs.", icon: Terminal },
                  { title: "Multi-LLM Swarm", desc: "Compare outputs from Gemini, Mistral, and DeepSeek R1.", icon: Layers },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setActiveNav("home");
                        handleSend(`Initiate template: ${item.title}`, ["reasoning"]);
                      }}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer group ${
                        isDark ? "bg-[#111] border-[#222] hover:border-[#C85A17]" : "bg-white border-[#E8E9ED] hover:border-[#C85A17] shadow-xs"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-[#C85A17]/10 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-[#C85A17]" />
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#8A8F98] group-hover:translate-x-1 transition-transform" />
                      </div>
                      <h3 className="font-semibold text-base mb-1">{item.title}</h3>
                      <p className="text-xs text-[#8A8F98] leading-relaxed">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* View 3: Library Tab */}
          {activeNav === "library" && (
            <div className="flex-1 max-w-4xl mx-auto w-full py-8 space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Your Saved Library</h2>
                <p className="text-sm text-[#8A8F98]">Saved system configs, code snippets, and notes.</p>
              </div>

              <div className={`p-6 rounded-2xl border ${isDark ? "bg-[#111] border-[#222]" : "bg-white border-[#E8E9ED]"}`}>
                <div className="flex items-center gap-3 mb-4">
                  <BookOpen className="w-5 h-5 text-[#C85A17]" />
                  <span className="font-mono text-sm font-semibold">O AI OS System Specifications</span>
                </div>
                <p className="text-xs text-[#8A8F98] leading-relaxed mb-4">
                  All AI sessions utilize the dynamic system prompt stored in your MongoDB `aiconfig` collection. You can customize model temperature, max output tokens, and hardware hooks via the Admin panel.
                </p>
              </div>
            </div>
          )}

          {/* View 4: History Tab */}
          {activeNav === "history" && (
            <div className="flex-1 max-w-4xl mx-auto w-full py-8 space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Full Chat History</h2>
                <p className="text-sm text-[#8A8F98]">Manage all past conversations stored in MongoDB.</p>
              </div>

              <div className="space-y-2">
                {savedChats.length === 0 ? (
                  <p className="text-sm text-[#8A8F98]">No chat history found.</p>
                ) : (
                  savedChats.map((chat) => (
                    <div
                      key={chat._id}
                      onClick={() => {
                        handleSelectChat(chat);
                        setActiveNav("home");
                      }}
                      className={`p-4 rounded-xl border flex items-center justify-between transition-colors cursor-pointer ${
                        isDark ? "bg-[#111] border-[#222] hover:bg-[#1A1A1A]" : "bg-white border-[#E8E9ED] hover:bg-[#F0F1FA]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-[#C85A17]" />
                        <div>
                          <p className="font-medium text-sm">{chat.title}</p>
                          <p className="text-xs text-[#8A8F98] font-mono">
                            {new Date(chat.updatedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteChat(chat._id);
                        }}
                        className="px-3 py-1.5 text-xs text-red-500 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
