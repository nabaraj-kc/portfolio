"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";

export default function LabNav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const navLinks = [
    { name: "Experiments", href: "#experiments" },
    { name: "Lab Notes", href: "#notes" },
    { name: "Main Site ←", href: "https://nabarajkc.com.np" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#F3F4F2]/95 backdrop-blur-md border-b border-[#8F8F8F]/20 py-3 shadow-sm"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex items-center justify-between">
        {/* Left: Prominent Calligraphic Monogram Logo + /lab suffix */}
        <a
          href="/"
          className="group flex items-center gap-2 transition-transform hover:scale-105 cursor-pointer"
        >
          <div className="relative h-10 w-28 sm:h-12 sm:w-36">
            <Image
              src="/images/logo-transparent.png"
              alt="Nabaraj KC Logo"
              fill
              className="object-contain object-left"
              priority
              unoptimized
            />
          </div>
          <span className="font-mono text-sm sm:text-base font-semibold text-[#8F8F8F] translate-y-0.5">/lab</span>
        </a>

        {/* Center: Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#202020]/90">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`transition-colors hover:underline underline-offset-4 ${
                link.name === "Lab"
                  ? "text-[#C85A17] decoration-[#C85A17] underline"
                  : "hover:text-[#C85A17] decoration-[#C85A17]"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Right: Get in Touch CTA */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="https://nabarajkc.com.np/#contact"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-[#16171A] text-[#F3F4F2] text-sm font-medium hover:bg-[#C85A17] transition-colors shadow-sm"
          >
            Suggest an experiment
          </a>
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
        <div className="md:hidden bg-[#F3F4F2] border-b border-[#8F8F8F]/20 px-6 py-6 space-y-4 shadow-lg animate-in slide-in-from-top-2 duration-200">
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
            <div className="pt-2">
              <a
                href="https://nabarajkc.com.np/#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-block w-full text-center px-5 py-3 rounded-full bg-[#16171A] text-[#F3F4F2] text-sm font-medium hover:bg-[#C85A17] transition-colors"
              >
                Suggest an experiment
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
