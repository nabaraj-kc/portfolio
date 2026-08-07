"use client";

import { useState, useRef, useEffect } from "react";
import {
  Upload, FileText, Check, AlertCircle, Download, RefreshCw,
  Sparkles, Plus, ChevronRight, LayoutList, Cpu,
} from "lucide-react";
import LabDashboardLayout from "@/components/lab/LabDashboardLayout";
import LabChatPanel from "@/components/lab/LabChatPanel";

interface FeedbackItem {
  id: string;
  type: "pass" | "suggestion" | "error";
  text: string;
}

interface AnalysisResult {
  score: number;
  keywordMatch: number;
  extractedSkills: string[];
  missingSkills: string[];
  formattingFeedback: FeedbackItem[];
  fileName: string;
}

// ── Score Ring ─────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const [animated, setAnimated] = useState(0);
  const size = 160;
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const arcLen = circ * 0.75;
  const offset = arcLen - (animated / 100) * arcLen;

  useEffect(() => {
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 800, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setAnimated(Math.round(ease * score));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [score]);

  const color = score >= 80 ? "#22c55e" : score >= 60 ? "#8b5cf6" : "#f59e0b";

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[135deg]">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#F0F0EE" strokeWidth={stroke} fill="none"
          strokeDasharray={`${arcLen} ${circ - arcLen}`} strokeLinecap="round" />
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth={stroke} fill="none"
          strokeDasharray={`${arcLen} ${circ - arcLen}`} strokeDashoffset={offset}
          strokeLinecap="round" className="transition-all duration-700 ease-out" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-6">
        <span className="text-3xl font-bold text-[#1A1A1A] leading-none">{animated}</span>
        <span className="text-[10px] text-[#9B9B98] font-mono uppercase tracking-wider mt-1">ATS Score</span>
      </div>
    </div>
  );
}

