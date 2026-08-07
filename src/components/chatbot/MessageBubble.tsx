"use client";

import { Sparkles, Terminal, ChevronDown, ChevronRight, Volume2, VolumeX, Copy, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  thought?: string;
  timestamp?: string;
}

interface MessageBubbleProps {
  message: Message;
  theme?: "light" | "dark";
}

export default function MessageBubble({ message, theme = "light" }: MessageBubbleProps) {
  const [showThought, setShowThought] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copied, setCopied] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isDark = theme === "dark";
  const isUser = message.role === "user";

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleTextToSpeech = () => {
    if (isPlayingAudio && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlayingAudio(false);
      return;
    }

    // Clean markdown characters out of text for clean speech
    const cleanText = message.content
      .replace(/```[\s\S]*?```/g, " [code snippet omitted] ")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/[*#_~>]/g, " ")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .trim();

    if (!cleanText) return;

    const url = `/api/tts?text=${encodeURIComponent(cleanText)}&voice=en-US-AvaNeural`;
    const audio = new Audio(url);
    audioRef.current = audio;
    
    audio.onended = () => setIsPlayingAudio(false);
    audio.onerror = () => setIsPlayingAudio(false);
    
    setIsPlayingAudio(true);
    audio.play().catch(e => {
      console.error("Audio play failed:", e);
      setIsPlayingAudio(false);
    });
  };

  if (isUser) {
    return (
      <div className="flex justify-end my-4 select-text">
        <div
          className={`max-w-[80%] rounded-[16px] px-4 py-3 text-[15px] leading-relaxed font-sans shadow-xs ${
            isDark ? "bg-[#1F2023] text-white" : "bg-[#F0F1FA] text-[#1F2023]"
          }`}
        >
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3.5 my-6 select-text group">
      {/* Model Avatar */}
      <div
        className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
          isDark ? "bg-[#E5FF00] text-black" : "bg-[#1F2023] text-white"
        }`}
      >
        <Sparkles className="w-3 h-3 text-[#C85A17]" />
      </div>

      {/* Message Block */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Optional Thought Accordion */}
        {message.thought && (
          <div
            className={`border rounded-xl overflow-hidden mb-3 ${
              isDark ? "bg-[#111] border-[#222]" : "bg-[#FAFBFE] border-[#E8E9ED]"
            }`}
          >
            <button
              onClick={() => setShowThought(!showThought)}
              className={`w-full px-3 py-2 flex items-center justify-between text-left transition-colors ${
                isDark ? "hover:bg-[#1A1A1A]" : "hover:bg-[#F4F5FB]"
              }`}
            >
              <div className="flex items-center gap-2 text-[#8A8F98]">
                <Terminal className="w-3.5 h-3.5" />
                <span className="text-[12px] font-mono uppercase tracking-wider">Thought Process</span>
              </div>
              {showThought ? (
                <ChevronDown className="w-3.5 h-3.5 text-[#8A8F98]" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-[#8A8F98]" />
              )}
            </button>
            {showThought && (
              <div
                className={`p-3 border-t text-[12px] font-mono text-[#8A8F98] leading-relaxed whitespace-pre-wrap ${
                  isDark ? "border-[#222] bg-[#0A0A0A]" : "border-[#E8E9ED] bg-white"
                }`}
              >
                {message.thought}
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div
          className={`prose max-w-none text-[15px] leading-relaxed font-sans ${
            isDark
              ? "prose-invert text-gray-200 prose-pre:bg-[#111] prose-pre:border-[#222] prose-code:text-[#E5FF00]"
              : "prose-neutral text-[#1F2023] prose-pre:bg-[#1F2023] prose-pre:text-white prose-code:text-[#C85A17]"
          }`}
        >
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>

        {/* Actions Row (Audio Read Aloud & Copy) */}
        <div className="flex items-center gap-2 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={toggleTextToSpeech}
            className={`p-1.5 rounded-md text-[12px] flex items-center gap-1.5 transition-colors cursor-pointer ${
              isPlayingAudio
                ? "text-[#C85A17] bg-[#C85A17]/10"
                : isDark
                  ? "text-gray-400 hover:text-white hover:bg-[#1A1A1A]"
                  : "text-[#8A8F98] hover:text-[#1F2023] hover:bg-[#F0F1FA]"
            }`}
            title={isPlayingAudio ? "Stop reading" : "Read aloud"}
          >
            {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span className="text-[11px] font-mono">{isPlayingAudio ? "Speaking..." : "Listen"}</span>
          </button>

          <button
            onClick={handleCopy}
            className={`p-1.5 rounded-md text-[12px] flex items-center gap-1.5 transition-colors cursor-pointer ${
              isDark
                ? "text-gray-400 hover:text-white hover:bg-[#1A1A1A]"
                : "text-[#8A8F98] hover:text-[#1F2023] hover:bg-[#F0F1FA]"
            }`}
            title="Copy response"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="text-[11px] font-mono">{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
