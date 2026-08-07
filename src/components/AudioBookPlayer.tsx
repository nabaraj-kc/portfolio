"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, RotateCcw, Loader2, Gauge } from "lucide-react";

interface AudioBookPlayerProps {
  id: string; // page identifier
  title: string;
  speakText: string; // The text content to read aloud
}

export default function AudioBookPlayer({ id, title, speakText }: AudioBookPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [progress, setProgress] = useState(0);
  const [currentTimeDisplay, setCurrentTimeDisplay] = useState("0:00");
  const [durationDisplay, setDurationDisplay] = useState("0:00");

  const chunksRef = useRef<string[]>([]);
  const currentChunkIndexRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Clean the text of code blocks and markdown symbols for natural TTS reading
  const getCleanSpeechText = (text: string) => {
    return text
      .replace(/```[\s\S]*?```/g, " [code snippet omitted] ")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/[*#_~>]/g, " ")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .trim();
  };

  // Helper to chunk text on sentence boundaries (approx. 400 characters per chunk)
  const chunkText = (text: string, maxLength: number = 400): string[] => {
    const sentences = text.match(/[^.!?]+[.!?]+(\s+|$)/g) || [text];
    const chunks: string[] = [];
    let currentChunk = "";

    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > maxLength) {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
        }
        if (sentence.length > maxLength) {
          // Break extremely long sentences by words
          const words = sentence.split(/\s+/);
          let subChunk = "";
          for (const word of words) {
            if ((subChunk + " " + word).length > maxLength) {
              chunks.push(subChunk.trim());
              subChunk = word;
            } else {
              subChunk = subChunk ? subChunk + " " + word : word;
            }
          }
          currentChunk = subChunk;
        } else {
          currentChunk = sentence;
        }
      } else {
        currentChunk += sentence;
      }
    }
    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }
    return chunks.filter(Boolean);
  };

  const playChunk = async (index: number) => {
    if (index >= chunksRef.current.length) {
      setIsPlaying(false);
      setProgress(0);
      currentChunkIndexRef.current = 0;
      setCurrentTimeDisplay("0:00");
      return;
    }

    currentChunkIndexRef.current = index;
    setIsLoading(true);

    const chunkTextContent = chunksRef.current[index];
    const url = `/api/tts?text=${encodeURIComponent(chunkTextContent)}&voice=en-US-AvaNeural`;

    // Clean up existing audio element if any
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    try {
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.playbackRate = playbackSpeed;

      audio.addEventListener("loadedmetadata", () => {
        setIsLoading(false);
        audio.play().catch(e => console.error("Play failed:", e));
        setIsPlaying(true);
        // Estimate remaining/total duration format
        setDurationDisplay(`Part ${index + 1}/${chunksRef.current.length}`);
      });

      audio.addEventListener("timeupdate", () => {
        if (!audio.duration) return;
        
        // Calculate progress as overall position in the chunk array
        const currentProgress = ((index + (audio.currentTime / audio.duration)) / chunksRef.current.length) * 100;
        setProgress(currentProgress);
        setCurrentTimeDisplay(formatTime(audio.currentTime));
      });

      audio.addEventListener("ended", () => {
        playChunk(index + 1);
      });

      audio.addEventListener("error", () => {
        const mediaError = audio.error;
        console.error("Audio playback error details:", {
          code: mediaError?.code,
          message: mediaError?.message || "Format not supported or network error",
        });
        setIsLoading(false);
        setIsPlaying(false);
      });

    } catch (err) {
      console.error("Failed to initialize chunk play:", err);
      setIsLoading(false);
      setIsPlaying(false);
    }
  };

  const handlePlayPause = async () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    if (audioRef.current) {
      audioRef.current.play().catch(e => console.error("Play failed:", e));
      setIsPlaying(true);
      return;
    }

    // Initialize chunks and start sequential playback
    let textToRead = "";
    if (typeof document !== "undefined") {
      const container = document.getElementById("article-body") || document.getElementById("research-body");
      if (container) {
        const elements = container.querySelectorAll("p, h1, h2, h3, h4, h5, h6, li");
        const texts: string[] = [];
        elements.forEach(el => {
          if (!el.closest(".no-audio")) {
            const text = el.textContent?.trim();
            if (text) {
              texts.push(text);
            }
          }
        });
        textToRead = texts.join(" ");
      }
    }

    if (!textToRead) {
      textToRead = speakText;
    }

    const cleanText = getCleanSpeechText(textToRead);
    const speechChunks = chunkText(`Reading: ${title}. ${cleanText}`);
    chunksRef.current = speechChunks;
    
    if (speechChunks.length === 0) return;

    // Track user behaviour event: play audiobook
    fetch("/api/behaviour", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "audiobook_play",
        pageId: id,
        title: title,
        details: { totalChunks: speechChunks.length },
      }),
    }).catch(err => console.error("Failed to track behaviour:", err));

    playChunk(0);
  };

  const handleSpeedChange = () => {
    let nextSpeed = 1;
    if (playbackSpeed === 1) nextSpeed = 1.25;
    else if (playbackSpeed === 1.25) nextSpeed = 1.5;
    else if (playbackSpeed === 1.5) nextSpeed = 1.75;
    else nextSpeed = 1;

    setPlaybackSpeed(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const handleReset = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    setIsLoading(false);
    setProgress(0);
    currentChunkIndexRef.current = 0;
    setCurrentTimeDisplay("0:00");
    setDurationDisplay("0:00");
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "0:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <div className="bg-[#FFFFFF] border border-[#8F8F8F]/25 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 max-w-xl mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-[#C85A17] shrink-0" />
          <span className="font-mono text-xs font-semibold text-[#202020] uppercase tracking-wider">
            Audiobook Player
          </span>
        </div>
        {isPlaying && (
          <div className="flex items-center gap-0.5 h-3">
            <span className="w-0.5 h-full bg-[#C85A17] rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
            <span className="w-0.5 h-3/4 bg-[#C85A17] rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
            <span className="w-0.5 h-1/2 bg-[#C85A17] rounded-full animate-bounce" style={{ animationDelay: "0.5s" }} />
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Play/Pause Button */}
        <button
          onClick={handlePlayPause}
          disabled={isLoading}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#202020] hover:bg-[#C85A17] disabled:bg-gray-300 text-[#F5F1E8] flex items-center justify-center transition-all duration-300 shadow-sm shrink-0 focus:outline-none"
        >
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin text-white" />
          ) : isPlaying ? (
            <Pause className="w-6 h-6 fill-white" />
          ) : (
            <Play className="w-6 h-6 fill-white ml-0.5" />
          )}
        </button>

        {/* Progress & Timing */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#8F8F8F]">
            <span>{currentTimeDisplay}</span>
            <span>{durationDisplay}</span>
          </div>
          <div className="w-full bg-[#F5F1E8] h-1.5 rounded-lg overflow-hidden">
            <div 
              className="bg-[#C85A17] h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Reset Button */}
        <button
          onClick={handleReset}
          className="flex flex-col items-center justify-center p-2 rounded-lg border border-[#8F8F8F]/20 text-[#202020] hover:border-[#C85A17] hover:text-[#C85A17] transition-all shrink-0 w-12 h-12"
          title="Reset playback"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Speed Adjustment */}
        <button
          onClick={handleSpeedChange}
          className="flex flex-col items-center justify-center p-2 rounded-lg border border-[#8F8F8F]/20 text-[#202020] hover:border-[#C85A17] hover:text-[#C85A17] transition-all shrink-0 w-12 h-12"
          title="Playback speed"
        >
          <Gauge className="w-3.5 h-3.5" />
          <span className="text-[9px] font-mono font-bold mt-0.5">{playbackSpeed}x</span>
        </button>
      </div>
    </div>
  );
}
