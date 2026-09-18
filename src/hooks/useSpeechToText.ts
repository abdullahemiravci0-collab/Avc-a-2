import { useState, useEffect, useRef, useCallback } from "react";

export interface SpeechToTextOptions {
  initialLanguage?: string;
  onFinalResult?: (finalText: string) => void;
  onInterimResult?: (interimText: string) => void;
}

export interface UseSpeechToTextReturn {
  isSupported: boolean;
  isListening: boolean;
  interimTranscript: string;
  transcript: string;
  volume: number;
  error: string | null;
  language: string;
  durationSeconds: number;
  setLanguage: (lang: string) => void;
  startListening: (lang?: string) => Promise<boolean>;
  stopListening: () => void;
  cancelListening: () => void;
  clearTranscript: () => void;
  clearError: () => void;
}

export const SUPPORTED_LANGUAGES = [
  { code: "tr-TR", label: "Türkçe", flag: "🇹🇷" },
  { code: "en-US", label: "English", flag: "🇺🇸" },
  { code: "de-DE", label: "Deutsch", flag: "🇩🇪" },
  { code: "fr-FR", label: "Français", flag: "🇫🇷" },
  { code: "es-ES", label: "Español", flag: "🇪🇸" },
  { code: "ar-SA", label: "العربية", flag: "🇸🇦" },
];

export function useSpeechToText(options?: SpeechToTextOptions): UseSpeechToTextReturn {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [transcript, setTranscript] = useState("");
  const [volume, setVolume] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguageState] = useState(options?.initialLanguage || "tr-TR");
  const [durationSeconds, setDurationSeconds] = useState(0);

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<any>(null);
  const shouldRestartRef = useRef(false);

  // Check Web Speech API availability
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
  }, []);

  // Timer for dictation duration
  useEffect(() => {
    if (isListening) {
      setDurationSeconds(0);
      timerIntervalRef.current = setInterval(() => {
        setDurationSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isListening]);

  // Audio volume visualizer setup
  const startAudioVisualizer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        // Normalize roughly between 0 and 100
        const normalized = Math.min(100, Math.round((avg / 128) * 100));
        setVolume(normalized);

        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };

      updateVolume();
    } catch (err) {
      console.warn("Mikrofon görselleştirici başlatılamadı:", err);
      // Fallback: subtle random pulse when speaking
    }
  };

  const stopAudioVisualizer = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    analyserRef.current = null;
    setVolume(0);
  };

  // Start listening
  const startListening = useCallback(
    async (langOverride?: string): Promise<boolean> => {
      setError(null);
      const targetLang = langOverride || language;

      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setError(
          "Tarayıcınız Web Speech API desteklemiyor. Lütfen Chrome, Edge veya Safari kullanın."
        );
        return false;
      }

      // Stop any existing instance
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }

      try {
        const recognition = new SpeechRecognition();
        recognition.lang = targetLang;
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        shouldRestartRef.current = true;

        recognition.onstart = () => {
          setIsListening(true);
          setError(null);
          startAudioVisualizer();
        };

        recognition.onresult = (event: any) => {
          let currentInterim = "";
          let finalChunk = "";

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const result = event.results[i];
            const textChunk = result[0].transcript;

            if (result.isFinal) {
              finalChunk += textChunk;
            } else {
              currentInterim += textChunk;
            }
          }

          if (finalChunk) {
            setTranscript((prev) => {
              const cleanedChunk = finalChunk.trim();
              if (!cleanedChunk) return prev;
              const next = prev ? `${prev} ${cleanedChunk}` : cleanedChunk;
              options?.onFinalResult?.(next);
              return next;
            });
          }

          setInterimTranscript(currentInterim);
          options?.onInterimResult?.(currentInterim);
        };

        recognition.onerror = (event: any) => {
          console.warn("Web Speech API hatası:", event.error);
          if (event.error === "not-allowed" || event.error === "service-not-allowed") {
            shouldRestartRef.current = false;
            setError("Mikrofon erişimi engellendi. Lütfen tarayıcı izinlerinden mikrofona onay verin.");
            setIsListening(false);
            stopAudioVisualizer();
          } else if (event.error === "audio-capture") {
            shouldRestartRef.current = false;
            setError("Mikrofon bulunamadı. Lütfen ses giriş cihazınızı kontrol edin.");
            setIsListening(false);
            stopAudioVisualizer();
          } else if (event.error === "network") {
            shouldRestartRef.current = false;
            setError("Ses tanıma için internet bağlantısı gerekli.");
            setIsListening(false);
            stopAudioVisualizer();
          } else if (event.error === "no-speech") {
            // Silence detected; in continuous mode we simply let it keep listening
          } else {
            setError(`Ses tanıma uyarısı: ${event.error}`);
          }
        };

        recognition.onend = () => {
          // If continuous listening was not explicitly stopped and no fatal error occurred,
          // some browsers pause on brief silence. We restart if intended.
          if (shouldRestartRef.current) {
            try {
              recognition.start();
              return;
            } catch (_) {}
          }
          setIsListening(false);
          setInterimTranscript("");
          stopAudioVisualizer();
        };

        recognitionRef.current = recognition;
        recognition.start();
        return true;
      } catch (err: any) {
        console.error("Speech recognition başlatılamadı:", err);
        setError("Ses tanıma başlatılamadı. Lütfen mikrofon izinlerini kontrol edin.");
        setIsListening(false);
        stopAudioVisualizer();
        return false;
      }
    },
    [language, options]
  );

  // Stop listening gracefully
  const stopListening = useCallback(() => {
    shouldRestartRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }
    setIsListening(false);
    setInterimTranscript("");
    stopAudioVisualizer();
  }, []);

  // Cancel and discard current session's recognized text
  const cancelListening = useCallback(() => {
    shouldRestartRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (_) {}
    }
    setIsListening(false);
    setInterimTranscript("");
    setTranscript("");
    stopAudioVisualizer();
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const setLanguage = useCallback((lang: string) => {
    setLanguageState(lang);
    if (recognitionRef.current && isListening) {
      // Restart with new language
      shouldRestartRef.current = false;
      try {
        recognitionRef.current.stop();
      } catch (_) {}
      setTimeout(() => {
        startListening(lang);
      }, 150);
    }
  }, [isListening, startListening]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      shouldRestartRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
      stopAudioVisualizer();
    };
  }, []);

  return {
    isSupported,
    isListening,
    interimTranscript,
    transcript,
    volume,
    error,
    language,
    durationSeconds,
    setLanguage,
    startListening,
    stopListening,
    cancelListening,
    clearTranscript,
    clearError,
  };
}
