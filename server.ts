import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

function getGeminiClient(customApiKey?: string): GoogleGenAI {
  const trimmedCustom = typeof customApiKey === "string" ? customApiKey.trim() : "";
  const apiKey = trimmedCustom || process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "" || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error(
      "GEMINI_API_KEY yapılandırılmamış. Sohbet girdisindeki 'API Key Yaz' uyarısına tıklayarak API anahtarınızı girebilir veya AI Studio panelindeki Settings > Secrets bölümünden ekleyebilirsiniz."
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

function parseGeminiError(error: any): { status: number; message: string; code: string } {
  let rawMessage = error?.message || "";
  let status = error?.status || 500;
  let code = "UNKNOWN_ERROR";

  // Try to parse rawMessage if it is a stringified JSON
  if (typeof rawMessage === "string" && rawMessage.trim().startsWith("{")) {
    try {
      const parsed = JSON.parse(rawMessage);
      if (parsed.error) {
        status = parsed.error.code || status;
        code = parsed.error.status || parsed.error.details?.[0]?.reason || code;
        rawMessage = parsed.error.message || rawMessage;
      }
    } catch {
      // Keep original rawMessage
    }
  }

  // Check for authentication / key issues
  if (
    status === 401 ||
    rawMessage.includes("UNAUTHENTICATED") ||
    rawMessage.includes("ACCESS_TOKEN_TYPE_UNSUPPORTED") ||
    rawMessage.includes("API_KEY_INVALID") ||
    rawMessage.includes("invalid authentication credentials") ||
    rawMessage.includes("GEMINI_API_KEY yapılandırılmamış")
  ) {
    return {
      status: 401,
      code: "AUTH_ERROR",
      message:
        "Gemini API kimlik doğrulaması başarısız oldu (401). AI Studio sağ üst köşesindeki Settings > Secrets panelinden geçerli ve aktif bir GEMINI_API_KEY tanımlandığından emin olun.",
    };
  }

  // Check for quota / rate limit
  if (
    status === 429 ||
    rawMessage.includes("RESOURCE_EXHAUSTED") ||
    rawMessage.includes("quota")
  ) {
    return {
      status: 429,
      code: "QUOTA_ERROR",
      message: "API istek limiti (kota) aşıldı. Lütfen kısa bir süre bekleyip tekrar deneyin.",
    };
  }

  // Check for model not found
  if (status === 404 || rawMessage.includes("NOT_FOUND")) {
    return {
      status: 404,
      code: "MODEL_NOT_FOUND",
      message: "Seçilen model bulunamadı veya bu bölgede desteklenmiyor.",
    };
  }

  return {
    status: status >= 400 && status < 600 ? status : 500,
    code,
    message: rawMessage || "Yapay zeka yanıtı üretilirken beklenmeyen bir hata oluştu.",
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    const envKey = process.env.GEMINI_API_KEY;
    const hasEnvKey = !!(envKey && envKey.trim() !== "" && envKey !== "MY_GEMINI_API_KEY");
    res.json({
      status: "ok",
      hasKey: hasEnvKey,
      hasEnvKey,
      timestamp: new Date().toISOString(),
    });
  });

  // Verify API Key endpoint
  app.post("/api/verify-key", async (req, res) => {
    try {
      const customApiKey =
        (req.headers["x-gemini-api-key"] as string) || req.body?.apiKey;
      const ai = getGeminiClient(customApiKey);
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: [{ role: "user", parts: [{ text: "ping" }] }],
      });
      if (response && response.text) {
        return res.json({ ok: true, message: "API Anahtarı geçerli ve çalışıyor!" });
      }
      return res.json({ ok: true });
    } catch (error: any) {
      const parsed = parseGeminiError(error);
      res.status(parsed.status).json({
        ok: false,
        error: parsed.message,
        code: parsed.code,
      });
    }
  });

  // Chat / Completion endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const {
        messages,
        systemInstruction,
        temperature = 0.7,
        enableSearch = false,
        model = "gemini-3.8-flash",
        apiKey,
      } = req.body;

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: "Mesaj listesi zorunludur." });
      }

      const customApiKey =
        (req.headers["x-gemini-api-key"] as string) || apiKey;
      const ai = getGeminiClient(customApiKey);

      // Convert messages to Gemini API format
      // messages is array of { role: 'user' | 'model', text: string, images?: Array<{ data: string, mimeType: string }> }
      const contents = messages.map((msg: any) => {
        const parts: any[] = [];
        
        // Add images if present
        if (msg.images && Array.isArray(msg.images)) {
          for (const img of msg.images) {
            if (img.data) {
              // Strip data URI prefix if present
              const base64Data = img.data.includes(";base64,")
                ? img.data.split(";base64,")[1]
                : img.data;
              parts.push({
                inlineData: {
                  data: base64Data,
                  mimeType: img.mimeType || "image/png",
                },
              });
            }
          }
        }

        if (msg.text) {
          parts.push({ text: msg.text });
        } else if (parts.length === 0) {
          parts.push({ text: " " });
        }

        return {
          role: msg.role === "assistant" || msg.role === "model" ? "model" : "user",
          parts,
        };
      });

      const config: any = {
        temperature: Math.max(0, Math.min(2, Number(temperature) || 0.7)),
      };

      if (systemInstruction && typeof systemInstruction === "string") {
        config.systemInstruction = systemInstruction;
      }

      if (enableSearch) {
        config.tools = [{ googleSearch: {} }];
      }

      const selectedModel = model || "gemini-3.8-flash";
      const response = await ai.models.generateContent({
        model: selectedModel,
        contents,
        config,
      });

      const text = response.text || "";
      const groundingChunks =
        response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const webSources = groundingChunks
        .map((chunk: any) => chunk.web)
        .filter((web: any) => web && web.uri);

      res.json({
        text,
        sources: webSources,
        model: selectedModel,
      });
    } catch (error: any) {
      const parsed = parseGeminiError(error);
      console.warn(`[Gemini API] Request error handled (${parsed.code}):`, parsed.message);
      res.status(parsed.status).json({
        error: parsed.message,
        code: parsed.code,
      });
    }
  });

  // Text-to-Speech endpoint
  app.post("/api/tts", async (req, res) => {
    try {
      const { text, voice = "Kore", apiKey } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Seslendirilecek metin zorunludur." });
      }

      const customApiKey =
        (req.headers["x-gemini-api-key"] as string) || apiKey;
      const ai = getGeminiClient(customApiKey);
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: text.slice(0, 1000) }] }],
        config: {
          responseModalities: ["AUDIO" as any],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice || "Kore" },
            },
          },
        },
      });

      const base64Audio =
        response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

      if (!base64Audio) {
        return res.status(500).json({ error: "Ses oluşturulamadı." });
      }

      res.json({
        audio: base64Audio,
        mimeType: "audio/wav",
      });
    } catch (error: any) {
      const parsed = parseGeminiError(error);
      console.warn(`[Gemini TTS] Request error handled (${parsed.code}):`, parsed.message);
      res.status(parsed.status).json({
        error: parsed.message,
        code: parsed.code,
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AVCI AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
