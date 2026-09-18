import React, { useState, useEffect } from "react";
import {
  X,
  Key,
  Eye,
  EyeOff,
  Check,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  RotateCcw,
} from "./Icons";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  hasEnvKey: boolean;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
  hasEnvKey,
}) => {
  const [inputVal, setInputVal] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  useEffect(() => {
    setInputVal(apiKey);
    setVerifyStatus({ type: null, message: "" });
  }, [apiKey, isOpen]);

  if (!isOpen) return null;

  const handleVerify = async (keyToTest: string) => {
    const trimmed = keyToTest.trim();
    if (!trimmed) {
      setVerifyStatus({
        type: "error",
        message: "Lütfen test etmek için bir API anahtarı girin.",
      });
      return false;
    }

    setIsVerifying(true);
    setVerifyStatus({ type: null, message: "" });

    try {
      const res = await fetch("/api/verify-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-gemini-api-key": trimmed,
        },
        body: JSON.stringify({ apiKey: trimmed }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setVerifyStatus({
          type: "success",
          message: "Harika! API anahtarınız başarıyla doğrulandı ve çalışıyor.",
        });
        return true;
      } else {
        setVerifyStatus({
          type: "error",
          message:
            data.error ||
            "API anahtarı doğrulanamadı. Lütfen anahtarın doğruluğunu ve Gemini API yetkilerini kontrol edin.",
        });
        return false;
      }
    } catch (err: any) {
      setVerifyStatus({
        type: "error",
        message: err.message || "Doğrulama isteği sırasında sunucuya ulaşılamadı.",
      });
      return false;
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSave = async () => {
    const trimmed = inputVal.trim();
    onSaveApiKey(trimmed);
    onClose();
  };

  const handleClear = () => {
    setInputVal("");
    onSaveApiKey("");
    setVerifyStatus({
      type: "success",
      message: "Özel API anahtarı kaldırıldı. Sistem ortam anahtarına geri dönüldü.",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        id="api-key-modal"
        className="relative w-full max-w-lg rounded-3xl bg-[#0c0c16]/95 border border-white/15 p-6 shadow-2xl backdrop-blur-2xl text-slate-100 overflow-hidden"
      >
        {/* Glow ambient accent */}
        <div className="absolute -top-24 -left-24 w-52 h-52 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-52 h-52 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/30 border border-white/20">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white tracking-wide">
                Gemini API Anahtarı
              </h3>
              <p className="text-xs text-slate-400">
                Özel API anahtarınızı girin veya güncelleyin
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="space-y-4 py-4 relative z-10">
          {/* Status info */}
          <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 text-xs space-y-2">
            <div className="flex items-start gap-2 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>
                API anahtarınız tarayıcınızın yerel depolama alanında güvenle tutulur
                ve yalnızca yapay zeka isteklerini iletmek için sunucu proxy&apos;sine gönderilir.
              </span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px] text-slate-400">
              <span>Mevcut Durum:</span>
              <span
                className={`px-2 py-0.5 rounded-full font-medium ${
                  apiKey
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : hasEnvKey
                    ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                    : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                }`}
              >
                {apiKey
                  ? "Özel API Key Aktif"
                  : hasEnvKey
                  ? "Sistem Anahtarı Aktif"
                  : "API Key Tanımlanmadı"}
              </span>
            </div>
          </div>

          {/* Key Input Section */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
              <span>Google Gemini API Key</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
              >
                <span>Ücretsiz API Key Al</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </label>
            <div className="relative flex items-center">
              <input
                id="input-api-key-value"
                type={showKey ? "text" : "password"}
                value={inputVal}
                onChange={(e) => {
                  setInputVal(e.target.value);
                  setVerifyStatus({ type: null, message: "" });
                }}
                placeholder="AIzaSy... veya AQ...."
                className="w-full pl-3.5 pr-20 py-2.5 rounded-xl bg-white/[0.06] border border-white/15 focus:border-amber-400/70 focus:ring-2 focus:ring-amber-500/20 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-all font-mono"
              />
              <div className="absolute right-2 flex items-center gap-1">
                {inputVal && (
                  <button
                    type="button"
                    onClick={() => {
                      setInputVal("");
                      setVerifyStatus({ type: null, message: "" });
                    }}
                    className="p-1 rounded text-slate-400 hover:text-white"
                    title="Temizle"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  title={showKey ? "Gizle" : "Göster"}
                >
                  {showKey ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Verification Status Banner */}
          {verifyStatus.type && (
            <div
              className={`p-3 rounded-2xl text-xs flex items-start gap-2 backdrop-blur-md animate-fadeIn ${
                verifyStatus.type === "success"
                  ? "bg-emerald-950/60 border border-emerald-500/40 text-emerald-200"
                  : "bg-rose-950/60 border border-rose-500/40 text-rose-200"
              }`}
            >
              {verifyStatus.type === "success" ? (
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed">{verifyStatus.message}</span>
            </div>
          )}

          {/* Helper note */}
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Google AI Studio hesabınızdan aldığınız standart API anahtarını buraya yapıştırıp
            &quot;Doğrula &amp; Test Et&quot; butonuyla test edebilir veya doğrudan kaydedebilirsiniz.
          </p>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10 relative z-10">
          <div>
            {apiKey && (
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-2 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 transition-colors cursor-pointer"
              >
                Anahtarı Kaldır
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isVerifying || !inputVal.trim()}
              onClick={() => handleVerify(inputVal)}
              className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-200 bg-white/10 hover:bg-white/15 border border-white/15 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
            >
              {isVerifying ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Test Ediliyor...</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
                  <span>Doğrula &amp; Test Et</span>
                </>
              )}
            </button>
            <button
              id="btn-save-api-key"
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-xl text-xs font-medium text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 shadow-lg shadow-amber-500/25 border border-white/20 transition-all active:scale-95 cursor-pointer"
            >
              Kaydet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
