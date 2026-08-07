"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";
import FooterCTA from "@/components/FooterCTA";
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";

function ResetPasswordForm() {
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
      setError("Invalid or missing reset token. Please request a new reset link.");
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
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to reset password.");
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/auth"), 3000);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="bg-white border border-[#8F8F8F]/15 rounded-2xl p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-[#4A6741]/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-6 h-6 text-[#4A6741]" />
        </div>
        <h2 className="text-base font-medium text-[#202020] mb-2">Password updated</h2>
        <p className="text-sm text-[#8F8F8F] leading-relaxed">
          Your password has been changed successfully. Redirecting you to sign in...
        </p>
        <Link href="/auth" className="inline-block mt-4 text-sm text-[#C85A17] font-medium hover:underline">
          Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#8F8F8F]/15 rounded-2xl p-8">
      {!token || error.includes("Invalid or missing") ? (
        <div className="text-center py-4">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-red-500" />
          </div>
          <p className="text-sm text-[#202020] mb-4">{error}</p>
          <Link href="/forgot-password" className="text-sm text-[#C85A17] font-medium hover:underline">
            Request a new reset link
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* New password */}
          <div>
            <label htmlFor="new-password" className="block font-mono text-xs uppercase tracking-widest text-[#8F8F8F] mb-2">
              New password
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
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8F8F8F] hover:text-[#202020]"
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
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8F8F8F] hover:text-[#202020]"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirm && !passwordsMatch && (
              <p className="text-[10px] text-red-500 font-mono mt-1">Passwords do not match</p>
            )}
          </div>

          {error && !error.includes("Invalid or missing") && (
            <p className="text-xs text-red-600 font-mono bg-red-50 px-3 py-2 rounded-lg border border-red-100">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !passwordsMatch || !passwordStrong}
            className="w-full py-3 px-6 bg-[#202020] text-[#F5F1E8] rounded-xl text-sm font-medium hover:bg-[#C85A17] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Updating password..." : "Set new password"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <>
      <Nav />
      <main className="min-h-screen bg-[#F5F1E8] flex items-center justify-center px-4 py-24">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#8F8F8F] mb-1">
              Account Recovery
            </p>
            <h1 className="text-2xl font-medium text-[#202020] tracking-tight">Set new password</h1>
            <p className="text-sm text-[#8F8F8F] mt-2">Choose a strong password for your account.</p>
          </div>
          <Suspense fallback={
            <div className="bg-white border border-[#8F8F8F]/15 rounded-2xl p-8">
              <div className="h-32 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-[#C85A17] border-t-transparent rounded-full animate-spin" />
              </div>
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </main>
      <FooterCTA />
    </>
  );
}
