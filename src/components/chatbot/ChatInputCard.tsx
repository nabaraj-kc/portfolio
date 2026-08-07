"use client";

import { useState, useRef } from "react";
import { Paperclip, Sparkles, Lightbulb, Compass, ArrowUp, Mic, MicOff, X, FileText } from "lucide-react";

interface Attachment {
  name: string;
  type: string;
  url?: string;
  textContent?: string;
}

interface ChatInputCardProps {
  onSend: (text: string, activePills: string[], attachments: Attachment[]) => void;
  isGenerating?: boolean;
  theme?: "light" | "dark";
}

export default function ChatInputCard({ onSend, isGenerating, theme = "light" }: ChatInputCardProps) {
  const [input, setInput] = useState("");
  const [activePills, setActivePills] = useState<string[]>(["reasoning"]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDark = theme === "dark";

  const pills = [
    { id: "reasoning", label: "Reasoning", icon: Lightbulb },
    { id: "create-image", label: "Create Image", icon: Sparkles },
    { id: "deep-research", label: "Deep Research", icon: Compass },
  ];

  const togglePill = (id: string) => {
    setActivePills((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.max(48, textareaRef.current.scrollHeight)}px`;
    }
  };

  // Helper to extract text snippets from PDF base64
  const extractPdfText = (base64: string): string => {
    try {
      const raw = atob(base64.split("base64,")[1] || base64);
      const matches: string[] = [];
      const textRegex = /\(([^()\\]|\\[\s\S])*\)/g;
      let match;
      while ((match = textRegex.exec(raw)) !== null) {
        const text = match[0].slice(1, -1).replace(/\\([()])/g, "$1").trim();
        if (text.length > 1 && /[a-zA-Z0-9]/i.test(text)) {
          matches.push(text);
        }
      }
      return matches.join(" ");
    } catch (e) {
      return "";
    }
  };

  // Attachment handler supporting images, audio, documents, code, and PDFs
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const isTextOrCode =
        file.type.startsWith("text/") ||
        file.type.includes("json") ||
        file.type.includes("javascript") ||
        file.type.includes("typescript") ||
        file.name.match(/\.(txt|js|ts|tsx|jsx|py|json|md|csv|html|css|c|cpp|rs|go|java)$/i);

      if (isTextOrCode) {
        const textReader = new FileReader();
        textReader.onload = (evt) => {
          const textContent = evt.target?.result as string;
          const dataUrlReader = new FileReader();
          dataUrlReader.onload = (dataEvt) => {
            setAttachments((prev) => [
              ...prev,
              {
                name: file.name,
                type: file.type || "text/plain",
                url: dataEvt.target?.result as string,
                textContent,
              },
            ]);
          };
          dataUrlReader.readAsDataURL(file);
        };
        textReader.readAsText(file);
      } else {
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string;
          let pdfText = "";
          if (file.name.endsWith(".pdf") || file.type === "application/pdf") {
            pdfText = extractPdfText(dataUrl);
          }

          setAttachments((prev) => [
            ...prev,
            {
              name: file.name,
              type: file.type || (file.name.endsWith(".pdf") ? "application/pdf" : "application/octet-stream"),
              url: dataUrl,
              textContent: pdfText || undefined,
            },
          ]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Voice Speech Recognition Handler
  const toggleVoiceRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => setIsRecording(true);
      recognition.onend = () => setIsRecording(false);
      recognition.onerror = () => setIsRecording(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsRecording(false);
    }
  };

  const handleSend = () => {
    if ((!input.trim() && attachments.length === 0) || isGenerating) return;
    onSend(input.trim(), activePills, attachments);
    setInput("");
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = "48px";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full max-w-[680px] mx-auto select-none">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileChange}
        accept="image/*,audio/*,video/*,application/pdf,text/*,.txt,.pdf,.js,.ts,.py,.json,.md,.csv"
      />

      {/* Outer Card */}
      <div
        className={`relative border rounded-[20px] p-4 transition-all duration-200 ${
          isDark
            ? "bg-[#111] border-[#222] text-white shadow-xl"
            : "bg-white border-[#E8E9ED] text-[#1F2023] shadow-md"
        }`}
        style={{
          boxShadow: isDark
            ? "0 12px 32px rgba(0, 0, 0, 0.4)"
            : "0 12px 32px rgba(32, 32, 32, 0.05), 0 0 0 1px rgba(200, 90, 23, 0.04)",
        }}
      >
        {/* Attachment Previews */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {attachments.map((att, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono ${
                  isDark ? "bg-[#1A1A1A] border-[#333] text-gray-300" : "bg-[#F7F8FA] border-[#E8E9ED] text-[#1F2023]"
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-[#C85A17]" />
                <span className="truncate max-w-[140px]">{att.name}</span>
                <button
                  onClick={() => removeAttachment(idx)}
                  className="text-gray-400 hover:text-red-400 transition-colors ml-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Placeholder / Sparkle Row */}
        {input.length === 0 && attachments.length === 0 && (
          <div className="flex items-center gap-2 mb-1 pointer-events-none text-[#8A8F98]">
            <Sparkles className="w-4 h-4 text-[#C85A17]" />
            <span className="text-[15px]">Initiate a query or send a command to the AI...</span>
          </div>
        )}

        {/* Auto-growing Textarea */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          className={`w-full bg-transparent text-[15px] placeholder-transparent focus:outline-none resize-none min-h-[48px] leading-relaxed scrollbar-none font-sans ${
            isDark ? "text-white" : "text-[#1F2023]"
          }`}
          rows={1}
        />

        {/* Toolbar Row */}
        <div className={`flex items-center justify-between pt-2 border-t ${isDark ? "border-[#222]" : "border-[#F0F1FA]"}`}>
          {/* Left Tools: Attach File & Voice Mic */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`p-2 rounded-full transition-colors cursor-pointer ${
                isDark
                  ? "text-gray-400 hover:text-white hover:bg-[#222]"
                  : "text-[#8A8F98] hover:text-[#1F2023] hover:bg-[#F4F5FB]"
              }`}
              title="Attach File or Image"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={toggleVoiceRecording}
              className={`p-2 rounded-full transition-colors cursor-pointer ${
                isRecording
                  ? "text-red-500 bg-red-500/10 animate-pulse"
                  : isDark
                    ? "text-gray-400 hover:text-white hover:bg-[#222]"
                    : "text-[#8A8F98] hover:text-[#1F2023] hover:bg-[#F4F5FB]"
              }`}
              title={isRecording ? "Listening..." : "Voice Speech Input"}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          </div>

          {/* Right Cluster: Pills + Send Button */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              {pills.map((pill) => {
                const Icon = pill.icon;
                const isActive = activePills.includes(pill.id);
                return (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => togglePill(pill.id)}
                    className={`h-[32px] px-3 rounded-full border flex items-center gap-1.5 text-[13px] font-medium transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#C85A17]/10 text-[#C85A17] border-[#C85A17]/30"
                        : isDark
                          ? "bg-[#1A1A1A] text-gray-400 border-[#2A2A2A] hover:bg-[#222]"
                          : "bg-[#F7F8FA] text-[#1F2023]/80 border-[#E8E9ED] hover:bg-[#F0F1FA]"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#C85A17]" : "text-[#8A8F98]"}`} />
                    <span>{pill.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleSend}
              disabled={(!input.trim() && attachments.length === 0) || isGenerating}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                isDark
                  ? "bg-[#E5FF00] text-black hover:bg-[#cce600]"
                  : "bg-[#1F2023] text-white hover:scale-105 active:scale-95"
              } ${
                (!input.trim() && attachments.length === 0) || isGenerating
                  ? "opacity-40 cursor-not-allowed hover:scale-100"
                  : ""
              }`}
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
