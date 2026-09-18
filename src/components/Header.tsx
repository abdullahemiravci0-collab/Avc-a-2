import React from "react";
import { AIPersona, ChatSession } from "../types";
import {
  Menu,
  Sparkles,
  Sliders,
  Plus,
  Globe,
  Download,
  PersonaIcon,
  Key,
} from "./Icons";

interface HeaderProps {
  onToggleSidebar: () => void;
  activePersona: AIPersona;
  currentSession: ChatSession | null;
  model: string;
  enableSearch: boolean;
  onNewChat: () => void;
  onOpenSettings: () => void;
  onExport: () => void;
  apiKey?: string;
  onOpenApiKeyModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  activePersona,
  currentSession,
  model,
  enableSearch,
  onNewChat,
  onOpenSettings,
  onExport,
  apiKey,
  onOpenApiKeyModal,
}) => {
  return (
    <header
      id="app-header"
      className="h-16 border-b border-white/10 bg-[#07070b]/60 backdrop-blur-xl px-4 flex items-center justify-between z-20 flex-shrink-0"
    >
      {/* Left: Mobile Sidebar Trigger + Persona details */}
      <div className="flex items-center gap-3">
        <button
          id="btn-sidebar-toggle"
          type="button"
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 border border-white/10 lg:hidden transition-colors"
          title="Menüyü Aç"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div
            className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${activePersona.color} flex items-center justify-center text-white shadow-md border border-white/20`}
          >
            <PersonaIcon name={activePersona.icon} className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-slate-100 truncate max-w-[160px] sm:max-w-[280px]">
                {currentSession?.title || activePersona.name}
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/10 text-slate-300 border border-white/15 backdrop-blur-md">
                {model}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block truncate max-w-sm">
              {activePersona.tagline}
            </p>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5">
        {enableSearch && (
          <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-600/20 text-blue-300 border border-blue-400/30 backdrop-blur-md">
            <Globe className="w-3 h-3 text-blue-400" />
            <span>Web Canlı</span>
          </span>
        )}

        {currentSession && currentSession.messages.length > 0 && (
          <button
            id="btn-header-export"
            type="button"
            onClick={onExport}
            title="Sohbeti Dışa Aktar (.md)"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 border border-white/10 backdrop-blur-md transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
        )}

        <button
          id="btn-header-new-chat"
          type="button"
          onClick={onNewChat}
          title="Yeni Sohbet"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 border border-white/10 text-xs font-medium backdrop-blur-md transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Yeni Sohbet</span>
        </button>

        {onOpenApiKeyModal && (
          <button
            id="btn-header-api-key"
            type="button"
            onClick={onOpenApiKeyModal}
            title={
              apiKey
                ? "Özel Gemini API Anahtarı Tanımlı (Değiştir)"
                : "Gemini API Anahtarı Tanımla / Yaz"
            }
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border backdrop-blur-md transition-all cursor-pointer ${
              apiKey
                ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25"
                : "bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30 animate-pulse"
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span className="hidden md:inline">
              {apiKey ? "API Key Aktif" : "API Key Yaz"}
            </span>
          </button>
        )}

        <button
          id="btn-header-settings"
          type="button"
          onClick={onOpenSettings}
          title="Ayarlar & Model"
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 border border-white/10 backdrop-blur-md transition-colors"
        >
          <Sliders className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
