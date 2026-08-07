"use client";

import { useEffect, useRef } from "react";
import MessageBubble, { Message } from "./MessageBubble";
import { Sparkles } from "lucide-react";

interface MessageListProps {
  messages: Message[];
  isGenerating?: boolean;
  theme?: "light" | "dark";
}

export default function MessageList({ messages, isGenerating, theme = "light" }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating]);

  return (
    <div className="w-full max-w-[680px] mx-auto px-4 py-6">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} theme={theme} />
      ))}

      {isGenerating && (
        <div className="flex gap-3.5 my-4">
          <div className="w-5 h-5 rounded-full bg-[#1F2023] text-white flex items-center justify-center flex-shrink-0 mt-1">
            <Sparkles className="w-3 h-3 text-[#C85A17]" />
          </div>
          <div className="flex items-center gap-1.5 h-6">
            <span className="w-2 h-2 bg-[#8A8F98] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-2 h-2 bg-[#8A8F98] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-2 h-2 bg-[#8A8F98] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
