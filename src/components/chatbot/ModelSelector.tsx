"use client";

import { useState } from "react";
import { ChevronDown, Sparkles, Cpu, Zap } from "lucide-react";

interface Model {
  id: string;
  name: string;
  badge?: string;
}

interface ModelSelectorProps {
  currentModel: string;
  onSelectModel: (modelId: string) => void;
}

export default function ModelSelector({ currentModel, onSelectModel }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const models: Model[] = [
    { id: "krrishmay-4o", name: "Krrishmay 4o", badge: "Default" },
    { id: "deepthink-2.5", name: "DeepThink 2.5", badge: "Reasoning" },
    { id: "o-swarm-v2", name: "O-Swarm v2", badge: "Fast" },
  ];

  const selectedModel = models.find((m) => m.id === currentModel) || models[0];

  return (
    <div className="relative inline-block z-20">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-[40px] px-3.5 bg-white border border-[#E8E9ED] rounded-full flex items-center gap-2 text-[#1F2023] hover:border-[#D1D5DB] transition-all shadow-xs cursor-pointer select-none"
      >
        <div className="w-5 h-5 rounded-full bg-[#F0F1FA] text-[#C85A17] flex items-center justify-center">
          <Sparkles className="w-3 h-3" />
        </div>
        <span className="text-[14px] font-medium text-[#1F2023]">
          {selectedModel.name}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-[#8A8F98] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-56 bg-white border border-[#E8E9ED] rounded-2xl shadow-lg p-1.5 space-y-1 z-30">
          {models.map((model) => (
            <button
              key={model.id}
              onClick={() => {
                onSelectModel(model.id);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between text-left text-[14px] transition-colors ${
                selectedModel.id === model.id
                  ? "bg-[#F0F1FA] text-[#1F2023] font-medium"
                  : "text-[#8A8F98] hover:text-[#1F2023] hover:bg-[#F7F8FA]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Cpu className={`w-4 h-4 ${selectedModel.id === model.id ? "text-[#C85A17]" : "text-[#8A8F98]"}`} />
                <span>{model.name}</span>
              </div>
              {model.badge && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#F0F1FA] text-[#8A8F98]">
                  {model.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
