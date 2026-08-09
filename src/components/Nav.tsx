"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, LogIn, LogOut, User } from "lucide-react";

export default function Nav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ username: string; email: string; picture?: string } | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch session cookie
  useEffect(() => {
    const getCookie = (name: string) => {
      if (typeof document === "undefined") return null;
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift();
      return null;
    };
    const session = getCookie("user_session");
    if (session) {
      try {
        setUser(JSON.parse(decodeURIComponent(session)));
      } catch (e) {
        console.error("Failed to parse user session cookie:", e);
      }
    }
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    setUser(null);
    window.location.reload();
  };

  const navLinks = [
    { name: "Work", href: "/#work" },
    { name: "Research", href: "https://research.nabarajkc.com.np" },
    { name: "Lab", href: "https://labs.nabarajkc.com.np" },
    { name: "Articles", href: "/articles" },
    { name: "About", href: "/#about" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#F5F1E8]/95 backdrop-blur-md border-b border-[#8F8F8F]/20 py-3 shadow-sm"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex items-center justify-between">
        {/* Left: Prominent Calligraphic Monogram Logo */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
            if (window.location.pathname !== "/") {
              window.location.href = "/";
            }
          }}
          className="group flex items-center gap-3 transition-all hover:opacity-90 cursor-pointer"
        >
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-[#C85A17]/30 bg-[#202020] shrink-0 shadow-sm transition-transform group-hover:scale-105">
            <Image
              src="/images/user-profile-transparent.png"
              alt="Nabaraj KC"
              fill
              className="object-cover object-top scale-110"
              priority
              unoptimized
            />
          </div>
          <span className="font-medium tracking-tight text-[#202020] text-base sm:text-lg font-sans">
            Nabaraj <span className="text-[#C85A17] font-semibold">KC</span>
          </span>
        </a>

        {/* Center: Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#202020]/90">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="hover:text-[#C85A17] transition-colors hover:underline underline-offset-4 decoration-[#C85A17]"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Right: User profile / login + Krrishmay AI Link */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="https://krrishmay.nabarajkc.com.np"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3.5 py-2 rounded-full border border-[#8F8F8F]/30 text-xs font-mono text-[#202020] hover:border-[#C85A17] hover:text-[#C85A17] transition-colors bg-white/60"
          >
            <span>Krrishmay AI</span>
          </a>

          {user ? (
            <div className="flex items-center gap-3 bg-white/40 border border-[#8F8F8F]/20 px-3.5 py-1.5 rounded-full shadow-xs">
              <Link href="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                {user.picture ? (
                  <img src={user.picture} alt={user.username} className="w-5 h-5 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-[#C85A17]/10 flex items-center justify-center text-[#C85A17] shrink-0">
                    <User className="w-3 h-3" />
                  </div>
                )}
                <span className="text-xs font-mono font-bold text-[#202020] truncate max-w-[100px]">
                  {user.username}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="text-[#8F8F8F] hover:text-red-500 transition-colors p-0.5"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Link
              href="/auth"
              className="inline-flex items-center gap-1 px-3.5 py-2 rounded-full border border-[#8F8F8F]/30 text-xs font-mono text-[#202020] hover:border-[#C85A17] hover:text-[#C85A17] transition-colors bg-white/60 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          )}

          <Link
            href="/#contact"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-[#202020] text-[#F5F1E8] text-sm font-medium hover:bg-[#C85A17] transition-colors shadow-sm"
          >
            Get in touch
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
          className="md:hidden p-2 text-[#202020] hover:text-[#C85A17] transition-colors"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile slide-down menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#F5F1E8] border-b border-[#8F8F8F]/20 px-6 py-6 space-y-4 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-[#202020] hover:text-[#C85A17] transition-colors py-1"
              >
                {link.name}
              </Link>
            ))}
            <a
              href="https://krrishmay.nabarajkc.com.np"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-[#C85A17] py-1 font-mono"
            >
              <span>Krrishmay AI Chatbot</span>
            </a>

            {user ? (
              <div className="flex items-center justify-between py-2 border-t border-b border-[#8F8F8F]/10">
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  {user.picture ? (
                    <img src={user.picture} alt={user.username} className="w-6 h-6 rounded-full object-cover shrink-0" />
                  ) : (
                    <User className="w-4 h-4 text-[#C85A17]" />
                  )}
                  <span className="text-sm font-mono font-bold text-[#202020]">
                    {user.username}
                  </span>
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="text-xs text-red-500 font-mono font-bold uppercase tracking-wider"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/auth"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-lg border border-[#8F8F8F]/30 text-sm font-mono text-[#202020] bg-white"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            )}

            <div className="pt-2">
              <Link
                href="/#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-block w-full text-center px-5 py-3 rounded-full bg-[#202020] text-[#F5F1E8] text-sm font-medium hover:bg-[#C85A17] transition-colors"
              >
                Get in touch
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Removed AuthModal */}
    </header>
  );
}
