export interface AttachedImage {
  id: string;
  data: string; // base64 or data URL
  mimeType: string;
  name: string;
  size?: number;
}

export interface GroundingSource {
  uri: string;
  title?: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  images?: AttachedImage[];
  sources?: GroundingSource[];
  timestamp: number;
  modelUsed?: string;
  isError?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  personaId: string;
  messages: Message[];
}

export interface AIPersona {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  systemInstruction: string;
  temperature: number;
  color: string;
  starterPrompts: string[];
}

export interface AppSettings {
  temperature: number;
  enableSearch: boolean;
  model: string;
  ttsVoice: "Kore" | "Puck" | "Charon" | "Fenrir" | "Zephyr";
  customSystemPrompt: string;
  autoScroll: boolean;
  soundEnabled: boolean;
}
