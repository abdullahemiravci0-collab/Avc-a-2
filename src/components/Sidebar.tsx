import React, { useState } from "react";
import { ChatSession, AIPersona } from "../types";
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
  Download,
  Bot,
  Sparkles,
  Sliders,
  PersonaIcon,
} from "./Icons";

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: (personaId?: string) => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onClearAllSessions: () => void;
  onExportSession: (session: ChatSession, format: "markdown" | "json") => void;
  isOpen: boolean;
  onClose: () => void;
  personas: AIPersona[];
  selectedPersonaId: string;
  onSelectPersona: (personaId: string) => void;
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onRenameSession,
  onClearAllSessions,
  onExportSession,
  isOpen,
  onClose,
  personas,
  selectedPersonaId,
  onSelectPersona,
  onOpenSettings,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartRename = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditTitle(session.title);
  };

  const handleSaveRename = (id: string, e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameSession(id, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          id="sidebar-backdrop"
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="app-sidebar"
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-80 bg-[#07070b]/80 backdrop-blur-2xl border-r border-white/10 flex flex-col transition-transform duration-300 ease-in-out shadow-2xl shadow-black/50 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Top Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 border border-white/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-sm text-slate-100 tracking-tight">
                AVCI AI
              </h1>
              <p className="text-[11px] text-slate-400">Gemini 3.8 Flash</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 lg:hidden transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Action */}
        <div className="p-3">
          <button
            id="btn-new-chat"
            type="button"
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 1024) onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 active:scale-98 text-white font-medium text-sm shadow-lg shadow-indigo-600/30 border border-white/20 transition-all hover:scale-[1.01]"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Sohbet</span>
          </button>
        </div>

        {/* Persona Categories */}
        <div className="px-3 pb-2 border-b border-white/10">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-1.5 flex items-center justify-between">
            <span>Asistan Rolleri</span>
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="grid grid-cols-1 gap-1">
            {personas.map((p) => {
              const isSelected = p.id === selectedPersonaId;
              return (
                <button
                  key={p.id}
                  id={`persona-item-${p.id}`}
                  type="button"
                  onClick={() => {
                    onSelectPersona(p.id);
                  }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs transition-all text-left ${
                    isSelected
                      ? "bg-white/10 text-white font-medium shadow-xs border border-white/20 backdrop-blur-md"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg bg-gradient-to-tr ${p.color} flex items-center justify-center text-white flex-shrink-0 shadow-xs`}
                  >
                    <PersonaIcon name={p.icon} className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate flex-1">
                    <span className="truncate block">{p.name}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Conversation Search */}
        <div className="p-3 pb-1">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              id="sidebar-search-input"
              type="text"
              placeholder="Geçmişte ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-black/30 border border-white/10 text-slate-200 placeholder:text-slate-500 text-xs focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 backdrop-blur-md"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-2 py-1">
            Sohbet Geçmişi ({filteredSessions.length})
          </div>

          {filteredSessions.length === 0 ? (
            <div className="text-center py-8 px-4 text-xs text-slate-500">
              {searchQuery ? "Aramaya uygun sohbet bulunamadı." : "Henüz bir sohbet geçmişi yok."}
            </div>
          ) : (
            filteredSessions.map((session) => {
              const isActive = session.id === activeSessionId;
              const isEditing = editingId === session.id;

              return (
                <div
                  key={session.id}
                  id={`session-item-${session.id}`}
                  onClick={() => {
                    onSelectSession(session.id);
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={`group relative flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-all ${
                    isActive
                      ? "bg-white/10 text-white font-medium border border-white/15 shadow-sm backdrop-blur-md"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
                  }`}
                >
                  {isEditing ? (
                    <div
                      className="flex items-center gap-1 w-full"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveRename(session.id, e);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        className="flex-1 px-2 py-1 bg-black/60 border border-blue-500 rounded text-white text-xs outline-none"
                      />
                      <button
                        type="button"
                        onClick={(e) => handleSaveRename(session.id, e)}
                        className="p-1 text-emerald-400 hover:bg-white/10 rounded"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingId(null);
                        }}
                        className="p-1 text-rose-400 hover:bg-white/10 rounded"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="truncate pr-2">{session.title}</span>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={(e) => handleStartRename(session, e)}
                          title="Yeniden Adlandır"
                          className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-slate-200"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onExportSession(session, "markdown");
                          }}
                          title="Dışa Aktar (.md)"
                          className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-slate-200"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSession(session.id);
                          }}
                          title="Sil"
                          className="p-1 rounded-lg hover:bg-rose-950/60 text-slate-400 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Actions Footer */}
        <div className="p-3 border-t border-white/10 space-y-2">
          {showClearConfirm ? (
            <div className="p-2.5 bg-rose-950/40 border border-rose-500/30 rounded-2xl space-y-2 backdrop-blur-md">
              <p className="text-[11px] text-rose-300 font-medium">
                Tüm sohbet geçmişi silinecektir. Emin misiniz?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClearAllSessions();
                    setShowClearConfirm(false);
                  }}
                  className="flex-1 py-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow"
                >
                  Evet, Sil
                </button>
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-1 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs"
                >
                  Vazgeç
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <button
                id="btn-open-settings"
                type="button"
                onClick={onOpenSettings}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/10 text-xs font-medium backdrop-blur-md transition-colors"
              >
                <Sliders className="w-3.5 h-3.5 text-blue-400" />
                <span>Ayarlar & Model</span>
              </button>
              {sessions.length > 0 && (
                <button
                  id="btn-clear-all-history"
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  title="Geçmişi Temizle"
                  className="p-2 rounded-xl bg-white/[0.04] hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 border border-white/10 backdrop-blur-md transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
