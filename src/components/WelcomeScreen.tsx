import React from "react";
import { AIPersona } from "../types";
import { Sparkles, PersonaIcon, ArrowUpRight, Zap, ImageIcon } from "./Icons";

interface WelcomeScreenProps {
  activePersona: AIPersona;
  onSelectPrompt: (prompt: string) => void;
  personas: AIPersona[];
  onSelectPersona: (persona: AIPersona) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  activePersona,
  onSelectPrompt,
  personas,
  onSelectPersona,
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return "İyi geceler";
    if (hour < 12) return "Günaydın";
    if (hour < 18) return "İyi günler";
    return "İyi akşamlar";
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-8 sm:py-12 max-w-4xl mx-auto w-full flex flex-col justify-center items-center relative z-10">
      {/* Hero Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-blue-300 text-xs font-medium mb-6 shadow-md shadow-blue-500/10">
        <Sparkles className="w-3.5 h-3.5 text-blue-400" />
        <span>AVCI AI • Gemini 3.8 Flash Destekli</span>
      </div>

      {/* Main Greeting */}
      <h2 className="text-3xl sm:text-4xl font-extrabold text-white text-center tracking-tight mb-3 drop-shadow-sm">
        {getGreeting()}, ben <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">AVCI AI</span>.
      </h2>
      <p className="text-slate-400 text-sm sm:text-base text-center max-w-xl mb-10 leading-relaxed">
        Kod yazma, metin üretme, veri analizi, görsel inceleme veya aklınıza gelen her türlü soruda yanınızdayım.
      </p>

      {/* Persona Selection Bar */}
      <div className="w-full mb-8">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-1 flex items-center justify-between">
          <span>Bir Asistan Uzmanlığı Seçin</span>
          <span className="text-[11px] text-slate-400 font-normal">
            Aktif: {activePersona.name}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {personas.map((p) => {
            const isSelected = p.id === activePersona.id;
            return (
              <button
                key={p.id}
                id={`welcome-persona-${p.id}`}
                type="button"
                onClick={() => onSelectPersona(p)}
                className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between backdrop-blur-xl ${
                  isSelected
                    ? "bg-white/15 border-blue-400/60 shadow-lg shadow-blue-500/10 ring-1 ring-blue-400/30"
                    : "bg-white/[0.03] border-white/10 hover:bg-white/[0.08] hover:border-white/20"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${p.color} flex items-center justify-center text-white mb-2 shadow-md border border-white/20`}
                >
                  <PersonaIcon name={p.icon} className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-xs text-slate-100 truncate">
                    {p.name}
                  </div>
                  <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                    {p.tagline}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Starter Prompts Grid */}
      <div className="w-full">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-1 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Örnek Başlangıç Soruları ({activePersona.name})</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {activePersona.starterPrompts.map((prompt, idx) => (
            <button
              key={idx}
              id={`starter-prompt-${idx}`}
              type="button"
              onClick={() => onSelectPrompt(prompt)}
              className="group p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] backdrop-blur-xl border border-white/10 hover:border-blue-400/40 text-left transition-all shadow-sm flex items-start justify-between gap-3"
            >
              <span className="text-xs sm:text-sm text-slate-300 group-hover:text-white leading-relaxed">
                {prompt}
              </span>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors flex-shrink-0 mt-0.5" />
            </button>
          ))}
        </div>
      </div>

      {/* Multimodal feature card */}
      <div className="w-full mt-6 p-4 rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/10 flex items-center gap-3 text-xs text-slate-400">
        <div className="p-2 rounded-xl bg-white/10 text-blue-400 flex-shrink-0 border border-white/10">
          <ImageIcon className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <strong className="text-slate-200">Çok Modlu Görsel Analizi:</strong> Soru sormak, kod/grafik incelemek veya metin çıkarmak için görselleri doğrudan sohbet kutusuna sürükleyip bırakabilirsiniz.
        </div>
      </div>
    </div>
  );
};
