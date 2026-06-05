"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mic2, Feather, Music, BookOpen, FolderOpen, Star, Shield, ChevronRight } from "lucide-react";

const navItems = [
  { href: "/studio", icon: <Feather size={18} />, label: "Ghost Studio™" },
  { href: "/locker?tab=beats", icon: <Music size={18} />, label: "Beat Locker™" },
  { href: "/locker?tab=songs", icon: <BookOpen size={18} />, label: "Song Locker™" },
  { href: "/locker?tab=hooks", icon: <Star size={18} />, label: "Hook Locker™" },
  { href: "/locker?tab=projects", icon: <FolderOpen size={18} />, label: "Projects" },
  { href: "/locker?tab=booth", icon: <Shield size={18} />, label: "Booth Ready™" },
];

const modes = ["Midnight Session", "Producer Room", "Ghost Studio"];

interface SidebarProps {
  activeMode?: string;
  onModeChange?: (mode: string) => void;
}

export default function Sidebar({ activeMode = "Ghost Studio", onModeChange }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen glass-strong border-r border-[#2A2A2A] z-40 fixed left-0 top-0">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-[#2A2A2A]">
        <Link href="/" className="flex items-center gap-2">
          <Mic2 size={20} className="text-[#D4AF37]" />
          <span
            className="text-lg font-black gold-text"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            RapWriter.ai
          </span>
        </Link>
        <p className="text-[10px] text-[#4A4A4A] mt-1 tracking-widest uppercase">Sharpen Your Pen.</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = item.href === "/studio" ? pathname === "/studio" : pathname?.startsWith("/locker");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                isActive && item.href.startsWith(pathname ?? "")
                  ? "bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20"
                  : "text-[#6A6A6A] hover:text-[#D4AF37] hover:bg-[#D4AF37]/5"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
        <div className="pt-2">
          <Link
            href="/marketplace"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
              pathname === "/marketplace"
                ? "bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20"
                : "text-[#6A6A6A] hover:text-[#D4AF37] hover:bg-[#D4AF37]/5"
            }`}
          >
            <Music size={18} />
            Marketplace
          </Link>
        </div>
      </nav>

      {/* Active Project */}
      <div className="mx-3 mb-3 p-4 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A]">
        <p className="text-[10px] text-[#4A4A4A] uppercase tracking-widest mb-2">Active Project</p>
        <p className="text-sm font-semibold text-[#E8E8E8]" style={{ fontFamily: "'Playfair Display', serif" }}>
          The Prelude EP
        </p>
        <p className="text-xs text-[#6A6A6A] mt-1">4 tracks · 65% complete</p>
        <div className="mt-2 h-1 bg-[#2A2A2A] rounded-full overflow-hidden">
          <div className="h-full w-[65%] bg-gradient-to-r from-[#B8960C] to-[#D4AF37] rounded-full" />
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="mx-3 mb-6 p-4 rounded-xl bg-[#111111] border border-[#2A2A2A]">
        <p className="text-[10px] text-[#4A4A4A] uppercase tracking-widest mb-3">Studio Mode</p>
        <div className="space-y-1">
          {modes.map((mode) => (
            <button
              key={mode}
              onClick={() => onModeChange?.(mode)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${
                activeMode === mode
                  ? "bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20"
                  : "text-[#5A5A5A] hover:text-[#D4AF37] hover:bg-[#D4AF37]/5"
              }`}
            >
              {mode}
              {activeMode === mode && <ChevronRight size={12} />}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
