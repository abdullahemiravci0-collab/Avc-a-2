import React, { useState, useRef, useEffect } from "react";
import { AttachedImage, AIPersona } from "../types";
import {
  Send,
  Paperclip,
  Mic,
  MicOff,
  Globe,
  X,
  Sparkles,
  AlertCircle,
  Key,
  ArrowRight,
} from "./Icons";
import { useSpeechToText } from "../hooks/useSpeechToText";
import { VoiceDictationBar } from "./VoiceDictationBar";

interface ChatInputProps {
  onSendMessage: (text: string, images?: AttachedImage[]) => void;
  isLoading: boolean;
  enableSearch: boolean;
  onToggleSearch: () => void;
  activePersona: AIPersona;
  onSelectPersona?: (persona: AIPersona) => void;
  personas: AIPersona[];
  apiKey?: string;
  onOpenApiKeyModal?: () => void;
  hasEnvKey?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  enableSearch,
  onToggleSearch,
  activePersona,
  onSelectPersona,
  personas,
  apiKey,
  onOpenApiKeyModal,
  hasEnvKey,
}) => {
  const [text, setText] = useState("");
  const [images, setImages] = useState<AttachedImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [unsupportedBanner, setUnsupportedBanner] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const baseTextBeforeDictationRef = useRef<string>("");

  // Speech-to-Text hook using Web Speech API
  const speech = useSpeechToText({
    initialLanguage: "tr-TR",
  });

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        180
      )}px`;
    }
  }, [text]);

  // Sync spoken transcript into input textarea in real-time
  useEffect(() => {
    if (speech.isListening) {
      const spoken = (
        speech.transcript +
        (speech.interimTranscript ? " " + speech.interimTranscript : "")
      ).trim();

      const combined = baseTextBeforeDictationRef.current
        ? baseTextBeforeDictationRef.current.trim() + (spoken ? " " + spoken : "")
        : spoken;

      setText(combined);
    }
  }, [speech.transcript, speech.interimTranscript, speech.isListening]);

  // Voice recognition toggle handler
  const handleToggleVoice = async () => {
    setUnsupportedBanner(null);

    if (speech.isListening) {
      // If already listening, stop & keep text
      speech.stopListening();
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
      return;
    }

    if (!speech.isSupported) {
      setUnsupportedBanner(
        "Tarayıcınız Web Speech API ses tanıma özelliğini desteklemiyor. Sesli dikte için Google Chrome, Microsoft Edge veya Safari kullanabilirsiniz."
      );
      return;
    }

    baseTextBeforeDictationRef.current = text;
    speech.clearTranscript();
    await speech.startListening();
  };

  // Stop dictation and keep transcribed text
  const handleStopDictation = () => {
    speech.stopListening();
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Cancel dictation and revert text
  const handleCancelDictation = () => {
    speech.cancelListening();
    setText(baseTextBeforeDictationRef.current);
  };

  // Clear speech transcript during active dictation
  const handleClearDictation = () => {
    speech.clearTranscript();
    setText(baseTextBeforeDictationRef.current);
  };

  // Insert punctuation into dictated text
  const handleInsertPunctuation = (punct: string) => {
    setText((prev) => {
      const trimmed = prev.trimEnd();
      const updated = trimmed + punct;
      baseTextBeforeDictationRef.current = updated;
      speech.clearTranscript();
      return updated;
    });
  };

  // Send message directly from voice dictation
  const handleSendFromVoice = () => {
    speech.stopListening();
    const messageToSend = text.trim();
    if (!messageToSend && images.length === 0) return;

    onSendMessage(messageToSend, images.length > 0 ? images : undefined);
    setText("");
    setImages([]);
    baseTextBeforeDictationRef.current = "";
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  // Image handling
  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) {
        alert("Lütfen yalnızca resim dosyası seçin (PNG, JPEG, WebP).");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        alert("Görsel boyutu 10MB'tan küçük olmalıdır.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          const newImg: AttachedImage = {
            id: Math.random().toString(36).substring(2, 9),
            data: result,
            mimeType: file.type,
            name: file.name,
            size: file.size,
          };
          setImages((prev) => [...prev, newImg]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (speech.isListening) {
      speech.stopListening();
    }
    if ((!text.trim() && images.length === 0) || isLoading) return;

    onSendMessage(text.trim(), images.length > 0 ? images : undefined);
    setText("");
    setImages([]);
    baseTextBeforeDictationRef.current = "";
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-4 sm:pb-6 relative z-20">
      {/* Unsupported Web Speech API banner */}
      {unsupportedBanner && (
        <div className="mb-2 p-3 rounded-2xl bg-amber-950/60 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between backdrop-blur-md animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>{unsupportedBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setUnsupportedBanner(null)}
            className="p-1 text-amber-400 hover:text-white rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Voice Dictation Live Interactive Panel */}
      {(speech.isListening || speech.error) && (
        <VoiceDictationBar
          isListening={speech.isListening}
          interimTranscript={speech.interimTranscript}
          transcript={speech.transcript}
          volume={speech.volume}
          durationSeconds={speech.durationSeconds}
          language={speech.language}
          onLanguageChange={speech.setLanguage}
          onStop={handleStopDictation}
          onCancel={handleCancelDictation}
          onClear={handleClearDictation}
          onInsertPunctuation={handleInsertPunctuation}
          onSendNow={handleSendFromVoice}
          error={speech.error}
          onClearError={speech.clearError}
        />
      )}

      {/* API Key Warning & Action Card above input */}
      <div
        id="api-key-input-warning-banner"
        onClick={onOpenApiKeyModal}
        className={`mb-2.5 p-2.5 sm:px-3.5 sm:py-2.5 rounded-2xl border backdrop-blur-xl transition-all cursor-pointer shadow-lg group flex items-center justify-between ${
          apiKey
            ? "bg-emerald-950/40 border-emerald-500/30 hover:border-emerald-400/60 text-emerald-200 hover:bg-emerald-950/50"
            : "bg-amber-950/60 border-amber-500/45 hover:border-amber-400/80 text-amber-200 hover:bg-amber-950/70 shadow-amber-950/40"
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 border ${
              apiKey
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm"
                : "bg-amber-500/25 text-amber-300 border-amber-500/40 shadow-sm"
            }`}
          >
            <Key className="w-4 h-4" />
          </div>
          <div className="min-w-0 text-left">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className={`font-semibold text-xs sm:text-sm ${
                  apiKey ? "text-emerald-300" : "text-amber-300"
                }`}
              >
                {apiKey ? "API Key Tanımlı" : "⚠️ API Key Uyarısı"}
              </span>
              <span className="text-[11px] text-slate-400 hidden sm:inline">•</span>
              <span className="text-xs text-slate-300 truncate">
                {apiKey
                  ? "Özel Gemini API anahtarı aktif (Değiştirmek için tıklayın)"
                  : "Yapay zeka için geçerli API anahtarı girin (Tıklayıp Yazın)"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
          <span
            className={`px-3 py-1 rounded-xl text-xs font-medium border transition-all flex items-center gap-1 shadow-xs ${
              apiKey
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 group-hover:bg-emerald-500/30"
                : "bg-amber-500/30 text-amber-200 border-amber-500/50 group-hover:bg-amber-500/40"
            }`}
          >
            <span>{apiKey ? "Değiştir" : "API Yaz"}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>

      {/* Frosted Glass Container with drag & drop */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative rounded-3xl border transition-all shadow-2xl backdrop-blur-2xl bg-slate-900/40 ${
          isDragging
            ? "border-blue-400 ring-2 ring-blue-500/40 bg-blue-950/30"
            : speech.isListening
            ? "border-rose-500/50 ring-1 ring-rose-500/30 bg-slate-900/50"
            : "border-white/10 hover:border-white/20 focus-within:border-blue-500/60 focus-within:ring-2 focus-within:ring-blue-500/20"
        }`}
      >
        {/* Attached Images preview */}
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2.5 p-3 border-b border-white/10">
            {images.map((img) => (
              <div
                key={img.id}
                className="relative group rounded-2xl overflow-hidden border border-white/15 bg-black/50 shadow-md backdrop-blur-md"
              >
                <img
                  src={img.data}
                  alt={img.name}
                  className="h-16 w-16 object-cover"
                  referrerPolicy="no-referrer"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(img.id)}
                  className="absolute top-1 right-1 p-1 rounded-full bg-black/80 text-slate-300 hover:text-white hover:bg-rose-600 transition-colors shadow"
                >
                  <X className="w-3 h-3" />
                </button>
                <span className="block max-w-[64px] truncate text-[9px] px-1 py-0.5 text-center text-slate-300 bg-black/60">
                  {img.name}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Input Textarea */}
        <div className="px-4 pt-3.5 pb-2">
          <textarea
            id="chat-input-textarea"
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              speech.isListening
                ? "Sesiniz dinleniyor, konuşabilirsiniz..."
                : activePersona
                ? `${activePersona.name} ile sohbet et veya sesle dikte et...`
                : "Bir mesaj yazın veya sesle söyleyin..."
            }
            className="w-full bg-transparent text-slate-100 placeholder:text-slate-500 resize-none outline-none text-[15px] leading-relaxed max-h-48 overflow-y-auto"
          />
        </div>

        {/* Bottom Toolbar */}
        <div className="flex items-center justify-between px-3 pb-2.5 pt-1 text-slate-400">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              multiple
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />

            {/* Attach Image Button */}
            <button
              id="btn-attach-image"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Görsel veya Belge Yükle"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 backdrop-blur-md transition-colors"
            >
              <Paperclip className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">Görsel Ekle</span>
            </button>

            {/* Voice Dictation (Speech-to-Text) Button */}
            <button
              id="btn-voice-input"
              type="button"
              onClick={handleToggleVoice}
              title={
                speech.isListening
                  ? "Dikteyi Durdur (Durdur & Ekle)"
                  : "Sesle Yaz (Web Speech API ile Dikte Et)"
              }
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium backdrop-blur-md transition-all ${
                speech.isListening
                  ? "bg-rose-600 text-white shadow-md shadow-rose-600/30 border border-rose-400/40 animate-pulse"
                  : "text-slate-300 hover:text-white hover:bg-white/10"
              }`}
            >
              {speech.isListening ? (
                <>
                  <MicOff className="w-4 h-4" />
                  <span>Dikteyi Durdur</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 text-blue-400" />
                  <span className="hidden sm:inline">Sesle Yaz</span>
                </>
              )}
            </button>

            {/* Web Search Toggle */}
            <button
              id="btn-toggle-search"
              type="button"
              onClick={onToggleSearch}
              title="Google Web Arama Kaynakları"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium backdrop-blur-md transition-all ${
                enableSearch
                  ? "bg-blue-600/30 text-blue-300 border border-blue-400/40 shadow-xs"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/10"
              }`}
            >
              <Globe className="w-4 h-4" />
              <span className="hidden md:inline">
                {enableSearch ? "Web Arama: Açık" : "Web Arama"}
              </span>
            </button>

            {/* Persona Quick Switcher */}
            {onSelectPersona && (
              <div className="relative">
                <button
                  id="btn-persona-quick-menu"
                  type="button"
                  onClick={() => setShowPersonaMenu(!showPersonaMenu)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-200 bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 backdrop-blur-md transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span className="max-w-[100px] truncate">
                    {activePersona.name}
                  </span>
                </button>

                {showPersonaMenu && (
                  <div className="absolute bottom-full left-0 mb-2 w-64 rounded-2xl bg-[#0c0c14]/95 backdrop-blur-2xl border border-white/15 shadow-2xl p-1.5 z-50">
                    <div className="text-[11px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider">
                      Asistan Rolü Seç
                    </div>
                    {personas.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          onSelectPersona(p);
                          setShowPersonaMenu(false);
                        }}
                        className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center gap-2 transition-colors ${
                          p.id === activePersona.id
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-sm"
                            : "text-slate-300 hover:bg-white/10"
                        }`}
                      >
                        <span className="truncate">{p.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* API Key Toolbar Button */}
            {onOpenApiKeyModal && (
              <button
                id="btn-toolbar-api-key"
                type="button"
                onClick={onOpenApiKeyModal}
                title={apiKey ? "API Key Tanımlı (Değiştir)" : "API Key Yaz"}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium backdrop-blur-md transition-all ${
                  apiKey
                    ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25"
                    : "bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 shadow-xs"
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {apiKey ? "API Key Aktif" : "API Key Yaz"}
                </span>
              </button>
            )}
          </div>

          {/* Send Button */}
          <button
            id="btn-send-message"
            type="button"
            disabled={(!text.trim() && images.length === 0) || isLoading}
            onClick={() => handleSubmit()}
            className={`flex items-center justify-center p-2.5 rounded-2xl transition-all shadow-lg ${
              (!text.trim() && images.length === 0) || isLoading
                ? "bg-white/[0.04] text-slate-500 border border-white/5 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-indigo-500/30 border border-white/20 hover:scale-105 active:scale-95"
            }`}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
      <div className="text-center text-[11px] text-slate-500 mt-2">
        Sesli dikte ve Gemini 3.8 Flash ile desteklenmektedir.
      </div>
    </div>
  );
};
