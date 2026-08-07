"use client";

import { Search, Home, Compass, BookOpen, Clock, Sparkles, Trash2, Plus, Moon, Sun } from "lucide-react";

export interface SavedChat {
  _id: string;
  title: string;
  updatedAt: string;
  messages: any[];
  model?: string;
}

interface SidebarProps {
  activeNav: string;
  setActiveNav: (nav: string) => void;
  savedChats: SavedChat[];
  activeChatId: string | null;
  onSelectChat: (chat: SavedChat) => void;
  onDeleteChat: (chatId: string) => void;
  onNewChat: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
}

export default function Sidebar({
  activeNav,
  setActiveNav,
  savedChats,
  activeChatId,
  onSelectChat,
  onDeleteChat,
  onNewChat,
  searchQuery,
  setSearchQuery,
  theme,
  onToggleTheme,
  isMobileOpen = false,
  setIsMobileOpen,
}: SidebarProps) {
  const isDark = theme === "dark";

  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "explore", label: "Explore", icon: Compass },
    { id: "library", label: "Library", icon: BookOpen },
    { id: "history", label: "History", icon: Clock },
  ];

  // Filter saved chats by search query
  const filteredChats = (savedChats || []).filter((chat) =>
    chat && chat.title ? chat.title.toLowerCase().includes((searchQuery || "").toLowerCase()) : false
  );

  return (
    <>
      {/* Mobile Overlay Background */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsMobileOpen?.(false)}
        />
      )}
      
      <aside
        className={`fixed md:relative z-50 w-[270px] min-w-[270px] h-screen border-r flex flex-col justify-between select-none overflow-hidden font-sans transition-transform duration-300 ease-in-out ${
          isDark ? "bg-[#0A0A0A] border-[#1F1F1F] text-white" : "bg-[#FAFBFE] border-[#E8E9ED] text-[#1F2023]"
        } ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="flex-1 flex flex-col min-h-0">
        
        {/* 1. Logo & New Chat Row */}
        <div className="px-6 pt-5 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs ${
                isDark ? "bg-[#E5FF00] text-black" : "bg-[#1F2023] text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C85A17]" />
            </div>
            <span className={`font-bold text-[18px] tracking-tight ${isDark ? "text-white" : "text-[#1F2023]"}`}>
              Krrishmay
            </span>
          </div>

          <button
            onClick={onNewChat}
            className={`p-1.5 rounded-lg border transition-colors ${
              isDark
                ? "border-[#222] hover:bg-[#1A1A1A] text-gray-300"
                : "border-[#E8E9ED] hover:bg-[#F0F1FA] text-[#1F2023]"
            }`}
            title="New Chat"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* 2. Search Input */}
        <div className="px-3 mb-4">
          <div
            className={`relative flex items-center w-full h-[44px] border rounded-[10px] px-3 shadow-xs ${
              isDark
                ? "bg-[#111] border-[#222] text-white"
                : "bg-white border-[#E8E9ED] text-[#1F2023]"
            }`}
          >
            <Search className="w-4 h-4 text-[#8A8F98] mr-2.5 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats"
              className="w-full bg-transparent text-[14px] placeholder-[#8A8F98] focus:outline-none"
            />
            <kbd className="hidden sm:inline-flex items-center gap-0.5 border border-[#8A8F98]/30 rounded px-1.5 py-0.5 text-[11px] text-[#8A8F98] font-mono ml-1">
              ⌘
            </kbd>
          </div>
        </div>

        {/* 3. Nav List */}
        <nav className="px-3 space-y-1 mb-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`w-full h-[40px] px-3 rounded-[8px] flex items-center gap-3 text-[15px] font-medium transition-colors cursor-pointer ${
                  isActive
                    ? isDark
                      ? "bg-[#1A1A1A] text-white"
                      : "bg-[#F0F1FA] text-[#1F2023]"
                    : isDark
                      ? "text-gray-400 hover:bg-[#111] hover:text-white"
                      : "text-[#1F2023]/85 hover:bg-[#F4F5FB]"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? "text-[#C85A17]" : "text-[#8A8F98]"
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* 4. History List (Loaded dynamically from DB) */}
        <div className="flex-1 overflow-y-auto px-3 pb-4 scrollbar-none">
          <div className="mt-4">
            <p className="text-[12px] font-semibold uppercase tracking-[0.04em] text-[#8A8F98] px-3 mb-2">
              Recent Chats
            </p>
            <div className="space-y-0.5">
              {filteredChats.length === 0 ? (
                <p className="px-3 text-[13px] text-[#8A8F98] italic">No saved chats</p>
              ) : (
                filteredChats.map((chat) => {
                  const isSelected = activeChatId === chat._id;
                  return (
                    <div
                      key={chat._id}
                      className={`group relative flex items-center justify-between h-[36px] px-3 rounded-[6px] transition-colors cursor-pointer ${
                        isSelected
                          ? isDark
                            ? "bg-[#1A1A1A] text-white font-medium"
                            : "bg-[#F0F1FA] text-[#1F2023] font-medium"
                          : isDark
                            ? "text-gray-400 hover:bg-[#111] hover:text-white"
                            : "text-[#8A8F98] hover:text-[#1F2023] hover:bg-[#F4F5FB]"
                      }`}
                    >
                      <button
                        onClick={() => {
                          onSelectChat(chat);
                          setActiveNav("home");
                        }}
                        className="flex-1 text-left text-[14px] truncate pr-2"
                      >
                        <span className="truncate block">{chat.title}</span>
                      </button>

                      {/* Delete Button on Hover */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteChat(chat._id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-all"
                        title="Delete chat"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Footer: Theme Toggle */}
      <div className={`p-3 border-t flex items-center justify-between ${isDark ? "border-[#1F1F1F]" : "border-[#E8E9ED]"}`}>
        <span className="text-[12px] font-mono text-[#8A8F98]">Theme</span>
        <button
          onClick={onToggleTheme}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[12px] font-mono transition-colors ${
            isDark
              ? "border-[#222] bg-[#111] text-gray-300 hover:bg-[#1E1E1E]"
              : "border-[#E8E9ED] bg-white text-[#1F2023] hover:bg-[#F0F1FA]"
          }`}
        >
          {isDark ? (
            <>
              <Moon className="w-3.5 h-3.5 text-[#E5FF00]" />
              <span>Dark</span>
            </>
          ) : (
            <>
              <Sun className="w-3.5 h-3.5 text-[#C85A17]" />
              <span>Light</span>
            </>
          )}
        </button>
      </div>
    </aside>
    </>
  );
}
