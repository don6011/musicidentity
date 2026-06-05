"use client";

import { useEffect, useState } from "react";
import { Shield, X } from "lucide-react";

interface BoothReadyModalProps {
  songTitle: string;
  onClose: () => void;
}

export default function BoothReadyModal({ songTitle, onClose }: BoothReadyModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 50);
  }, []);

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center transition-all duration-700 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(20px)" }}
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-[#4A4A4A] hover:text-[#D4AF37] transition-colors"
      >
        <X size={24} />
      </button>

      <div
        className={`text-center max-w-md mx-auto px-6 transition-all duration-700 delay-200 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* Ornate Gold Seal */}
        <div className="relative w-48 h-48 mx-auto mb-8">
          {/* Outer ring */}
          <div
            className="absolute inset-0 rounded-full border-4 border-[#D4AF37]"
            style={{ boxShadow: "0 0 40px rgba(212,175,55,0.4), inset 0 0 40px rgba(212,175,55,0.1)" }}
          />
          {/* Inner ring */}
          <div className="absolute inset-3 rounded-full border-2 border-[#D4AF37]/50" />
          {/* Decorative dashes ring */}
          <div className="absolute inset-6 rounded-full border border-dashed border-[#D4AF37]/30" />
          {/* Center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Shield size={40} className="text-[#D4AF37] mb-1" />
            <span className="text-[8px] tracking-[0.3em] uppercase text-[#D4AF37] font-bold">Certified</span>
          </div>
          {/* Star decorations */}
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <div
              key={deg}
              className="absolute w-2 h-2 bg-[#D4AF37] rounded-full"
              style={{
                top: "50%",
                left: "50%",
                transform: `translate(-50%, -50%) rotate(${deg}deg) translateY(-88px)`,
              }}
            />
          ))}
        </div>

        <p
          className="text-5xl font-black gold-text mb-2"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          BOOTH READY™
        </p>
        <p className="text-sm text-[#6A6A6A] tracking-widest uppercase mb-8">Prepared in RapWriter.ai</p>

        <div className="glass rounded-2xl p-6 border-[#D4AF37]/20 space-y-3">
          <p className="text-xs text-[#4A4A4A] uppercase tracking-widest">Song Title</p>
          <p
            className="text-2xl font-bold text-[#E8E8E8]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {songTitle}
          </p>
          <div className="w-16 h-px bg-[#D4AF37]/30 mx-auto" />
          <p className="text-xs text-[#4A4A4A]">Date Certified</p>
          <p className="text-sm text-[#D4AF37]">{today}</p>
        </div>

        <div className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10">
          <Shield size={14} className="text-[#D4AF37]" />
          <span className="text-sm text-[#D4AF37] font-semibold tracking-wide">Certified For Recording</span>
        </div>

        <p className="mt-6 text-xs text-[#3A3A3A]">
          This song has been crafted and refined to studio quality standards.
        </p>
      </div>
    </div>
  );
}
