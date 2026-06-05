"use client";

import { useState, useRef, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import BeatPlayer from "@/components/BeatPlayer";
import BoothReadyModal from "@/components/BoothReadyModal";
import {
  ChevronDown,
  ChevronRight,
  Mic2,
  Star,
  Wand2,
  Sparkles,
  ArrowRight,
  Music,
  Menu,
  X,
} from "lucide-react";

const sections = [
  { id: "hook", label: "Hook", placeholder: "Write your hook here — the ear candy that makes them replay it…" },
  { id: "verse1", label: "Verse 1", placeholder: "First verse — set the scene, establish your narrative…" },
  { id: "verse2", label: "Verse 2", placeholder: "Second verse — deeper, more vulnerable or more aggressive…" },
  { id: "bridge", label: "Bridge", placeholder: "Bridge — flip the emotion, change the energy…" },
  { id: "outro", label: "Outro", placeholder: "Outro — close it out with intention…" },
];

const penCoachActions = [
  { label: "Improve Bar", key: "improve_bar" },
  { label: "Improve Hook", key: "improve_hook" },
  { label: "Add Emotion", key: "add_emotion" },
  { label: "More Commercial", key: "more_commercial" },
  { label: "More Southern", key: "more_southern" },
  { label: "Suggest Adlibs", key: "suggest_adlibs" },
  { label: "Rewrite Cleanly", key: "rewrite_cleanly" },
];

const penCoachResponses: Record<string, string[]> = {
  improve_bar: [
    "\"I move in silence like the letter K / They talk that talk but never had nothing to say\"",
    "\"Stack the bread, cut the snakes, that's the recipe / Never let 'em see you sweat, that's the legacy\"",
  ],
  improve_hook: [
    "Try a melodic approach — rise on the last word: \"Never fold when the pressure come, I stay gold\"",
    "Simplify for radio: shorter phrases, more repetition on the hook's peak moment.",
  ],
  add_emotion: [
    "Anchor it to a specific memory: a person, a place, a smell. Specificity = emotion.",
    "\"And Mama cried the night I left / Said son don't waste that gift you got / I'm writing this from the top\"",
  ],
  more_commercial: [
    "Lead with the hook. Shorten verses to 8–12 bars max. Add a pre-hook for build.",
    "Try a sing-song cadence on the hook: melodic phrasing over the trap 808s lands wider.",
  ],
  more_southern: [
    "\"Slow it down, talk ya talk / Four-four in the lap, glide the block\"",
    "Memphis cadence: triplet flows, dark minor keys, reference the city's hustle and struggle.",
  ],
  suggest_adlibs: [
    "Add: (yeah), (ayy), (let's go), (real talk), (drip), (slatt) — sparingly at phrase ends.",
    "Call-and-response adlib style: main line + echo repeat with a riff on the end word.",
  ],
  rewrite_cleanly: [
    "Strip all filler. Every word earns its spot. Rewrite with: Subject → Action → Punch.",
    "Cut conjunctions and weak verbs. Lead with strong nouns and vivid verbs.",
  ],
};

const progressSteps = ["Idea", "Draft", "Session Ready", "Booth Ready™"];

type SongStatus = "Idea" | "Draft" | "Session Ready" | "Booth Ready™";

export default function StudioPage() {
  const [activeSection, setActiveSection] = useState("hook");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["hook"]));
  const [sectionContent, setSectionContent] = useState<Record<string, string>>({});
  const [penCoachResponse, setPenCoachResponse] = useState("");
  const [loadingCoach, setLoadingCoach] = useState(false);
  const [activeMode, setActiveMode] = useState("Ghost Studio");
  const [songStatus, setSongStatus] = useState<SongStatus>("Idea");
  const [showBooth, setShowBooth] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});

  const progressIndex = progressSteps.indexOf(songStatus);

  const handleCoachAction = (key: string) => {
    setLoadingCoach(true);
    setPenCoachResponse("");
    setTimeout(() => {
      const responses = penCoachResponses[key] || ["Working on it..."];
      setPenCoachResponse(responses[Math.floor(Math.random() * responses.length)]);
      setLoadingCoach(false);
    }, 800);
  };

  const advanceStatus = () => {
    const next = progressSteps[progressIndex + 1] as SongStatus;
    if (next) {
      setSongStatus(next);
      if (next === "Booth Ready™") {
        setTimeout(() => setShowBooth(true), 300);
      }
    }
  };

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setActiveSection(id);
  };

  const autoResize = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };

  const charCount = (id: string) => {
    const content = sectionContent[id] || "";
    const lines = content.split("\n").filter((l) => l.trim()).length;
    return { chars: content.length, bars: lines };
  };

  return (
    <div className="flex min-h-screen bg-[#0A0A0A]">
      <Sidebar activeMode={activeMode} onModeChange={setActiveMode} />

      {/* Mobile menu */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 glass-strong border-b border-[#2A2A2A]">
        <span className="gold-text font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>RapWriter.ai</span>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-[#D4AF37]">
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Main content area */}
      <div className="flex-1 md:ml-60 flex min-h-screen">
        {/* Center */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Top bar */}
          <div className="sticky top-0 z-30 glass-strong border-b border-[#2A2A2A] px-6 py-4">
            <div className="flex items-center justify-between flex-wrap gap-3 mt-8 md:mt-0">
              <div>
                <p className="text-[10px] text-[#4A4A4A] uppercase tracking-widest">Active Project</p>
                <h2
                  className="text-lg font-bold text-[#E8E8E8] flex items-center gap-2"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  The Prelude EP
                  <ChevronRight size={14} className="text-[#D4AF37]" />
                  <span className="text-[#D4AF37]">Letter to the Streets</span>
                </h2>
              </div>
              <div className="flex items-center gap-4 text-xs text-[#5A5A5A]">
                <div className="flex items-center gap-2 glass rounded-lg px-3 py-2">
                  <Music size={14} className="text-[#D4AF37]" />
                  <span>Midnight Drip</span>
                  <span className="text-[#D4AF37]">140 BPM</span>
                </div>
                <div className="glass rounded-lg px-3 py-2">
                  prod. <span className="text-[#D4AF37]">Metro</span>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs border ${
                    songStatus === "Booth Ready™"
                      ? "bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/40"
                      : "bg-[#1A1A1A] text-[#6A6A6A] border-[#2A2A2A]"
                  }`}
                >
                  {songStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Writing Pad */}
          <div className="flex-1 p-6 space-y-3 pb-40">
            {sections.map((sec) => {
              const expanded = expandedSections.has(sec.id);
              const isActive = activeSection === sec.id;
              const { chars, bars } = charCount(sec.id);

              return (
                <div
                  key={sec.id}
                  className={`glass rounded-2xl overflow-hidden transition-all ${
                    isActive ? "border-[#D4AF37]/40 shadow-[0_0_20px_rgba(212,175,55,0.08)]" : "border-[#2A2A2A]"
                  }`}
                >
                  <button
                    onClick={() => toggleSection(sec.id)}
                    className={`w-full flex items-center justify-between px-5 py-4 text-left transition-colors ${
                      isActive ? "bg-[#D4AF37]/5" : "hover:bg-[#1A1A1A]"
                    }`}
                  >
                    <span
                      className={`font-bold tracking-wide ${isActive ? "text-[#D4AF37]" : "text-[#5A5A5A]"}`}
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {sec.label}
                    </span>
                    <div className="flex items-center gap-3">
                      {chars > 0 && (
                        <span className="text-[10px] text-[#4A4A4A]">
                          {bars} {bars === 1 ? "bar" : "bars"} · {chars} chars
                        </span>
                      )}
                      <ChevronDown
                        size={16}
                        className={`text-[#4A4A4A] transition-transform ${expanded ? "rotate-180" : ""}`}
                      />
                    </div>
                  </button>
                  {expanded && (
                    <div className="px-5 pb-5">
                      <textarea
                        ref={(el) => { textareaRefs.current[sec.id] = el; }}
                        value={sectionContent[sec.id] || ""}
                        onChange={(e) => {
                          setSectionContent((prev) => ({ ...prev, [sec.id]: e.target.value }));
                          autoResize(e.target);
                        }}
                        onFocus={() => setActiveSection(sec.id)}
                        placeholder={sec.placeholder}
                        className="w-full bg-transparent text-[#C8C8C8] placeholder:text-[#3A3A3A] resize-none outline-none text-base leading-8 min-h-[140px] font-mono"
                        style={{ lineHeight: "2rem" }}
                      />
                      {isActive && (
                        <div className="border-t border-[#D4AF37]/10 pt-3 mt-2 flex items-center justify-between">
                          <p className="text-[10px] text-[#4A4A4A] tracking-widest uppercase">
                            {sec.label} · Ghost Studio™
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-px bg-[#D4AF37]/20" />
                            <Mic2 size={12} className="text-[#D4AF37]/40" />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Progress Tracker */}
          <div className="sticky bottom-20 md:bottom-24 mx-6 mb-2 glass rounded-2xl p-4 border-[#2A2A2A]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1">
                {progressSteps.map((step, i) => (
                  <div key={step} className="flex items-center flex-1">
                    <div
                      className={`flex items-center gap-2 ${
                        i <= progressIndex ? "text-[#D4AF37]" : "text-[#3A3A3A]"
                      }`}
                    >
                      <div
                        className={`w-2.5 h-2.5 rounded-full border-2 flex-shrink-0 ${
                          i < progressIndex
                            ? "bg-[#D4AF37] border-[#D4AF37]"
                            : i === progressIndex
                            ? "bg-transparent border-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.6)]"
                            : "bg-transparent border-[#2A2A2A]"
                        }`}
                      />
                      <span className="text-[10px] whitespace-nowrap hidden sm:block">{step}</span>
                    </div>
                    {i < progressSteps.length - 1 && (
                      <div
                        className={`flex-1 h-px mx-2 ${
                          i < progressIndex ? "bg-[#D4AF37]" : "bg-[#2A2A2A]"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
              {progressIndex < progressSteps.length - 1 && (
                <button
                  onClick={advanceStatus}
                  className="ml-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 hover:bg-[#D4AF37]/20 transition-all text-xs font-semibold flex-shrink-0"
                >
                  Mark as {progressSteps[progressIndex + 1]}
                  <ArrowRight size={12} />
                </button>
              )}
            </div>
            <div className="mt-2 h-1 bg-[#1A1A1A] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#B8960C] to-[#D4AF37] rounded-full transition-all duration-700"
                style={{ width: `${(progressIndex / (progressSteps.length - 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right Sidebar — Pen Coach */}
        <div className="hidden lg:flex flex-col w-72 border-l border-[#2A2A2A] bg-[#0D0D0D] p-5 gap-4 sticky top-0 h-screen overflow-y-auto">
          <div className="pt-2">
            <div className="flex items-center gap-2 mb-1">
              <Wand2 size={18} className="text-[#D4AF37]" />
              <h3
                className="text-lg font-bold text-[#D4AF37]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Pen Coach™
              </h3>
            </div>
            <p className="text-[10px] text-[#4A4A4A] uppercase tracking-widest">AI Writing Assistant</p>
          </div>

          <div className="h-px bg-[#D4AF37]/10" />

          <p className="text-xs text-[#5A5A5A]">
            Select a section in the writing pad, then use these tools to sharpen your bars.
          </p>

          <div className="space-y-2">
            {penCoachActions.map((action) => (
              <button
                key={action.key}
                onClick={() => handleCoachAction(action.key)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm text-[#9A9A9A] glass border border-[#2A2A2A] hover:border-[#D4AF37]/40 hover:text-[#D4AF37] hover:bg-[#D4AF37]/5 transition-all group"
              >
                {action.label}
                <Sparkles size={14} className="opacity-0 group-hover:opacity-100 text-[#D4AF37] transition-opacity" />
              </button>
            ))}
          </div>

          {/* Response area */}
          {(penCoachResponse || loadingCoach) && (
            <div className="glass rounded-xl p-4 border-[#D4AF37]/20 space-y-2">
              <p className="text-[10px] text-[#D4AF37] uppercase tracking-widest">Pen Coach™ Says:</p>
              {loadingCoach ? (
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"
                      style={{ animation: `goldPulse 1s ease-in-out ${i * 0.2}s infinite` }}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#C8C8C8] italic leading-relaxed">{penCoachResponse}</p>
              )}
            </div>
          )}

          <div className="h-px bg-[#2A2A2A]" />

          {/* Active section info */}
          <div className="glass rounded-xl p-4 border-[#2A2A2A]">
            <p className="text-[10px] text-[#4A4A4A] uppercase tracking-widest mb-2">Active Section</p>
            <p className="text-sm font-semibold text-[#D4AF37]" style={{ fontFamily: "'Playfair Display', serif" }}>
              {sections.find((s) => s.id === activeSection)?.label}
            </p>
            <div className="flex gap-4 mt-2">
              <div>
                <p className="text-[10px] text-[#4A4A4A]">Bars</p>
                <p className="text-lg font-bold text-[#E8E8E8]">{charCount(activeSection).bars}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#4A4A4A]">Characters</p>
                <p className="text-lg font-bold text-[#E8E8E8]">{charCount(activeSection).chars}</p>
              </div>
            </div>
          </div>

          <div className="mt-auto">
            <div className="glass rounded-xl p-4 border-[#D4AF37]/10 text-center">
              <Star size={20} className="text-[#D4AF37] mx-auto mb-2" />
              <p className="text-xs text-[#4A4A4A]">Your pen is sharpened.</p>
              <p className="text-xs text-[#3A3A3A] mt-1">Mode: <span className="text-[#D4AF37]">{activeMode}</span></p>
            </div>
          </div>
        </div>
      </div>

      <BeatPlayer />

      {showBooth && (
        <BoothReadyModal
          songTitle="Letter to the Streets"
          onClose={() => setShowBooth(false)}
        />
      )}
    </div>
  );
}
