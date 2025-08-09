import React, { useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";

type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
};

const STORAGE_KEY = "ai_teacher_history_v1";

async function askMistral(prompt: string, history: ChatMessage[]): Promise<string> {
  const apiKey = import.meta.env.VITE_MISTRAL_API_KEY as string | undefined;
  if (!apiKey) {
    return "⚠️ Mistral API key is not configured. Please set VITE_MISTRAL_API_KEY in .env";
  }

  // Keep a short context: last 6 interactions (system + few turns)
  const context = [
    {
      role: "system",
      content:
        "You are OnlinePanthi's friendly AI Teacher. Answer briefly and correctly in 2–4 short bullet points with helpful emojis. Keep it concise and straight to the point. If an equation, code, or definition is needed, include a tiny example (1–3 lines maximum). Avoid long paragraphs.",
    },
    ...history.slice(-6).map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: prompt },
  ];

  try {
    const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "mistral-small-latest",
        temperature: 0.2,
        max_tokens: 220,
        messages: context,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return `❌ Mistral API error: ${res.status} ${res.statusText}\n${text}`;
    }
    const data = await res.json();
    const answer = data?.choices?.[0]?.message?.content || "I couldn't generate a response.";
    return answer;
  } catch (e: any) {
    return `❌ Network error contacting Mistral: ${e?.message || e}`;
  }
}

function usePersistentHistory() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as ChatMessage[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages]);

  const add = (m: ChatMessage) => setMessages((prev) => [...prev, m]);
  const clear = () => setMessages([]);
  return { messages, setMessages, add, clear };
}

const AiTeacher: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { messages, add, clear } = usePersistentHistory();
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
    if (open && inputRef.current) {
      // Autofocus input when opening on mobile/desktop
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open, messages, loading]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function handleSend(e?: React.FormEvent | React.MouseEvent) {
    if (e) {
      e.preventDefault();
      // Some mobile browsers require explicit stopPropagation
      // to avoid form reflows blocking async work.
      // @ts-ignore
      if (e.stopPropagation) e.stopPropagation();
    }
    const q = input.trim();
    if (!q || loading) return;

    const makeId = () => (crypto?.randomUUID?.() ?? String(Date.now() + Math.random()));
    const userMsg: ChatMessage = { id: makeId(), role: "user", content: q };
    add(userMsg);
    setInput("");
    setLoading(true);

    const answer = await askMistral(q, messages.concat(userMsg));
    const aiMsg: ChatMessage = { id: makeId(), role: "assistant", content: answer };
    add(aiMsg);

    // Small cooldown to prevent rapid-fire taps; keep keyboard ready
    setTimeout(() => {
      setLoading(false);
      inputRef.current?.focus();
    }, 800);
  }

  return (
    <>
      {/* Floating trigger button - adjusts for mobile safe area */}
      <button
        aria-label="AI Teacher"
        onClick={() => setOpen((o) => !o)}
        className="fixed z-50 w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-ocean-500 text-white shadow-xl flex items-center justify-center hover:scale-105 transition-transform
                   right-4 bottom-[92px] sm:bottom-6 sm:right-6"
        style={{
          // Respect mobile safe-area insets
          paddingBottom: "calc(env(safe-area-inset-bottom) / 2)",
          marginBottom: "env(safe-area-inset-bottom)"
        }}
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed z-50 rounded-2xl bg-white shadow-2xl border border-ocean-100 overflow-hidden
                     w-[96vw] sm:w-[90vw] max-w-[380px]
                     right-2 sm:right-6
                     bottom-[160px] sm:bottom-24"
          style={{
            // Ensure it fits inside viewport with safe areas
            maxHeight: "min(70vh, 560px)",
          }}
        >
          <div className="px-3 sm:px-4 py-3 bg-gradient-to-r from-teal-500 to-ocean-500 text-white flex items-center justify-between">
            <div className="font-semibold">AI Teacher</div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => clear()}
                className="text-xs bg-white/20 hover:bg-white/30 rounded-full px-2.5 py-1"
                title="Clear conversation"
              >
                Clear
              </button>
              <button
                onClick={() => setOpen(false)}
                className="text-xs bg-white/20 hover:bg-white/30 rounded-full px-2.5 py-1"
                title="Close"
              >
                Close
              </button>
            </div>
          </div>

          <div
            ref={listRef}
            className="overflow-y-auto px-3 py-3 space-y-3 bg-white"
            style={{ maxHeight: "calc(min(70vh, 560px) - 104px)" }}
          >
            {messages.length === 0 && (
              <div className="text-sm text-ocean-600/80">
                👋 Hi! I’m your AI Teacher. Ask me anything about courses, topics, math, science, or programming. I’ll explain with clarity, examples, and emojis!
              </div>
            )}
            {messages.map((m) => (
              <div key={m.id} className={m.role === "user" ? "text-right" : "text-left"}>
                <div
                  className={
                    "inline-block rounded-2xl px-3 py-2 text-sm " +
                    (m.role === "user"
                      ? "bg-ocean-600 text-white"
                      : "bg-ocean-50 text-ocean-700 border border-ocean-100")
                  }
                >
                  <div className="whitespace-pre-wrap">{m.content}</div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="text-left">
                <div className="inline-block rounded-2xl px-3 py-2 text-sm bg-ocean-50 text-ocean-700 border border-ocean-100">
                  Thinking… ✨
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => handleSend(e)}
            className="p-2 sm:p-3 border-t border-ocean-100 bg-white"
          >
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e as any);
                  }
                }}
                inputMode="text"
                autoCapitalize="sentences"
                autoCorrect="on"
                placeholder="Ask me anything…"
                className="flex-1 px-3 py-2 rounded-xl border border-ocean-200 focus:outline-none focus:ring-2 focus:ring-ocean-400 text-sm"
              />
              <button
                type="submit"
                onClick={(e) => handleSend(e)}
                disabled={loading || !input.trim()}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-ocean-600 text-white hover:bg-ocean-700 disabled:opacity-60 text-sm"
                title={loading ? "Please wait…" : "Send"}
              >
                <Send className="w-4 h-4" />
                Ask
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default AiTeacher;
