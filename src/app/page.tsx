"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Mic2, BookOpen, Star, Shield, ChevronRight, Music, Feather } from "lucide-react";

const features = [
  {
    icon: <Feather size={28} />,
    name: "Ghost Studio™",
    desc: "Your private writing sanctuary. Draft verses, hooks, and full songs in a distraction-free luxury environment.",
  },
  {
    icon: <Music size={28} />,
    name: "Beat Locker™",
    desc: "Store and organize your licensed beats. Attach any beat to any song and write in context of the vibe.",
  },
  {
    icon: <Star size={28} />,
    name: "Pen Coach™",
    desc: "AI-powered writing assistant that sharpens your bars, suggests adlibs, and tailors your style on demand.",
  },
  {
    icon: <Shield size={28} />,
    name: "Booth Ready™",
    desc: "Official certification when your song hits studio quality. Your personal hall of fame — tracks certified for recording.",
  },
];

const modes = [
  { name: "Ghost Studio™", desc: "Write in silence. No distractions." },
  { name: "Beat Locker™", desc: "Build your catalog. Own your sound." },
  { name: "Pen Coach™", desc: "Sharpen every bar. Elevate your craft." },
];

export default function LandingPage() {
  const [activeMode, setActiveMode] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveMode((prev) => (prev + 1) % modes.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="studio-bg min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 glass-strong">
        <div className="flex items-center gap-2">
          <Mic2 size={22} className="text-[#D4AF37]" />
          <span className="font-playfair text-xl font-bold gold-text" style={{ fontFamily: "'Playfair Display', serif" }}>
            RapWriter.ai
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-[#9A9A9A] hover:text-[#D4AF37] transition-colors">Features</a>
          <a href="#modes" className="text-sm text-[#9A9A9A] hover:text-[#D4AF37] transition-colors">Studio Modes</a>
          <Link href="/marketplace" className="text-sm text-[#9A9A9A] hover:text-[#D4AF37] transition-colors">Marketplace</Link>
        </div>
        <Link
          href="/studio"
          className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold text-[#0A0A0A] bg-[#D4AF37] hover:bg-[#FFD700] transition-colors"
        >
          Enter The Studio <ChevronRight size={14} />
        </Link>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-32 pb-20 relative">
        {/* Decorative lines */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-transparent to-[#D4AF37]/30" />

        <div className="fade-in-up">
          <p className="text-xs uppercase tracking-[0.4em] text-[#D4AF37] mb-6 font-medium">Premium Rap Writing Studio</p>
          <h1
            className="text-6xl md:text-8xl font-black mb-6 leading-none"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            <span className="gold-text">Sharpen</span>
            <br />
            <span className="text-[#E8E8E8]">Your Pen.</span>
          </h1>
          <p className="text-lg md:text-xl text-[#7A7A7A] max-w-2xl mx-auto mb-10 leading-relaxed">
            The studio where legends are written. Draft, refine, and certify your bars — from raw idea to{" "}
            <span className="text-[#D4AF37]">Booth Ready™</span>.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/studio"
              className="group flex items-center gap-3 px-8 py-4 rounded-full font-bold text-[#0A0A0A] bg-gradient-to-r from-[#B8960C] via-[#D4AF37] to-[#FFD700] hover:from-[#D4AF37] hover:to-[#FFD700] transition-all shadow-[0_0_30px_rgba(212,175,55,0.3)] hover:shadow-[0_0_50px_rgba(212,175,55,0.5)] text-lg"
            >
              <Mic2 size={20} />
              Enter The Studio
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/marketplace"
              className="flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-[#D4AF37] border border-[#D4AF37]/30 hover:border-[#D4AF37]/60 hover:bg-[#D4AF37]/5 transition-all text-lg"
            >
              Browse Beats
            </Link>
          </div>
        </div>

        {/* Gold divider */}
        <div className="mt-20 w-24 h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto" />
      </section>

      {/* Studio Modes */}
      <section id="modes" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs uppercase tracking-[0.4em] text-[#D4AF37] mb-4">Studio Modes</p>
          <h2
            className="text-center text-4xl font-bold text-[#E8E8E8] mb-12"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Three Ways to Create
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {modes.map((mode, i) => (
              <div
                key={mode.name}
                onMouseEnter={() => setActiveMode(i)}
                className={`glass rounded-2xl p-8 text-center cursor-pointer transition-all duration-500 ${
                  activeMode === i
                    ? "border-[#D4AF37]/50 shadow-[0_0_30px_rgba(212,175,55,0.15)]"
                    : "border-[#2A2A2A] hover:border-[#D4AF37]/30"
                }`}
              >
                <div
                  className={`text-3xl font-black mb-3 transition-all duration-500 ${
                    activeMode === i ? "gold-text" : "text-[#4A4A4A]"
                  }`}
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3
                  className={`text-xl font-bold mb-2 transition-colors ${
                    activeMode === i ? "text-[#D4AF37]" : "text-[#9A9A9A]"
                  }`}
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {mode.name}
                </h3>
                <p className="text-sm text-[#6A6A6A]">{mode.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-xs uppercase tracking-[0.4em] text-[#D4AF37] mb-4">Key Features</p>
          <h2
            className="text-center text-4xl font-bold text-[#E8E8E8] mb-16"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Built for Serious Artists
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((f) => (
              <div
                key={f.name}
                className="glass rounded-2xl p-8 group hover:border-[#D4AF37]/40 transition-all hover:shadow-[0_0_20px_rgba(212,175,55,0.1)]"
              >
                <div className="text-[#D4AF37] mb-4 group-hover:scale-110 transition-transform inline-block">
                  {f.icon}
                </div>
                <h3
                  className="text-xl font-bold text-[#E8E8E8] mb-3"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {f.name}
                </h3>
                <p className="text-[#6A6A6A] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass rounded-3xl p-16 border-[#D4AF37]/20 shadow-[0_0_60px_rgba(212,175,55,0.08)]">
            <BookOpen size={40} className="text-[#D4AF37] mx-auto mb-6" />
            <h2
              className="text-5xl font-black gold-text mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Ready to Write?
            </h2>
            <p className="text-[#7A7A7A] mb-10 text-lg">Your pen is waiting. The booth is ready.</p>
            <Link
              href="/studio"
              className="inline-flex items-center gap-3 px-10 py-5 rounded-full font-bold text-[#0A0A0A] bg-gradient-to-r from-[#B8960C] via-[#D4AF37] to-[#FFD700] hover:from-[#D4AF37] hover:to-[#FFD700] transition-all shadow-[0_0_30px_rgba(212,175,55,0.3)] text-lg"
            >
              <Mic2 size={22} />
              Enter The Studio
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1A1A1A] py-8 px-6 text-center">
        <p className="text-[#3A3A3A] text-sm">
          © 2026 RapWriter.ai — <span className="text-[#D4AF37]/60">Sharpen Your Pen.</span>
        </p>
      </footer>
    </div>
  );
}
