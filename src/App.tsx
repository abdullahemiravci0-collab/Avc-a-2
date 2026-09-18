import React, { useState, useEffect, useRef } from "react";
import { ChatSession, Message, AttachedImage, AppSettings, AIPersona } from "./types";
import { AI_PERSONAS } from "./data/personas";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { ChatMessage } from "./components/ChatMessage";
import { ChatInput } from "./components/ChatInput";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { SettingsModal } from "./components/SettingsModal";
import { ApiKeyModal } from "./components/ApiKeyModal";

const STORAGE_KEY_SESSIONS = "ai_asistan_sessions_v1";
const STORAGE_KEY_SETTINGS = "ai_asistan_settings_v1";
const STORAGE_KEY_API_KEY = "gemini_custom_user_api_key";

const DEFAULT_SETTINGS: AppSettings = {
  temperature: 0.7,
  enableSearch: false,
  model: "gemini-3.8-flash",
  ttsVoice: "Kore",
  customSystemPrompt: "",
  autoScroll: true,
  soundEnabled: true,
};

export default function App() {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SESSIONS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load sessions:", e);
    }
    return [];
  });

  const [apiKey, setApiKey] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_API_KEY) || "";
    } catch {
      return "";
    }
  });
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [hasEnvKey, setHasEnvKey] = useState(true);

  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>("general");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.model === "gemini-3.7-flash") {
          parsed.model = "gemini-3.8-flash";
        }
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (e) {
      console.error("Failed to load settings:", e);
    }
    return DEFAULT_SETTINGS;
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Save sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
    } catch (e) {
      console.error("Failed to save sessions:", e);
    }
  }, [sessions]);

  // Save settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error("Failed to save settings:", e);
    }
  }, [settings]);

  // Check server API key configuration status on mount
  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.hasEnvKey === "boolean") {
          setHasEnvKey(data.hasEnvKey);
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveApiKey = (newKey: string) => {
    const trimmed = newKey.trim();
    setApiKey(trimmed);
    try {
      if (trimmed) {
        localStorage.setItem(STORAGE_KEY_API_KEY, trimmed);
      } else {
        localStorage.removeItem(STORAGE_KEY_API_KEY);
      }
    } catch (e) {
      console.error("Failed to save custom API key:", e);
    }
  };

  // Active session object
  const currentSession = sessions.find((s) => s.id === activeSessionId) || null;

  // Active persona object
  const activePersona: AIPersona =
    AI_PERSONAS.find(
      (p) => p.id === (currentSession?.personaId || selectedPersonaId)
    ) || AI_PERSONAS[0];

  // Auto scroll to bottom
  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    if (settings.autoScroll) {
      scrollToBottom();
    }
  }, [currentSession?.messages, isLoading]);

  // Create a new chat session
  const handleNewChat = (personaId?: string) => {
    const targetPersonaId = personaId || selectedPersonaId;
    setSelectedPersonaId(targetPersonaId);
    setActiveSessionId("");
    setErrorMessage(null);
  };

  // Delete a session
  const handleDeleteSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (activeSessionId === id) {
      setActiveSessionId("");
    }
  };

  // Rename a session
  const handleRenameSession = (id: string, newTitle: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: newTitle } : s))
    );
  };

  // Clear all sessions
  const handleClearAllSessions = () => {
    setSessions([]);
    setActiveSessionId("");
  };

  // Export session to Markdown or JSON
  const handleExportSession = (
    session: ChatSession,
    format: "markdown" | "json"
  ) => {
    let content = "";
    const cleanTitle = session.title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    let fileName = `${cleanTitle || "sohbet"}_${new Date().toISOString().slice(0, 10)}`;

    if (format === "json") {
      content = JSON.stringify(session, null, 2);
      fileName += ".json";
    } else {
      const persona = AI_PERSONAS.find((p) => p.id === session.personaId);
      content = `# ${session.title}\n\n*Tarih: ${new Date(session.createdAt).toLocaleString()}*\n*Asistan Rolü: ${persona?.name || "AVCI AI"}*\n\n---\n\n`;
      session.messages.forEach((msg) => {
        const sender = msg.role === "user" ? "Kullanıcı" : persona?.name || "AVCI AI";
        content += `### ${sender} (${new Date(msg.timestamp).toLocaleTimeString()})\n\n${msg.text}\n\n`;
        if (msg.sources && msg.sources.length > 0) {
          content += `*Kaynaklar:*\n`;
          msg.sources.forEach((s) => {
            content += `- [${s.title || s.uri}](${s.uri})\n`;
          });
          content += `\n`;
        }
      });
      fileName += ".md";
    }

    const blob = new Blob([content], {
      type: format === "json" ? "application/json" : "text/markdown",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Send message handler
  const handleSendMessage = async (
    text: string,
    images?: AttachedImage[]
  ) => {
    if ((!text.trim() && (!images || images.length === 0)) || isLoading) return;

    setErrorMessage(null);

    const userMessage: Message = {
      id: Math.random().toString(36).substring(2, 9),
      role: "user",
      text,
      images,
      timestamp: Date.now(),
    };

    let targetSessionId = activeSessionId;
    let updatedSessions = [...sessions];

    // If starting a new conversation, create session
    if (!targetSessionId) {
      const newSession: ChatSession = {
        id: Math.random().toString(36).substring(2, 9),
        title: text.length > 35 ? text.slice(0, 35) + "..." : text || "Görsel İnceleme",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        personaId: selectedPersonaId,
        messages: [userMessage],
      };
      targetSessionId = newSession.id;
      updatedSessions = [newSession, ...sessions];
      setSessions(updatedSessions);
      setActiveSessionId(targetSessionId);
    } else {
      updatedSessions = updatedSessions.map((s) => {
        if (s.id === targetSessionId) {
          return {
            ...s,
            updatedAt: Date.now(),
            messages: [...s.messages, userMessage],
          };
        }
        return s;
      });
      setSessions(updatedSessions);
    }

    setIsLoading(true);

    try {
      // Build conversation context
      const currentMessages =
        updatedSessions.find((s) => s.id === targetSessionId)?.messages || [
          userMessage,
        ];

      // Prepare payload
      const systemInstruction = [
        activePersona.systemInstruction,
        settings.customSystemPrompt,
      ]
        .filter(Boolean)
        .join("\n\n");

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { "x-gemini-api-key": apiKey } : {}),
        },
        body: JSON.stringify({
          messages: currentMessages,
          systemInstruction,
          temperature: settings.temperature,
          enableSearch: settings.enableSearch,
          model: settings.model,
          apiKey: apiKey || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Sunucu hatası: ${response.status}`
        );
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: Math.random().toString(36).substring(2, 9),
        role: "assistant",
        text: data.text || "Yanıt alınamadı.",
        sources: data.sources,
        modelUsed: data.model || settings.model,
        timestamp: Date.now(),
      };

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === targetSessionId) {
            return {
              ...s,
              updatedAt: Date.now(),
              messages: [...s.messages, assistantMessage],
            };
          }
          return s;
        })
      );
    } catch (err: any) {
      console.warn("Chat API warning handled:", err.message);
      const friendlyMsg =
        err.message ||
        "Yapay zeka yanıt verirken bir sorun yaşandı. Lütfen tekrar deneyin.";
      setErrorMessage(friendlyMsg);

      // Auto-open API key modal if error is auth-related
      const isAuthIssue =
        friendlyMsg.includes("API") ||
        friendlyMsg.includes("Yetkilendirme") ||
        friendlyMsg.includes("401") ||
        friendlyMsg.includes("UNAUTHENTICATED") ||
        friendlyMsg.includes("anahtarı");

      if (isAuthIssue && !apiKey) {
        setIsApiKeyModalOpen(true);
      }

      const errorMessageObj: Message = {
        id: Math.random().toString(36).substring(2, 9),
        role: "assistant",
        text: `⚠️ **Sistem Bildirimi:**\n\n${friendlyMsg}\n\n*İpucu: Giriş alanındaki uyarıya veya aşağıdaki **"API Key Yaz / Güncelle"** butonuna tıklayarak kendi Gemini API anahtarınızı tanımlayabilirsiniz.*`,
        timestamp: Date.now(),
        modelUsed: settings.model,
        isError: true,
      };

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === targetSessionId) {
            return {
              ...s,
              updatedAt: Date.now(),
              messages: [...s.messages, errorMessageObj],
            };
          }
          return s;
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryLastMessage = () => {
    if (!currentSession) return;
    const userMessages = currentSession.messages.filter((m) => m.role === "user");
    if (userMessages.length === 0) return;
    const lastUserMsg = userMessages[userMessages.length - 1];

    // Filter out trailing error messages
    const filtered = currentSession.messages.filter((m) => !m.isError);
    setSessions((prev) =>
      prev.map((s) => (s.id === currentSession.id ? { ...s, messages: filtered } : s))
    );

    handleSendMessage(lastUserMsg.text, lastUserMsg.images);
  };

  return (
    <div className="relative flex h-screen w-full bg-[#050507] text-slate-100 font-sans antialiased overflow-hidden select-none">
      {/* Frosted Glass Background Ambient Glowing Orbs */}
      <div className="fixed -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed top-1/3 -right-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-[160px] pointer-events-none z-0" />
      <div className="fixed -bottom-40 left-1/3 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[180px] pointer-events-none z-0" />

      {/* Sidebar */}
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={(id) => {
          setActiveSessionId(id);
          const s = sessions.find((item) => item.id === id);
          if (s) setSelectedPersonaId(s.personaId);
          setErrorMessage(null);
        }}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        onClearAllSessions={handleClearAllSessions}
        onExportSession={handleExportSession}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        personas={AI_PERSONAS}
        selectedPersonaId={selectedPersonaId}
        onSelectPersona={(personaId) => {
          setSelectedPersonaId(personaId);
          if (currentSession) {
            setSessions((prev) =>
              prev.map((s) =>
                s.id === currentSession.id ? { ...s, personaId } : s
              )
            );
          }
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full min-w-0 relative z-10">
        {/* Header */}
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          activePersona={activePersona}
          currentSession={currentSession}
          model={settings.model}
          enableSearch={settings.enableSearch}
          onNewChat={handleNewChat}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onExport={() =>
            currentSession && handleExportSession(currentSession, "markdown")
          }
          apiKey={apiKey}
          onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        />

        {/* Error Notification Banner */}
        {errorMessage && (
          <div
            id="error-banner"
            className="px-4 py-2.5 bg-rose-950/60 backdrop-blur-md border-b border-rose-500/30 text-rose-200 text-xs sm:text-sm flex items-center justify-between z-20 animate-fadeIn"
          >
            <span>{errorMessage}</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsApiKeyModalOpen(true)}
                className="text-amber-300 hover:text-white px-2 py-0.5 rounded text-xs underline font-medium cursor-pointer"
              >
                API Key Yaz
              </button>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-rose-400 hover:text-white px-2 py-0.5 rounded text-xs underline cursor-pointer"
              >
                Kapat
              </button>
            </div>
          </div>
        )}

        {/* Message Container / Welcome View */}
        <div className="flex-1 overflow-y-auto min-h-0 flex flex-col">
          {!currentSession || currentSession.messages.length === 0 ? (
            <WelcomeScreen
              activePersona={activePersona}
              onSelectPrompt={(prompt) => handleSendMessage(prompt)}
              personas={AI_PERSONAS}
              onSelectPersona={(persona) => setSelectedPersonaId(persona.id)}
            />
          ) : (
            <div className="flex-1 pb-4">
              {currentSession.messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  personaName={activePersona.name}
                  settings={settings}
                  onRetry={handleRetryLastMessage}
                  onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
                  apiKey={apiKey}
                />
              ))}

              {/* Loading Indicator with Frosted Glass Styling */}
              {isLoading && (
                <div className="w-full py-5 px-4 sm:px-6 bg-white/[0.02] backdrop-blur-md border-b border-white/[0.06]">
                  <div className="max-w-4xl mx-auto flex gap-4 sm:gap-6 items-center">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 border border-white/20 animate-pulse">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <span className="font-medium text-slate-200">
                        {activePersona.name} yanıt oluşturuyor...
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Bottom Input Area */}
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          enableSearch={settings.enableSearch}
          onToggleSearch={() =>
            setSettings((prev) => ({
              ...prev,
              enableSearch: !prev.enableSearch,
            }))
          }
          activePersona={activePersona}
          onSelectPersona={(persona) => {
            setSelectedPersonaId(persona.id);
            if (currentSession) {
              setSessions((prev) =>
                prev.map((s) =>
                  s.id === currentSession.id
                    ? { ...s, personaId: persona.id }
                    : s
                )
              );
            }
          }}
          personas={AI_PERSONAS}
          apiKey={apiKey}
          onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
          hasEnvKey={hasEnvKey}
        />
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newSettings) =>
          setSettings((prev) => ({ ...prev, ...newSettings }))
        }
        onResetSettings={() => setSettings(DEFAULT_SETTINGS)}
      />

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
        hasEnvKey={hasEnvKey}
      />
    </div>
  );
}
