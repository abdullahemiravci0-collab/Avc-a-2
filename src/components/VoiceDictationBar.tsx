import React, { useState } from "react";
import {
  Mic,
  MicOff,
  Square,
  Send,
  X,
  RotateCcw,
  Languages,
  AlertCircle,
  Sparkles,
} from "./Icons";
import { SUPPORTED_LANGUAGES } from "../hooks/useSpeechToText";

interface VoiceDictationBarProps {
  isListening: boolean;
  interimTranscript: string;
  transcript: string;
  volume: number;
  durationSeconds: number;
  language: string;
  onLanguageChange: (lang: string) => void;
  onStop: () => void;
  onCancel: () => void;
  onClear: () => void;
  onInsertPunctuation: (char: string) => void;
  onSendNow: () => void;
  error: string | null;
  onClearError: () => void;
}

export const VoiceDictationBar: React.FC<VoiceDictationBarProps> = ({
  isListening,
  interimTranscript,
  transcript,
  volume,
  durationSeconds,
  language,
  onLanguageChange,
  onStop,
  onCancel,
  onClear,
  onInsertPunctuation,
  onSendNow,
  error,
  onClearError,
}) => {
  const [showLangMenu, setShowLangMenu] = useState(false);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const currentLangObj =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) ||
    SUPPORTED_LANGUAGES[0];

  // Dynamic waveform bars (7 equalizer bars reacting to microphone volume)
  const renderVisualizerBars = () => {
    return Array.from({ length: 9 }).map((_, i) => {
      // Calculate dynamic bar height based on volume and index
      const baseHeight = 6;
      const variation = Math.sin((i / 8) * Math.PI) * (volume / 1.6);
      const randomJitter = isListening ? Math.sin(Date.now() / 200 + i) * 3 : 0;
      const height = Math.max(
        baseHeight,
        Math.min(32, baseHeight + variation + randomJitter)
      );

      return (
        <span
          key={i}
          style={{ height: `${height}px` }}
          className={`w-1 rounded-full transition-all duration-75 ${
            isListening
              ? "bg-gradient-to-t from-blue-500 to-indigo-400 shadow-xs shadow-blue-500/50"
              : "bg-white/20"
          }`}
        />
      );
    });
  };

  return (
    <div
      id="voice-dictation-panel"
      className="p-3.5 mb-2 rounded-2xl bg-[#0e0e18]/90 backdrop-blur-2xl border border-blue-500/30 shadow-2xl shadow-blue-500/10 animate-fadeIn"
    >
      {/* Error notification if any */}
      {error && (
        <div className="mb-3 p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/30 flex items-center justify-between text-xs text-rose-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={onClearError}
            className="p-1 hover:bg-rose-900/50 rounded text-rose-300 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Header: Status Indicator, Timer & Language Switcher */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          {/* Pulsing Mic Badge */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
            <span>{isListening ? "Dinleniyor..." : "Duraklatıldı"}</span>
          </div>

          {/* Time Counter */}
          <span className="font-mono text-xs font-medium text-slate-400">
            {formatTime(durationSeconds)}
          </span>

          {/* Reactive Sound Equalizer */}
          <div className="flex items-center gap-1 h-8 px-2 rounded-xl bg-black/40 border border-white/5">
            {renderVisualizerBars()}
          </div>
        </div>

        {/* Right: Language Switcher Dropdown */}
        <div className="relative">
          <button
            type="button"
            id="btn-voice-lang-menu"
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs text-slate-200 font-medium transition-colors"
          >
            <span>{currentLangObj.flag}</span>
            <span className="hidden sm:inline">{currentLangObj.label}</span>
            <Languages className="w-3 h-3 text-blue-400 ml-0.5" />
          </button>

          {showLangMenu && (
            <div className="absolute right-0 top-full mt-1.5 w-40 rounded-xl bg-[#0c0c16] border border-white/15 shadow-2xl p-1 z-30">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
                Dikte Dili
              </div>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    onLanguageChange(lang.code);
                    setShowLangMenu(false);
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-left transition-colors ${
                    lang.code === language
                      ? "bg-blue-600 text-white font-medium"
                      : "text-slate-300 hover:bg-white/10"
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Center: Live Speech Transcript Box */}
      <div className="my-2.5 p-3 rounded-xl bg-black/50 border border-white/10 min-h-[52px] max-h-36 overflow-y-auto text-xs sm:text-sm">
        {transcript || interimTranscript ? (
          <p className="leading-relaxed">
            <span className="text-slate-100">{transcript}</span>
            {interimTranscript && (
              <span className="text-blue-300/80 italic ml-1 underline decoration-blue-500/40 decoration-wavy">
                {interimTranscript}
              </span>
            )}
          </p>
        ) : (
          <p className="text-slate-500 italic flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span>Konuşmaya başlayın, sesiniz anında metne dönüştürülecektir...</span>
          </p>
        )}
      </div>

      {/* Quick Punctuation Shortcuts */}
      <div className="flex items-center justify-between gap-2 flex-wrap pt-1 pb-1.5">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="text-[11px] text-slate-500 hidden sm:inline">Noktalama:</span>
          {[
            { label: "Nokta .", val: ". " },
            { label: "Virgül ,", val: ", " },
            { label: "Soru ?", val: "? " },
            { label: "Ünlem !", val: "! " },
            { label: "Yeni Satır ⏎", val: "\n" },
          ].map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onInsertPunctuation(item.val)}
              className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 border border-white/10 text-xs font-mono transition-colors"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Clear current speech */}
        {(transcript || interimTranscript) && (
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 text-xs transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Temizle</span>
          </button>
        )}
      </div>

      {/* Action Buttons Toolbar */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
        <button
          type="button"
          id="btn-voice-cancel"
          onClick={onCancel}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 text-xs transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          <span>İptal</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Stop & Keep in Textbox */}
          <button
            type="button"
            id="btn-voice-stop-keep"
            onClick={onStop}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/20 backdrop-blur-md transition-colors"
          >
            <Square className="w-3.5 h-3.5 text-amber-400" />
            <span>Durdur & Ekle</span>
          </button>

          {/* Send directly */}
          <button
            type="button"
            id="btn-voice-send-now"
            disabled={!transcript.trim() && !interimTranscript.trim()}
            onClick={onSendNow}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium shadow-md shadow-indigo-600/30 border border-white/20 transition-all hover:scale-102 active:scale-98"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Hemen Gönder</span>
          </button>
        </div>
      </div>
    </div>
  );
};