// ── Upload Zone ────────────────────────────────────────
function UploadZone({ onAnalyze, isAnalyzing, error, setError }: { onAnalyze: (file: File, text: string) => void; isAnalyzing: boolean; error: string | null; setError: (err: string | null) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const process = (f: File) => {
    setError(null);
    if (f.size > 5 * 1024 * 1024) { setError("File too large — maximum 5MB"); return; }
    if (!f.name.match(/\.(pdf|docx?|txt)$/i)) { setError("Only PDF, DOCX, or TXT files are accepted"); return; }
    setFile(f);
  };

  const submit = () => {
    if (!file) { setError("Please select a file first"); return; }
    const reader = new FileReader();
    const finish = (text: string) => onAnalyze(file, text);

    if (file.name.endsWith(".txt")) {
      reader.onload = (e) => finish(e.target?.result as string || "");
      reader.readAsText(file);
    } else {
      reader.onload = (e) => {
        const buf = e.target?.result as ArrayBuffer;
        if (!buf) { finish(file.name); return; }
        const bytes = new Uint8Array(buf);
        let raw = "";
        const maxLen = Math.min(bytes.length, 500000);
        for (let i = 0; i < maxLen; i++) {
          const charCode = bytes[i];
          if ((charCode >= 32 && charCode <= 126) || charCode === 10 || charCode === 13 || charCode === 9) {
            raw += String.fromCharCode(charCode);
          } else {
            raw += " ";
          }
        }
        // Extract words matching text tokens
        const tokens = raw.match(/[A-Za-z0-9@.,#+:\-\/()]{2,}/g) || [];
        const cleanWords = tokens.filter((w) => {
          const l = w.toLowerCase();
          return !l.startsWith("/font") && !l.startsWith("/filter") && !l.startsWith("0obj") && !l.startsWith("endobj") && !l.startsWith("stream");
        });
        const extracted = cleanWords.slice(0, 1500).join(" ");
        finish(extracted.length > 20 ? extracted : `Resume Document ${file.name}`);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files[0]) process(e.dataTransfer.files[0]); }}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer border-2 border-dashed rounded-xl p-6 text-center transition-all ${
          file ? "border-violet-400 bg-violet-50" : dragging ? "border-violet-400 bg-violet-50" : "border-[#E8E8E6] hover:border-violet-300 hover:bg-violet-50/50"
        }`}
      >
        <input ref={inputRef} type="file" accept=".pdf,.docx,.doc,.txt" onChange={(e) => e.target.files?.[0] && process(e.target.files[0])} className="hidden" />
        {file ? (
          <div className="flex items-center gap-3 justify-center">
            <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center">
              <Check className="w-5 h-5 text-violet-600" />
            </div>
            <div className="text-left">
              <p className="text-[13px] font-semibold text-[#1A1A1A] truncate max-w-[200px]">{file.name}</p>
              <p className="text-[11px] text-[#9B9B98]">{(file.size / 1024).toFixed(0)} KB · Ready to analyze</p>
            </div>
            <button onClick={(e) => { e.stopPropagation(); setFile(null); setError(null); }} className="ml-auto text-[#9B9B98] hover:text-red-500 transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#F7F7F6] border border-[#E8E8E6] flex items-center justify-center mx-auto">
              <Upload className="w-5 h-5 text-[#9B9B98]" />
            </div>
            <p className="text-[13px] font-medium text-[#1A1A1A]">Drop your resume here</p>
            <p className="text-[11px] text-[#9B9B98]">PDF, DOCX, or TXT · Max 5MB · <span className="text-violet-600">browse</span></p>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-[12px] text-red-700">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <button
        onClick={submit}
        disabled={isAnalyzing || !file}
        className="w-full h-10 rounded-xl bg-[#1A1A1A] hover:bg-violet-600 disabled:opacity-40 text-white text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
      >
        {isAnalyzing ? (
          <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Analyzing...</>
        ) : (
          <><Sparkles className="w-4 h-4" />Analyze Resume</>
        )}
      </button>
    </div>
  );
}

export default function ResumeAnalyzerPage() {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyze = async (file: File, text: string) => {
    setAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/lab/analyze-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          fileName: file.name
        })
      });

      if (!res.ok) {
        throw new Error("Unable to complete resume analysis.");
      }

      const data = await res.json();

      if (data.isResume === false) {
        setError(data.rejectionReason || "The uploaded document is not a valid resume.");
      } else {
        setResult({
          score: data.score,
          keywordMatch: data.keywordMatch,
          fileName: file.name,
          extractedSkills: data.extractedSkills || [],
          missingSkills: data.missingSkills || [],
          formattingFeedback: data.formattingFeedback || []
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to analyze document.");
    } finally {
      setAnalyzing(false);
    }
  };

  const downloadReport = () => {
    if (!result) return;
    const txt = `RESUME ATS REPORT\n=================\nFile: ${result.fileName}\nATS Score: ${result.score}%\nKeyword Match: ${result.keywordMatch}%\n\nExtracted Skills: ${result.extractedSkills.join(", ")}\nMissing Skills: ${result.missingSkills.join(", ")}\n\nFormatting:\n${result.formattingFeedback.map(f => `[${f.type.toUpperCase()}] ${f.text}`).join("\n")}\n\nGenerated by Krrishmay Labs`;
    const blob = new Blob([txt], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `ATS_Report_${result.fileName.replace(/\.[^/.]+$/, "")}.txt`;
    a.click();
  };

  return (
    <LabDashboardLayout title="Resume Analyzer">
      <div className="p-8 max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ── LEFT PANEL: Upload + Score ── */}
          <div className="col-span-1 lg:col-span-4 space-y-5">

            {/* Upload Card — always visible */}
            <div className="bg-white border border-[#E8E8E6] rounded-2xl p-5 space-y-4">
              <div>
                <h2 className="text-[15px] font-semibold text-[#1A1A1A]">Upload Resume</h2>
                <p className="text-[12px] text-[#9B9B98] mt-0.5">Get instant ATS score and skill analysis</p>
              </div>
              <UploadZone onAnalyze={analyze} isAnalyzing={analyzing} error={error} setError={setError} />
              <p className="text-[11px] text-[#B5B5B0] text-center">🔒 Processed in-browser only — never stored</p>
            </div>

            {/* Score Card — shown after analysis */}
            {result && (
              <div className="bg-white border border-[#E8E8E6] rounded-2xl p-5 flex flex-col items-center space-y-4">
                <ScoreRing score={result.score} />
                <div className="w-full space-y-2">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-[#9B9B98]">Keyword Match</span>
                    <span className="font-bold text-violet-600">{result.keywordMatch}%</span>
                  </div>
                  <div className="h-2 bg-[#F0F0EE] rounded-full overflow-hidden">
                    <div className="h-full bg-violet-500 rounded-full transition-all duration-700" style={{ width: `${result.keywordMatch}%` }} />
                  </div>
                </div>
                <div className="flex gap-2 w-full">
                  <button onClick={downloadReport} className="flex-1 h-9 rounded-xl border border-[#E8E8E6] hover:border-[#1A1A1A]/30 text-[12px] font-medium text-[#5C5C5A] flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
                    <Download className="w-3.5 h-3.5" /> Report
                  </button>
                  <button onClick={() => setResult(null)} className="flex-1 h-9 rounded-xl border border-[#E8E8E6] hover:border-[#1A1A1A]/30 text-[12px] font-medium text-[#5C5C5A] flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
                    <RefreshCw className="w-3.5 h-3.5" /> New
                  </button>
                </div>
              </div>
            )}

            {/* What we analyze */}
            {!result && (
              <div className="bg-[#F7F7F6] border border-[#E8E8E6] rounded-2xl p-5 space-y-3">
                <h3 className="text-[12px] font-bold text-[#1A1A1A] uppercase tracking-wider">What we analyze</h3>
                {["ATS Compatibility Score", "Keyword density & role alignment", "Formatting & section structure", "Skills gap analysis"].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-[12px] text-[#5C5C5A]">
                    <div className="w-4 h-4 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 text-violet-600" />
                    </div>
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT PANEL: Results + Chat ── */}
          <div className="col-span-1 lg:col-span-8 space-y-5">

            {result ? (
              <>
                {/* File info */}
                <div className="bg-white border border-[#E8E8E6] rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0">
                    <FileText className="w-4.5 h-4.5 text-violet-600" style={{ width: 18, height: 18 }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-[#1A1A1A] truncate">{result.fileName}</p>
                    <p className="text-[11px] text-[#9B9B98]">Analysis complete · ATS Score: {result.score}%</p>
                  </div>
                  <div className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Complete
                  </div>
                </div>

                {/* 2-col: Feedback + Skills */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  {/* Formatting Feedback */}
                  <div className="bg-white border border-[#E8E8E6] rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <LayoutList className="w-4 h-4 text-[#9B9B98]" />
                      <h3 className="text-[13px] font-semibold text-[#1A1A1A]">Formatting Feedback</h3>
                    </div>
                    <div className="divide-y divide-[#F0F0EE] max-h-[300px] overflow-y-auto pr-1">
                      {result.formattingFeedback.map((f) => (
                        <div key={f.id} className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0">
                          {f.type === "pass" ? (
                            <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="w-3 h-3 text-emerald-600" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 mt-0.5">
                              <AlertCircle className="w-3 h-3 text-amber-500" />
                            </div>
                          )}
                          <span className="text-[12px] text-[#5C5C5A] leading-relaxed">{f.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Skills Analysis */}
                  <div className="bg-white border border-[#E8E8E6] rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-[#9B9B98]" />
                      <h3 className="text-[13px] font-semibold text-[#1A1A1A]">Skills Analysis</h3>
                    </div>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#9B9B98] mb-2">Detected</p>
                        <div className="flex flex-wrap gap-1.5">
                          {result.extractedSkills.map(s => (
                            <span key={s} className="text-[11px] px-2 py-1 rounded-lg bg-violet-50 text-violet-700 border border-violet-100 font-medium">{s}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-2">Missing High-Value</p>
                        <div className="flex flex-wrap gap-1.5">
                          {result.missingSkills.map(s => (
                            <span key={s} className="text-[11px] px-2 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-100 font-medium flex items-center gap-1">
                              <Plus className="w-2.5 h-2.5" />{s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Tips */}
                <div className="bg-white border border-[#E8E8E6] rounded-2xl p-5 space-y-2">
                  <h3 className="text-[13px] font-semibold text-[#1A1A1A] mb-3">Quick Tips</h3>
                  {[
                    "Add quantified metrics — 'Improved API response time by 40%' beats 'improved performance'",
                    "Mirror the job description's keywords naturally in your bullet points",
                    "Use standard headings: Experience, Education, Skills, Projects",
                  ].map((tip, i) => (
                    <div key={i} className="flex items-start gap-2 text-[12px] text-[#5C5C5A]">
                      <ChevronRight className="w-3.5 h-3.5 text-violet-500 shrink-0 mt-0.5" />
                      {tip}
                    </div>
                  ))}
                </div>

                {/* Chat Panel */}
                <LabChatPanel
                  toolName="Resume Analyzer"
                  currentToolState={result}
                  className="h-[380px]"
                  initialMessage="I've analyzed your resume! Ask me to improve a bullet point, identify missing keywords, or rewrite your summary — I can see your full analysis results."
                />
              </>
            ) : (
              /* Empty state / Rejection state */
              <div className="h-full flex items-center justify-center">
                <div className="text-center space-y-4 py-20 px-6">
                  {error ? (
                    <>
                      <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto">
                        <AlertCircle className="w-7 h-7 text-red-600" />
                      </div>
                      <div>
                        <h3 className="text-[15px] font-semibold text-red-700">Invalid Document Detected</h3>
                        <p className="text-[13px] text-[#9B9B98] mt-1 max-w-sm mx-auto leading-relaxed">
                          {error}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-2xl bg-[#F7F7F6] border border-[#E8E8E6] flex items-center justify-center mx-auto">
                        <FileText className="w-7 h-7 text-[#B5B5B0]" />
                      </div>
                      <div>
                        <h3 className="text-[15px] font-semibold text-[#1A1A1A]">Upload your resume to begin</h3>
                        <p className="text-[13px] text-[#9B9B98] mt-1 max-w-xs mx-auto">
                          Drop your file on the left and click Analyze — results appear here in seconds.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </LabDashboardLayout>
  );
}
