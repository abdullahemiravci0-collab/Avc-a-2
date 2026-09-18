import React from "react";
import { AppSettings } from "../types";
import { X, Sliders, Volume2, Cpu, RefreshCw } from "./Icons";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onResetSettings: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetSettings,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="settings-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div
        id="settings-modal-content"
        className="w-full max-w-lg bg-[#0c0c14]/90 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base">
                Yapay Zeka Ayarları
              </h3>
              <p className="text-xs text-slate-400">
                Model parametrelerini ve tercihlerinizi özelleştirin
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
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          {/* Model Selection */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-200 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-400" />
              <span>Yapay Zeka Modeli</span>
            </label>
            <div className="grid grid-cols-1 gap-2">
              {[
                {
                  id: "gemini-3.8-flash",
                  name: "Gemini 3.8 Flash",
                  desc: "En yeni dengeli ve akıl yürütme yeteneklerine sahip temel metin modeli",
                },
                {
                  id: "gemini-flash-latest",
                  name: "Gemini Flash Latest",
                  desc: "Flash ailesinin en güncel kararlı sürümü",
                },
                {
                  id: "gemini-3.1-flash-lite",
                  name: "Gemini 3.1 Flash Lite",
                  desc: "Düşük gecikmeli, ultra hızlı temel yanıtlar",
                },
              ].map((m) => (
                <label
                  key={m.id}
                  className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all backdrop-blur-md ${
                    settings.model === m.id
                      ? "bg-white/15 border-blue-400/60 ring-1 ring-blue-400/30 shadow-sm"
                      : "bg-white/[0.03] border-white/10 hover:bg-white/[0.07]"
                  }`}
                >
                  <input
                    type="radio"
                    name="model"
                    checked={settings.model === m.id}
                    onChange={() => onUpdateSettings({ model: m.id })}
                    className="mt-1 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="font-semibold text-slate-100">{m.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{m.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Temperature Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-200">
                Sıcaklık / Yaratıcılık (Temperature)
              </label>
              <span className="font-mono text-blue-400 font-bold">
                {settings.temperature.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.05"
              value={settings.temperature}
              onChange={(e) =>
                onUpdateSettings({ temperature: parseFloat(e.target.value) })
              }
              className="w-full accent-blue-500 h-2 bg-white/10 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>0.0 (Kesin & Kod Odaklı)</span>
              <span>0.7 (Dengeli)</span>
              <span>2.0 (Yaratıcı & Serbest)</span>
            </div>
          </div>

          {/* Voice Selection */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-200 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-blue-400" />
              <span>Seslendirme Karakteri (TTS Voice)</span>
            </label>
            <select
              value={settings.ttsVoice}
              onChange={(e) =>
                onUpdateSettings({
                  ttsVoice: e.target.value as AppSettings["ttsVoice"],
                })
              }
              className="w-full p-3 rounded-2xl bg-black/40 border border-white/10 text-slate-200 text-sm focus:outline-none focus:border-blue-500/60 backdrop-blur-md"
            >
              <option value="Kore" className="bg-[#0c0c14] text-slate-200">Kore (Dengeli & Sakin)</option>
              <option value="Zephyr" className="bg-[#0c0c14] text-slate-200">Zephyr (Canlı & Akıcı)</option>
              <option value="Puck" className="bg-[#0c0c14] text-slate-200">Puck (Dinamik & Sıcak)</option>
              <option value="Aoede" className="bg-[#0c0c14] text-slate-200">Aoede (Zarif & Profesyonel)</option>
              <option value="Fenrir" className="bg-[#0c0c14] text-slate-200">Fenrir (Derin & Otoriter)</option>
            </select>
          </div>

          {/* Custom System Prompt */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-200">
              Özel Sistem Talimatı (İsteğe Bağlı)
            </label>
            <textarea
              rows={3}
              placeholder="Asistanın yanıt verirken dikkat etmesini istediğiniz özel kurallar ekleyin (örn. 'Her zaman Türkçe ve teknik terimlerle açıkla')..."
              value={settings.customSystemPrompt}
              onChange={(e) =>
                onUpdateSettings({ customSystemPrompt: e.target.value })
              }
              className="w-full p-3 rounded-2xl bg-black/40 border border-white/10 text-slate-200 text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500/60 backdrop-blur-md"
            />
          </div>

          {/* Additional toggles */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-slate-300">
                Otomatik aşağı kaydırma (Auto-scroll)
              </span>
              <input
                type="checkbox"
                checked={settings.autoScroll}
                onChange={(e) =>
                  onUpdateSettings({ autoScroll: e.target.checked })
                }
                className="w-4 h-4 rounded text-blue-600 bg-white/10 border-white/15 focus:ring-blue-500"
              />
            </label>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between bg-black/30 backdrop-blur-md">
          <button
            type="button"
            onClick={onResetSettings}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/10 text-xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Varsayılana Dön</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-xs shadow-md shadow-blue-500/20 border border-white/20 transition-all hover:scale-102 active:scale-98"
          >
            Kaydet ve Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
