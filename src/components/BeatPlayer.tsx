"use client";

import { useState } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart, Repeat } from "lucide-react";

const beats = [
  { name: "Midnight Drip", producer: "Metro", bpm: 140, genre: "Trap" },
  { name: "South Side Story", producer: "DJ Paul", bpm: 85, genre: "Memphis" },
  { name: "Pain & Glory", producer: "Southside", bpm: 72, genre: "Pain" },
  { name: "Drill Season", producer: "808 Mafia", bpm: 145, genre: "Drill" },
];

export default function BeatPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [progress, setProgress] = useState(34);
  const [volume, setVolume] = useState(80);
  const [looping, setLooping] = useState(false);
  const [liked, setLiked] = useState(false);

  const beat = beats[currentBeat];

  const prev = () => setCurrentBeat((c) => (c - 1 + beats.length) % beats.length);
  const next = () => setCurrentBeat((c) => (c + 1) % beats.length);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 ml-30">
      <div
        className="glass rounded-2xl px-6 py-4 border border-[#D4AF37]/20 shadow-[0_8px_40px_rgba(0,0,0,0.6),0_0_30px_rgba(212,175,55,0.1)]"
        style={{ minWidth: "480px", marginLeft: "120px" }}
      >
        <div className="flex items-center gap-6">
          {/* Track info */}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[#E8E8E8] truncate" style={{ fontFamily: "'Playfair Display', serif" }}>
              {beat.name}
            </p>
            <p className="text-xs text-[#6A6A6A]">prod. {beat.producer} · {beat.bpm} BPM · {beat.genre}</p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <button onClick={prev} className="text-[#6A6A6A] hover:text-[#D4AF37] transition-colors">
              <SkipBack size={18} />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-10 h-10 rounded-full bg-[#D4AF37] hover:bg-[#FFD700] flex items-center justify-center text-[#0A0A0A] transition-colors shadow-[0_0_20px_rgba(212,175,55,0.4)] gold-pulse"
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
            </button>
            <button onClick={next} className="text-[#6A6A6A] hover:text-[#D4AF37] transition-colors">
              <SkipForward size={18} />
            </button>
          </div>

          {/* Progress */}
          <div className="flex-1 flex items-center gap-2">
            <span className="text-[10px] text-[#4A4A4A]">1:24</span>
            <div className="flex-1 relative group">
              <div className="h-1 bg-[#2A2A2A] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#B8960C] to-[#D4AF37] rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="absolute inset-0 w-full opacity-0 cursor-pointer"
              />
            </div>
            <span className="text-[10px] text-[#4A4A4A]">4:05</span>
          </div>

          {/* Extra controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLooping(!looping)}
              className={`transition-colors ${looping ? "text-[#D4AF37]" : "text-[#4A4A4A] hover:text-[#D4AF37]"}`}
            >
              <Repeat size={16} />
            </button>
            <div className="flex items-center gap-2">
              <Volume2 size={16} className="text-[#4A4A4A]" />
              <div className="relative w-16">
                <div className="h-1 bg-[#2A2A2A] rounded-full overflow-hidden">
                  <div className="h-full bg-[#D4AF37]/60 rounded-full" style={{ width: `${volume}%` }} />
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer"
                />
              </div>
            </div>
            <button
              onClick={() => setLiked(!liked)}
              className={`transition-colors ${liked ? "text-[#D4AF37]" : "text-[#4A4A4A] hover:text-[#D4AF37]"}`}
            >
              <Heart size={16} className={liked ? "fill-[#D4AF37]" : ""} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
