"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

function AdminResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token. Please request a new link.");
    }
  }, [token]);

  const passwordsMatch = password && confirm && password === confirm;
  const passwordStrong = password.length >= 8;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    if (!passwordsMatch) { setError("Passwords do not match."); return; }
    if (!passwordStrong) { setError("Password must be at least 8 characters."); return; }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset", token, newPassword: password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to reset password.");
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/admin"), 3000);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="bg-white border border-[#8F8F8F]/15 rounded-2xl p-8 text-center shadow-sm">
        <div className="w-12 h-12 rounded-full bg-[#4A6741]/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-6 h-6 text-[#4A6741]" />
        </div>
        <h2 className="text-base font-medium text-[#202020] mb-2">Password updated</h2>
        <p className="text-sm text-[#8F8F8F] leading-relaxed">
          Admin password has been reset successfully. Redirecting to admin sign in...
        </p>
        <Link href="/admin" className="inline-block mt-4 text-sm text-[#C85A17] font-medium hover:underline">
          Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#8F8F8F]/15 rounded-2xl p-8 shadow-sm">
      {!token || error.includes("Invalid or missing") ? (
        <div className="text-center py-4">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-red-500" />
          </div>
          <p className="text-sm text-[#202020] mb-4">{error}</p>
          <Link href="/admin" className="text-sm text-[#C85A17] font-medium hover:underline">
            Back to admin login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* New password */}
          <div>
            <label htmlFor="new-password" className="block font-mono text-xs uppercase tracking-widest text-[#8F8F8F] mb-2">
              New Admin password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8F8F8F]" />
              <input
                id="new-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                required
                autoFocus
                className="w-full pl-10 pr-11 py-3 bg-[#FAFAF8] border border-[#8F8F8F]/25 rounded-xl text-[#202020] text-sm placeholder-[#8F8F8F]/60 focus:outline-none focus:ring-2 focus:ring-[#C85A17]/50 focus:border-[#C85A17] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8F8F8F] hover:text-[#202020] transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {password && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <div className={`h-1 flex-1 rounded-full ${passwordStrong ? "bg-[#4A6741]" : "bg-[#C85A17]"}`} />
                <p className={`text-[10px] font-mono ${passwordStrong ? "text-[#4A6741]" : "text-[#C85A17]"}`}>
                  {passwordStrong ? "Strong" : "Too short"}
                </p>
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <label htmlFor="confirm-password" className="block font-mono text-xs uppercase tracking-widest text-[#8F8F8F] mb-2">
              Confirm password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8F8F8F]" />
              <input
                id="confirm-password"
                type={showConfirm ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter new password"
                required
                className={`w-full pl-10 pr-11 py-3 bg-[#FAFAF8] border rounded-xl text-[#202020] text-sm placeholder-[#8F8F8F]/60 focus:outline-none focus:ring-2 transition-all ${
                  confirm && !passwordsMatch
                    ? "border-red-300 focus:ring-red-200"
                    : "border-[#8F8F8F]/25 focus:ring-[#C85A17]/50 focus:border-[#C85A17]"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8F8F8F] hover:text-[#202020] transition-colors"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirm && !passwordsMatch && (
              <p className="text-[10px] text-red-500 font-mono mt-1">Passwords do not match</p>
            )}
          </div>

          {error && !error.includes("Invalid or missing") && (
            <p className="text-xs text-red-600 font-mono bg-red-50 px-3 py-2 rounded-lg border border-red-100 flex items-start gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !passwordsMatch || !passwordStrong}
            className="w-full py-3 bg-[#202020] text-[#F5F1E8] rounded-xl text-sm font-medium hover:bg-[#C85A17] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Updating..." : "Set new admin password"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function AdminResetPasswordPage() {
  return (
    <main className="min-h-screen bg-[#F5F1E8] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-10 flex flex-col items-center gap-3">
          <div className="relative h-14 w-44">
            <Image
              src="/images/logo-transparent.png"
              alt="Nabaraj KC"
              fill
              className="object-contain"
              unoptimized
              priority
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C85A17]" />
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#8F8F8F]">
              Admin Recovery
            </p>
          </div>
        </div>

        <Suspense fallback={
          <div className="bg-white border border-[#8F8F8F]/15 rounded-2xl p-8 shadow-sm">
            <div className="h-32 flex items-center justify-center">
              <Loader2 className="w-6 h-6 border-2 border-[#C85A17] border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
        }>
          <AdminResetPasswordForm />
        </Suspense>
      </div>
    </main>
  );
}
