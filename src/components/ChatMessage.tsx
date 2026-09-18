import React, { useState } from "react";
import Markdown from "react-markdown";
import { Message, AppSettings } from "../types";
import {
  Bot,
  User,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Globe,
  ArrowUpRight,
  Terminal,
  Cpu,
  AlertCircle,
  RotateCcw,
  Key,
} from "./Icons";

interface ChatMessageProps {
  message: Message;
  personaName?: string;
  settings: AppSettings;
  onRetry?: () => void;
  onOpenApiKeyModal?: () => void;
  apiKey?: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  personaName = "AVCI AI",
  settings,
  onRetry,
  onOpenApiKeyModal,
  apiKey,
}) => {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Kopyalama hatası:", err);
    }
  };

  const handlePlayAudio = async () => {
    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    try {
      setIsPlayingAudio(true);
      setAudioError(null);

      // Try server-side TTS first
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { "x-gemini-api-key": apiKey } : {}),
        },
        body: JSON.stringify({
          text: message.text.slice(0, 800),
          voice: settings.ttsVoice,
          apiKey: apiKey || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audio) {
          const audio = new Audio(`data:audio/wav;base64,${data.audio}`);
          audio.onended = () => setIsPlayingAudio(false);
          audio.onerror = () => {
            playBrowserTTS();
          };
          await audio.play();
          return;
        }
      }
      // Fallback to browser Web Speech API
      playBrowserTTS();
    } catch (err) {
      playBrowserTTS();
    }
  };

  const playBrowserTTS = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(message.text.slice(0, 1000));
      utterance.lang = "tr-TR";
      utterance.rate = 1.0;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsPlayingAudio(false);
      setAudioError("Tarayıcınız ses sentezini desteklemiyor.");
    }
  };

  return (
    <div
      id={`message-${message.id}`}
      className={`group w-full py-5 px-4 sm:px-6 transition-colors ${
        isUser
          ? "bg-blue-950/20 backdrop-blur-md border-b border-white/[0.06]"
          : "bg-white/[0.02] backdrop-blur-md border-b border-white/[0.04]"
      }`}
    >
      <div className="max-w-4xl mx-auto flex gap-4 sm:gap-6">
        {/* Avatar */}
        <div className="flex-shrink-0 pt-0.5">
          {isUser ? (
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-700/80 to-slate-600/80 backdrop-blur-md flex items-center justify-center text-white shadow-md border border-white/20">
              <User className="w-5 h-5 text-slate-200" />
            </div>
          ) : message.isError ? (
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/25 border border-white/30">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 border border-white/30">
              <Bot className="w-5 h-5 text-white" />
            </div>
          )}
        </div>

        {/* Content Container */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Header Row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-slate-100">
                {isUser ? "Siz" : personaName}
              </span>
              {!isUser && (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border backdrop-blur-md ${
                  message.isError
                    ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                    : "bg-white/10 text-blue-300 border-white/15"
                }`}>
                  {message.isError ? (
                    <AlertCircle className="w-3 h-3 text-rose-400" />
                  ) : (
                    <Cpu className="w-3 h-3 text-blue-400" />
                  )}
                  {message.isError ? "Sistem Uyarısı" : (message.modelUsed || "Gemini 3.8 Flash")}
                </span>
              )}
              <span className="text-xs text-slate-500">
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
              {!isUser && (
                <button
                  id={`btn-tts-${message.id}`}
                  onClick={handlePlayAudio}
                  title={isPlayingAudio ? "Durdur" : "Seslendir (Dinle)"}
                  className={`p-1.5 rounded-lg text-xs transition-colors backdrop-blur-md ${
                    isPlayingAudio
                      ? "bg-blue-600 text-white shadow"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/10"
                  }`}
                >
                  {isPlayingAudio ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
              )}
              <button
                id={`btn-copy-${message.id}`}
                onClick={handleCopyText}
                title="Metni Kopyala"
                className="p-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-white/10 backdrop-blur-md transition-colors"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Attached Images */}
          {message.images && message.images.length > 0 && (
            <div className="flex flex-wrap gap-3 pt-1 pb-2">
              {message.images.map((img) => (
                <div
                  key={img.id}
                  className="relative group/img overflow-hidden rounded-2xl border border-white/15 bg-black/40 shadow-lg backdrop-blur-md max-w-xs"
                >
                  <img
                    src={img.data}
                    alt={img.name || "Görsel"}
                    className="max-h-56 w-auto object-cover rounded-2xl"
                    referrerPolicy="no-referrer"
                  />
                  {img.name && (
                    <div className="absolute bottom-0 inset-x-0 bg-black/70 backdrop-blur-md px-2 py-1 text-[11px] text-slate-300 truncate">
                      {img.name}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Message Text / Markdown */}
          <div className="text-slate-200 text-[15px] leading-relaxed break-words">
            {isUser ? (
              <p className="whitespace-pre-wrap font-normal">{message.text}</p>
            ) : (
              <div className="markdown-body space-y-3 prose prose-invert max-w-none prose-p:my-2 prose-headings:text-white prose-code:text-blue-300">
                <Markdown
                  components={{
                    code({ node, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "");
                      const isInline = !match && !String(children).includes("\n");
                      const codeText = String(children).replace(/\n$/, "");

                      if (isInline) {
                        return (
                          <code
                            className="px-1.5 py-0.5 rounded-md bg-white/10 text-blue-300 font-mono text-xs border border-white/10 backdrop-blur-sm"
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      }

                      return (
                        <div className="relative my-3 rounded-2xl overflow-hidden border border-white/10 bg-black/50 backdrop-blur-xl shadow-xl font-mono text-xs">
                          <div className="flex items-center justify-between px-3.5 py-2 bg-white/[0.04] border-b border-white/10 text-slate-400">
                            <div className="flex items-center gap-1.5">
                              <Terminal className="w-3.5 h-3.5 text-blue-400" />
                              <span className="uppercase text-[11px] font-semibold text-slate-300">
                                {match ? match[1] : "kod"}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => navigator.clipboard.writeText(codeText)}
                              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
                            >
                              <Copy className="w-3 h-3" />
                              Kopyala
                            </button>
                          </div>
                          <pre className="p-4 overflow-x-auto text-slate-200 leading-relaxed">
                            <code>{children}</code>
                          </pre>
                        </div>
                      );
                    },
                  }}
                >
                  {message.text}
                </Markdown>
              </div>
            )}
          </div>

          {/* Web Grounding Sources */}
          {message.sources && message.sources.length > 0 && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-2">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <span>Kaynaklar & Doğrulama:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {message.sources.slice(0, 5).map((source, idx) => (
                  <a
                    key={idx}
                    href={source.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs bg-white/[0.04] hover:bg-white/[0.08] text-blue-400 hover:text-blue-300 border border-white/10 backdrop-blur-md transition-colors truncate max-w-xs"
                  >
                    <span className="truncate">
                      {source.title || new URL(source.uri).hostname}
                    </span>
                    <ArrowUpRight className="w-3 h-3 flex-shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Error Retry & API Key Action */}
          {message.isError && (
            <div className="pt-2 flex items-center gap-2 flex-wrap">
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-100 font-medium text-xs border border-white/20 backdrop-blur-md transition-all cursor-pointer shadow-sm active:scale-95 hover:border-blue-400/50"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
                  <span>Tekrar Dene</span>
                </button>
              )}
              {onOpenApiKeyModal && (
                <button
                  type="button"
                  onClick={onOpenApiKeyModal}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-medium text-xs border border-amber-500/40 backdrop-blur-md transition-all cursor-pointer shadow-sm active:scale-95 hover:border-amber-400/60"
                >
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  <span>API Key Yaz / Güncelle</span>
                </button>
              )}
            </div>
          )}

          {audioError && (
            <p className="text-xs text-rose-400 mt-1">{audioError}</p>
          )}
        </div>
      </div>
    </div>
  );
};
