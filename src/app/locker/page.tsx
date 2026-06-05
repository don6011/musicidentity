"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import BoothReadyModal from "@/components/BoothReadyModal";
import {
  Play,
  Music,
  BookOpen,
  Star,
  Shield,
  FolderOpen,
  Heart,
  MoreHorizontal,
  Plus,
  Edit3,
  Clock,
} from "lucide-react";

const beats = [
  { id: 1, name: "Midnight Drip", producer: "Metro", bpm: 140, genre: "Trap", liked: true },
  { id: 2, name: "South Side Story", producer: "DJ Paul", bpm: 85, genre: "Memphis", liked: false },
  { id: 3, name: "Pain & Glory", producer: "Southside", bpm: 72, genre: "Pain", liked: true },
  { id: 4, name: "Drill Season", producer: "808 Mafia", bpm: 145, genre: "Drill", liked: false },
];

type SongStatus = "Idea" | "Draft" | "Session Ready" | "Booth Ready™";
const statusColors: Record<SongStatus, string> = {
  "Idea": "text-[#5A5A5A] bg-[#1A1A1A] border-[#2A2A2A]",
  "Draft": "text-blue-400 bg-blue-400/10 border-blue-400/20",
  "Session Ready": "text-purple-400 bg-purple-400/10 border-purple-400/20",
  "Booth Ready™": "text-[#D4AF37] bg-[#D4AF37]/10 border-[#D4AF37]/30",
};

const songsInitial = [
  { id: 1, title: "Letter to the Streets", status: "Draft" as SongStatus, bars: 48, lastEdited: "2h ago" },
  { id: 2, title: "Never Fold", status: "Session Ready" as SongStatus, bars: 64, lastEdited: "1d ago" },
  { id: 3, title: "Pain is Temporary", status: "Idea" as SongStatus, bars: 12, lastEdited: "3d ago" },
  { id: 4, title: "Legacy", status: "Booth Ready™" as SongStatus, bars: 72, lastEdited: "1w ago" },
];

const hooks = [
  { id: 1, text: "Never fold when the pressure come / I stay gold when the weak ones run", song: "Never Fold" },
  { id: 2, text: "Pain is temporary, legacy forever / Built from the bottom, I'm better than ever", song: "Pain is Temporary" },
  { id: 3, text: "Streets raised me, ambition saved me / Now I move different, can't nothing faze me", song: "Letter to the Streets" },
];

const projects = [
  {
    id: 1,
    name: "The Prelude EP",
    tracks: 4,
    complete: 65,
    songs: ["Letter to the Streets", "Never Fold", "Pain is Temporary", "Legacy"],
  },
];

const tabs = [
  { key: "beats", label: "Beat Locker™", icon: <Music size={16} /> },
  { key: "songs", label: "Song Locker™", icon: <BookOpen size={16} /> },
  { key: "hooks", label: "Hook Locker™", icon: <Star size={16} /> },
  { key: "projects", label: "Projects", icon: <FolderOpen size={16} /> },
  { key: "booth", label: "Booth Ready™", icon: <Shield size={16} /> },
];

function LockerContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") || "beats";
  const [activeTab, setActiveTab] = useState(tabParam);
  const [songs, setSongs] = useState(songsInitial);
  const [playingBeat, setPlayingBeat] = useState<number | null>(null);
  const [boothSong, setBoothSong] = useState<string | null>(null);

  const advanceSong = (id: number) => {
    setSongs((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const statuses: SongStatus[] = ["Idea", "Draft", "Session Ready", "Booth Ready™"];
        const idx = statuses.indexOf(s.status);
        const next = statuses[idx + 1];
        if (!next) return s;
        if (next === "Booth Ready™") setTimeout(() => setBoothSong(s.title), 300);
        return { ...s, status: next };
      })
    );
  };

  return (
    <div className="flex min-h-screen bg-[#0A0A0A]">
      <Sidebar />

      <div className="flex-1 md:ml-60 flex flex-col min-h-screen">
        {/* Header */}
        <div className="border-b border-[#2A2A2A] px-6 py-6 glass-strong sticky top-0 z-30">
          <h1
            className="text-3xl font-black gold-text mb-1"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Your Locker
          </h1>
          <p className="text-sm text-[#5A5A5A]">Your second brain — beats, songs, hooks, and certified records.</p>

          {/* Tabs */}
          <div className="flex items-center gap-1 mt-5 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.key
                    ? "bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30"
                    : "text-[#5A5A5A] hover:text-[#D4AF37] hover:bg-[#D4AF37]/5"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 p-6">
          {/* Beat Locker */}
          {activeTab === "beats" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#E8E8E8]" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Beat Locker™
                </h2>
                <button className="flex items-center gap-2 text-sm text-[#D4AF37] border border-[#D4AF37]/30 px-4 py-2 rounded-xl hover:bg-[#D4AF37]/5 transition-all">
                  <Plus size={14} /> Add Beat
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {beats.map((beat) => (
                  <div key={beat.id} className="glass rounded-2xl p-5 hover:border-[#D4AF37]/30 transition-all group">
                    {/* Waveform visualization */}
                    <div className="flex items-end gap-0.5 h-12 mb-4">
                      {Array.from({ length: 24 }).map((_, i) => (
                        <div
                          key={i}
                          className={`flex-1 rounded-full transition-all ${
                            playingBeat === beat.id ? "bg-[#D4AF37]" : "bg-[#2A2A2A] group-hover:bg-[#3A3A3A]"
                          }`}
                          style={{
                            height: `${20 + Math.sin(i * 0.8) * 15 + Math.cos(i * 1.2) * 10}px`,
                            opacity: playingBeat === beat.id ? 1 : 0.6,
                          }}
                        />
                      ))}
                    </div>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-[#E8E8E8]" style={{ fontFamily: "'Playfair Display', serif" }}>
                          {beat.name}
                        </p>
                        <p className="text-xs text-[#5A5A5A]">prod. {beat.producer}</p>
                      </div>
                      <button className={`${beat.liked ? "text-[#D4AF37]" : "text-[#3A3A3A]"} hover:text-[#D4AF37] transition-colors`}>
                        <Heart size={16} className={beat.liked ? "fill-[#D4AF37]" : ""} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-2 py-1 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#6A6A6A]">
                          {beat.genre}
                        </span>
                        <span className="text-[10px] text-[#5A5A5A]">{beat.bpm} BPM</span>
                      </div>
                      <button
                        onClick={() => setPlayingBeat(playingBeat === beat.id ? null : beat.id)}
                        className="w-8 h-8 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center hover:bg-[#D4AF37] hover:text-[#0A0A0A] transition-all text-[#D4AF37]"
                      >
                        <Play size={12} className="ml-0.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Song Locker */}
          {activeTab === "songs" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#E8E8E8]" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Song Locker™
                </h2>
                <button className="flex items-center gap-2 text-sm text-[#D4AF37] border border-[#D4AF37]/30 px-4 py-2 rounded-xl hover:bg-[#D4AF37]/5 transition-all">
                  <Plus size={14} /> New Song
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {songs.map((song) => (
                  <div key={song.id} className="glass rounded-2xl p-6 hover:border-[#D4AF37]/30 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-[#E8E8E8]" style={{ fontFamily: "'Playfair Display', serif" }}>
                          {song.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock size={12} className="text-[#4A4A4A]" />
                          <span className="text-xs text-[#4A4A4A]">{song.lastEdited}</span>
                          <span className="text-xs text-[#4A4A4A]">· {song.bars} bars</span>
                        </div>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full border ${statusColors[song.status]}`}>
                        {song.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <a href="/studio" className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[#D4AF37] border border-[#D4AF37]/20 hover:bg-[#D4AF37]/10 transition-all">
                        <Edit3 size={12} /> Write
                      </a>
                      {song.status !== "Booth Ready™" && (
                        <button
                          onClick={() => advanceSong(song.id)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[#9A9A9A] border border-[#2A2A2A] hover:border-[#D4AF37]/30 hover:text-[#D4AF37] transition-all"
                        >
                          Mark as {["Idea","Draft","Session Ready","Booth Ready™"][["Idea","Draft","Session Ready","Booth Ready™"].indexOf(song.status)+1]}
                        </button>
                      )}
                      <button className="ml-auto text-[#4A4A4A] hover:text-[#D4AF37] transition-colors">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hook Locker */}
          {activeTab === "hooks" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#E8E8E8]" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Hook Locker™
                </h2>
                <button className="flex items-center gap-2 text-sm text-[#D4AF37] border border-[#D4AF37]/30 px-4 py-2 rounded-xl hover:bg-[#D4AF37]/5 transition-all">
                  <Plus size={14} /> Save Hook
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {hooks.map((hook) => (
                  <div key={hook.id} className="glass rounded-2xl p-6 hover:border-[#D4AF37]/30 transition-all">
                    <Star size={16} className="text-[#D4AF37] mb-4" />
                    <blockquote className="text-[#C8C8C8] italic leading-relaxed mb-4 text-sm">
                      &ldquo;{hook.text}&rdquo;
                    </blockquote>
                    <p className="text-xs text-[#4A4A4A]">from <span className="text-[#D4AF37]">{hook.song}</span></p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {activeTab === "projects" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#E8E8E8]" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Projects
                </h2>
                <button className="flex items-center gap-2 text-sm text-[#D4AF37] border border-[#D4AF37]/30 px-4 py-2 rounded-xl hover:bg-[#D4AF37]/5 transition-all">
                  <Plus size={14} /> New Project
                </button>
              </div>
              <div className="space-y-4">
                {projects.map((proj) => (
                  <div key={proj.id} className="glass rounded-2xl p-6 hover:border-[#D4AF37]/30 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-black text-[#E8E8E8]" style={{ fontFamily: "'Playfair Display', serif" }}>
                          {proj.name}
                        </h3>
                        <p className="text-sm text-[#5A5A5A] mt-1">{proj.tracks} tracks</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-black gold-text" style={{ fontFamily: "'Playfair Display', serif" }}>
                          {proj.complete}%
                        </p>
                        <p className="text-xs text-[#5A5A5A]">complete</p>
                      </div>
                    </div>
                    <div className="h-2 bg-[#1A1A1A] rounded-full overflow-hidden mb-4">
                      <div
                        className="h-full bg-gradient-to-r from-[#B8960C] to-[#D4AF37] rounded-full"
                        style={{ width: `${proj.complete}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {proj.songs.map((song) => (
                        <div key={song} className="bg-[#111111] rounded-xl p-3 border border-[#2A2A2A]">
                          <p className="text-xs text-[#8A8A8A] truncate">{song}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Booth Ready */}
          {activeTab === "booth" && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-[#E8E8E8]" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Booth Ready™ Vault
                </h2>
                <p className="text-sm text-[#5A5A5A] mt-1">Songs certified for recording.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {songs.filter((s) => s.status === "Booth Ready™").map((song) => (
                  <div
                    key={song.id}
                    className="glass rounded-2xl p-8 text-center border-[#D4AF37]/20 shadow-[0_0_30px_rgba(212,175,55,0.06)] hover:shadow-[0_0_50px_rgba(212,175,55,0.12)] transition-all"
                  >
                    {/* Mini seal */}
                    <div className="relative w-20 h-20 mx-auto mb-4">
                      <div className="absolute inset-0 rounded-full border-2 border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.3)]" />
                      <div className="absolute inset-2 rounded-full border border-[#D4AF37]/40" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Shield size={24} className="text-[#D4AF37]" />
                      </div>
                    </div>
                    <p
                      className="text-xs uppercase tracking-widest text-[#D4AF37] mb-2"
                    >
                      Booth Ready™
                    </p>
                    <h3
                      className="text-xl font-bold text-[#E8E8E8] mb-1"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {song.title}
                    </h3>
                    <p className="text-xs text-[#4A4A4A]">{song.bars} bars · Certified</p>
                  </div>
                ))}
                {songs.filter((s) => s.status === "Booth Ready™").length === 0 && (
                  <div className="col-span-full text-center py-20">
                    <Shield size={40} className="text-[#2A2A2A] mx-auto mb-4" />
                    <p className="text-[#4A4A4A]">No songs certified yet.</p>
                    <p className="text-xs text-[#3A3A3A] mt-2">Complete a song in the Song Locker to earn Booth Ready™ status.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {boothSong && (
        <BoothReadyModal songTitle={boothSong} onClose={() => setBoothSong(null)} />
      )}
    </div>
  );
}

export default function LockerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center"><div className="gold-text text-xl" style={{fontFamily:"'Playfair Display',serif"}}>Loading...</div></div>}>
      <LockerContent />
    </Suspense>
  );
}
