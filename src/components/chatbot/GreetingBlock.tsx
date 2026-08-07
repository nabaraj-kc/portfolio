"use client";

import { useEffect, useState } from "react";

interface GreetingBlockProps {
  userName?: string;
  accentText?: string;
}

export default function GreetingBlock({
  userName = "Judha",
  accentText = "Assist You Today?",
}: GreetingBlockProps) {
  const [greetingTime, setGreetingTime] = useState("Morning");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreetingTime("Morning");
    } else if (hour >= 12 && hour < 18) {
      setGreetingTime("Afternoon");
    } else {
      setGreetingTime("Evening");
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center select-none py-8">
      
      {/* Soft Radial Gradient Orb (No Image, Pure CSS) */}
      <div className="relative mb-6 flex items-center justify-center">
        {/* Blurred background glow */}
        <div 
          className="absolute w-20 h-20 rounded-full blur-xl opacity-60 pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(200, 90, 23, 0.6) 0%, rgba(200, 90, 23, 0) 70%)"
          }}
        />
        {/* Core sphere */}
        <div 
          className="w-16 h-16 rounded-full shadow-lg relative z-10 transition-transform hover:scale-105 duration-300"
          style={{
            background: "radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.95) 0%, rgba(240, 240, 255, 0.8) 25%, rgba(200, 90, 23, 0.45) 60%, rgba(180, 70, 10, 0.2) 85%, transparent 100%)",
            boxShadow: "0 10px 25px -5px rgba(200, 90, 23, 0.25), inset 0 2px 4px rgba(255, 255, 255, 0.8)"
          }}
        />
      </div>

      {/* Two-Line Headline */}
      <h1 className="text-[40px] font-semibold text-[#1F2023] leading-[1.15] tracking-tight max-w-xl">
        Good {greetingTime}, {userName}
        <br />
        How Can I <span className="text-[#C85A17]">{accentText}</span>
      </h1>
    </div>
  );
}
