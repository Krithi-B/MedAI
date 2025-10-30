"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, X, Mic, Send } from "lucide-react";
import { toast } from "react-hot-toast";

// ✅ Define proper Message type
type Message = {
  id: string;
  sender: "user" | "bot";
  text: string;
  time: string;
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  // Typed refs
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const baseInputRef = useRef<string>("");

  // ✅ Fetch email once from backend using token
  useEffect(() => {
    const fetchEmail = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch("http://localhost:5000/api/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data: { email?: string; user?: { email?: string } } =
          await res.json();
        if (data.email) setEmail(data.email);
        else if (data.user?.email) setEmail(data.user.email);
      } catch (err) {
        console.error("Error fetching email:", err);
      }
    };
    fetchEmail();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  // ❌ Removed speakText since we don’t want voice output

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const id = Date.now().toString();
    const time = new Date().toLocaleTimeString();
    setMessages((m) => [...m, { id, sender: "user", text, time }]);
    setInput("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/chatbot/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message: text, ...(email ? { email } : {}) }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Chatbot error");
        setMessages((m) => [
          ...m,
          {
            id: Date.now().toString(),
            sender: "bot",
            text: data.error || "Sorry, something went wrong.",
            time: new Date().toLocaleTimeString(),
          },
        ]);
      } else {
        const botText: string = data.answer || data?.content || "No response";
        const botId = "bot-" + Date.now().toString();
        setMessages((m) => [
          ...m,
          {
            id: botId,
            sender: "bot",
            text: botText,
            time: new Date().toLocaleTimeString(),
          },
        ]);
        // ❌ intentionally no TTS (no speakText)
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error");
      setMessages((m) => [
        ...m,
        {
          id: Date.now().toString(),
          sender: "bot",
          text: "Network error. Try again later.",
          time: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // ✅ Fixed SpeechRecognition type issue (no 'any' used)
  const startListening = () => {
    // Use Window declarations from your global.d.ts (value access via win.SpeechRecognition)
    const win = window as unknown as Window & {
      SpeechRecognition?: { new (): SpeechRecognition };
      webkitSpeechRecognition?: { new (): SpeechRecognition };
    };

    const SpeechRecognitionClass =
      win.SpeechRecognition ?? win.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      toast.error("Speech recognition not supported in this browser.");
      return;
    }

    baseInputRef.current = input;
    const recognition: SpeechRecognition = new SpeechRecognitionClass();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const startIndex = (event as { resultIndex?: number }).resultIndex ?? 0;
      let interim = "";
      let finalTranscript = "";

      for (let i = startIndex; i < event.results.length; i++) {
        const r = event.results[i];
        const transcript = r[0].transcript || "";
        if (r.isFinal) {
          finalTranscript += transcript;
        } else {
          interim += transcript;
        }
      }

      if (finalTranscript) {
        const newValue =
          (baseInputRef.current ? baseInputRef.current + " " : "") +
          finalTranscript;
        setInput(newValue);
        baseInputRef.current = newValue;
      } else {
        setInput(
          (baseInputRef.current ? baseInputRef.current + " " : "") + interim
        );
      }
    };

    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error", e);
      toast.error("Speech recognition error");
      setListening(false);
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };

    recognition.start();
    recognitionRef.current = recognition;
    setListening(true);
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      recognitionRef.current = null;
    }
    setListening(false);
  };

  return (
    <>
      {/* Floating Chatbot Button */}
      <button
        aria-label="Open chat"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full 
             bg-gradient-to-br from-sky-600 to-emerald-500 
             shadow-[0_0_20px_rgba(56,189,248,0.4)] 
             flex items-center justify-center text-white 
             transition-all duration-300 ease-in-out 
             hover:shadow-[0_0_35px_rgba(56,189,248,0.8)] 
             hover:scale-110 animate-bounce-slow"
      >
        <MessageSquare className="w-6 h-6 drop-shadow-md" />
      </button>

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full z-50 transform transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ width: "min(100%,420px)" }}
      >
        <div className="h-full bg-gradient-to-b from-white to-sky-50 shadow-xl flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-sky-600 to-emerald-500 p-2 rounded-md text-white">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <div className="text-lg font-semibold text-slate-800">
                  MedAI Assistant
                </div>
                <div className="text-sm text-slate-500">
                  Ask health questions about your profile
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-sm text-slate-500">
                  Hi, ask anything about your health, appointments or reports.
                </div>
              )}
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${
                    m.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`${
                      m.sender === "user"
                        ? "bg-sky-700 text-white"
                        : "bg-white border"
                    } max-w-[85%] p-3 rounded-lg shadow-sm`}
                  >
                    <div className="text-sm whitespace-pre-line">{m.text}</div>
                    <div className="text-[11px] opacity-60 mt-2">{m.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Input area */}
          <div className="p-4 border-t">
            <div className="flex items-start gap-2">
              <button
                onClick={() => (listening ? stopListening() : startListening())}
                className={`p-2 rounded-md ${
                  listening ? "bg-red-600 text-white" : "bg-slate-100"
                }`}
                aria-label="voice-input"
                title="Voice input"
              >
                <Mic className="w-5 h-5" />
              </button>

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Type or speak your message..."
                className="flex-1 resize-none p-3 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-200"
                rows={2}
              />

              <button
                onClick={() => sendMessage(input)}
                disabled={loading || !input.trim()}
                className="ml-2 bg-sky-600 hover:bg-sky-700 p-2 rounded-md text-white"
                title="Send"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-2 text-xs text-slate-500">
              Press Enter to send. Use the mic to speak.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
