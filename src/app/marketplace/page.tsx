"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Play, Pause, Heart, ShoppingCart, Plus, Music } from "lucide-react";

const genres = ["All", "Trap", "Drill", "Memphis", "Southern Soul", "Pain", "Storytelling", "Club"];

const allBeats = [
  { id: 1, name: "Midnight Drip", producer: "Metro", bpm: 140, genre: "Trap", price: 29.99, liked: true },
  { id: 2, name: "South Side Story", producer: "DJ Paul", bpm: 85, genre: "Memphis", price: 24.99, liked: false },
  { id: 3, name: "Pain & Glory", producer: "Southside", bpm: 72, genre: "Pain", price: 19.99, liked: true },
  { id: 4, name: "Drill Season", producer: "808 Mafia", bpm: 145, genre: "Drill", price: 34.99, liked: false },
  { id: 5, name: "Southern Nights", producer: "Zaytoven", bpm: 95, genre: "Southern Soul", price: 27.99, liked: false },
  { id: 6, name: "Chapter One", producer: "No ID", bpm: 88, genre: "Storytelling", price: 39.99, liked: true },
  { id: 7, name: "Neon District", producer: "Wheezy", bpm: 135, genre: "Club", price: 22.99, liked: false },
  { id: 8, name: "Last Letter", producer: "Southside", bpm: 68, genre: "Pain", price: 24.99, liked: false },
  { id: 9, name: "Memphis Raw", producer: "DJ Paul", bpm: 78, genre: "Memphis", price: 19.99, liked: true },
  { id: 10, name: "Ice Cold", producer: "Metro", bpm: 138, genre: "Trap", price: 29.99, liked: false },
  { id: 11, name: "Sermon", producer: "No ID", bpm: 92, genre: "Storytelling", price: 44.99, liked: false },
  { id: 12, name: "Midnight Club", producer: "Wheezy", bpm: 128, genre: "Club", price: 19.99, liked: true },
];

export default function MarketplacePage() {
  const [activeGenre, setActiveGenre] = useState("All");
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [likedBeats, setLikedBeats] = useState<Set<number>>(
    new Set(allBeats.filter((b) => b.liked).map((b) => b.id))
  );
  const [inLocker, setInLocker] = useState<Set<number>>(new Set());

  const filtered = activeGenre === "All" ? allBeats : allBeats.filter((b) => b.genre === activeGenre);

  const toggleLike = (id: number) => {
    setLikedBeats((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const addToLocker = (id: number) => {
    setInLocker((prev) => new Set([...prev, id]));
  };

  return (
    <div className="flex min-h-screen bg-[#0A0A0A]">
      <Sidebar />

      <div className="flex-1 md:ml-60 flex flex-col">
        {/* Header */}
        <div className="border-b border-[#2A2A2A] px-6 py-6 glass-strong sticky top-0 z-30">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-3xl font-black gold-text" style={{ fontFamily: "'Playfair Display', serif" }}>
              Marketplace
            </h1>
            <p className="text-sm text-[#5A5A5A]">{filtered.length} beats available</p>
          </div>
          <p className="text-sm text-[#5A5A5A] mb-5">Discover premium beats. License and add to your Beat Locker™.</p>

          {/* Genre Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {genres.map((g) => (
              <button
                key={g}
                onClick={() => setActiveGenre(g)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  activeGenre === g
                    ? "bg-[#D4AF37] text-[#0A0A0A] shadow-[0_0_16px_rgba(212,175,55,0.3)]"
                    : "glass text-[#6A6A6A] hover:text-[#D4AF37] hover:border-[#D4AF37]/30"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((beat) => {
              const isPlaying = playingId === beat.id;
              const isLiked = likedBeats.has(beat.id);
              const inL = inLocker.has(beat.id);

              return (
                <div
                  key={beat.id}
                  className="glass rounded-2xl p-5 group hover:border-[#D4AF37]/30 hover:shadow-[0_0_20px_rgba(212,175,55,0.08)] transition-all flex flex-col"
                >
                  {/* Waveform */}
                  <div className="relative flex items-end gap-0.5 h-14 mb-4 cursor-pointer" onClick={() => setPlayingId(isPlaying ? null : beat.id)}>
                    {Array.from({ length: 32 }).map((_, i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-full transition-all duration-300 ${
                          isPlaying ? "bg-[#D4AF37]" : "bg-[#2A2A2A] group-hover:bg-[#3A3A3A]"
                        }`}
                        style={{
                          height: `${15 + Math.abs(Math.sin(i * 0.7 + beat.id) * 20 + Math.cos(i * 1.1) * 15)}px`,
                        }}
                      />
                    ))}
                    {/* Overlay play button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-10 h-10 rounded-full bg-[#D4AF37]/90 flex items-center justify-center text-[#0A0A0A] shadow-lg">
                        {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-bold text-[#E8E8E8]" style={{ fontFamily: "'Playfair Display', serif" }}>
                        {beat.name}
                      </h3>
                      <button onClick={() => toggleLike(beat.id)} className="text-[#3A3A3A] hover:text-[#D4AF37] transition-colors ml-2 flex-shrink-0">
                        <Heart size={16} className={isLiked ? "fill-[#D4AF37] text-[#D4AF37]" : ""} />
                      </button>
                    </div>
                    <p className="text-xs text-[#5A5A5A] mb-3">prod. {beat.producer}</p>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-[10px] px-2 py-1 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#6A6A6A]">
                        {beat.genre}
                      </span>
                      <span className="text-[10px] text-[#5A5A5A]">{beat.bpm} BPM</span>
                    </div>
                  </div>

                  {/* Price & Actions */}
                  <div className="border-t border-[#2A2A2A] pt-4 flex items-center justify-between">
                    <span className="text-lg font-bold text-[#D4AF37]">${beat.price}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => addToLocker(beat.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                          inL
                            ? "bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30"
                            : "border border-[#2A2A2A] text-[#5A5A5A] hover:border-[#D4AF37]/30 hover:text-[#D4AF37]"
                        }`}
                      >
                        {inL ? <Music size={12} /> : <Plus size={12} />}
                        {inL ? "In Locker" : "Add to Locker™"}
                      </button>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-[#D4AF37] text-[#0A0A0A] font-semibold hover:bg-[#FFD700] transition-colors">
                        <ShoppingCart size={12} /> License
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-24">
              <Music size={48} className="text-[#2A2A2A] mx-auto mb-4" />
              <p className="text-[#5A5A5A]">No beats in this genre yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
