"use client";

import { useState, useRef } from "react";
import { Upload, CheckCircle2, AlertCircle, FileText, Sparkles, Check } from "lucide-react";

interface ResumeUploadCardProps {
  onAnalyze: (file: File | null, rawText: string) => void;
  isAnalyzing?: boolean;
}

export default function ResumeUploadCard({ onAnalyze, isAnalyzing }: ResumeUploadCardProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileText, setFileText] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndProcessFile = (file: File) => {
    setErrorMsg(null);

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("File exceeds maximum 5MB size limit.");
      setSelectedFile(null);
      return;
    }

    // Validate type (PDF or DOCX or TXT)
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "text/plain",
    ];
    const isDocxOrPdf =
      validTypes.includes(file.type) ||
      file.name.endsWith(".pdf") ||
      file.name.endsWith(".docx") ||
      file.name.endsWith(".doc") ||
      file.name.endsWith(".txt");

    if (!isDocxOrPdf) {
      setErrorMsg("Invalid file format. Please upload a PDF (.pdf) or Word document (.docx).");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);

    // Read text content (for TXT directly, or extract strings for simulation)
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = (e.target?.result as string) || "";
      setFileText(text);
    };

    if (file.type === "text/plain" || file.name.endsWith(".txt")) {
      reader.readAsText(file);
    } else {
      // For PDF/DOCX: read binary text strings
      reader.onload = (e) => {
        const buffer = e.target?.result as ArrayBuffer;
        const decoder = new TextDecoder("utf-8");
        const decoded = decoder.decode(buffer);
        // Extract plain printable ascii / UTF-8 text strings from binary PDF
        const extracted = decoded.replace(/[^\x20-\x7E\n\r\t]/g, " ").replace(/\s+/g, " ");
        setFileText(extracted.length > 50 ? extracted : `Extracted content from ${file.name}`);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (!selectedFile && !fileText) {
      setErrorMsg("Please select a resume file before analyzing.");
      return;
    }
    onAnalyze(selectedFile, fileText);
  };

  return (
    <div className="w-full max-w-[480px] mx-auto bg-white/90 backdrop-blur-md border border-[#8A8F98]/15 rounded-2xl p-6 sm:p-8 shadow-whisper space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-[#1F2023] font-sans tracking-tight">
          Upload your resume
        </h2>
        <p className="text-sm text-[#8A8F98] leading-relaxed">
          Get instant ATS compatibility scores and formatting recommendations.
        </p>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.doc,.txt"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Dropzone Container */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`w-full p-6 rounded-xl border-1.5 border-dashed cursor-pointer transition-all duration-200 flex flex-col items-center justify-center text-center space-y-3 ${
          selectedFile
            ? "border-[#C85A17] bg-[#C85A17]/5"
            : isDragging
            ? "border-[#C85A17] bg-[#F3F4F2]"
            : "border-[#8A8F98]/30 bg-[#F3F4F2]/50 hover:bg-[#F3F4F2]"
        }`}
      >
        {selectedFile ? (
          <>
            <div className="w-10 h-10 rounded-full bg-[#C85A17]/10 flex items-center justify-center text-[#C85A17]">
              <Check className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-mono text-xs font-semibold text-[#C85A17] uppercase tracking-wider block">
                File Selected
              </span>
              <span className="font-mono text-sm font-medium text-[#1F2023] block mt-0.5 truncate max-w-[280px]">
                {selectedFile.name}
              </span>
              <span className="font-mono text-[11px] text-[#8A8F98] block mt-1">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for analysis
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-full bg-[#F3F4F2] flex items-center justify-center text-[#8A8F98]">
              <Upload className="w-5 h-5 text-[#C85A17]" />
            </div>
            <div>
              <span className="text-sm font-medium text-[#1F2023] block">
                Drag &amp; drop your resume here, or{" "}
                <span className="text-[#C85A17] underline underline-offset-2">browse</span>
              </span>
              <span className="font-mono text-[11px] text-[#8A8F98] block mt-1">
                Supports PDF (.pdf) or Word (.docx) • Max 5MB
              </span>
            </div>
          </>
        )}
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 font-mono text-xs text-red-700 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* "What we'll analyze" Plain List */}
      <div className="space-y-2 pt-2 border-t border-[#8A8F98]/15">
        <span className="font-mono text-[11px] font-semibold text-[#8A8F98] uppercase tracking-wider block">
          What we'll analyze:
        </span>
        <div className="space-y-1.5 text-xs text-[#1F2023]/80">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#C85A17] shrink-0" />
            <span><strong>ATS Compatibility:</strong> Structural section &amp; keyword density alignment</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#C85A17] shrink-0" />
            <span><strong>Keyword Matching:</strong> Target role terms &amp; missing high-value keys</span>
          </div>
        </div>
      </div>

      {/* Full-width Primary Button (--color-ink background) */}
      <button
        onClick={handleSubmit}
        disabled={isAnalyzing}
        className="w-full h-[48px] bg-[#1F2023] hover:bg-[#C85A17] text-white font-mono text-xs font-semibold rounded-[10px] uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-sm"
      >
        {isAnalyzing ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Analyzing Resume...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            <span>Analyze Resume</span>
          </>
        )}
      </button>

      {/* Privacy note */}
      <p className="text-[11px] text-[#8A8F98] text-center font-mono">
        🔒 Processed strictly in-memory. Documents are never saved or stored.
      </p>
    </div>
  );
}
