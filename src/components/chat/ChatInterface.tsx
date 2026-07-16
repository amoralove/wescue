"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import type { MatchResult, ChatMessage, AdopterPreferences } from "@/types";

const WOBBLY = [
  "255px 15px 225px 15px / 15px 225px 15px 255px",
  "15px 255px 15px 225px / 225px 15px 255px 15px",
  "30px 255px 20px 255px / 255px 30px 255px 20px",
  "255px 20px 225px 20px / 20px 225px 20px 255px",
];

const GREETING: ChatMessage = {
  role: "assistant",
  content: "Hey there! 🐾 I'm Wescue — I help match rescue dogs with the right homes. Tell me a bit about yourself and what you're looking for. Where do you live, and what's your lifestyle like?",
  timestamp: new Date().toISOString(),
};

const QUIZ_STEPS: Array<{
  question: string;
  options: Array<{ label: string; prefs: Partial<AdopterPreferences> }>;
}> = [
  {
    question: "Where do you live?",
    options: [
      { label: "Apartment 🏢", prefs: { living_situation: "apartment", has_yard: false } },
      { label: "House with yard 🏡", prefs: { living_situation: "house", has_yard: true } },
      { label: "House, no yard 🏠", prefs: { living_situation: "house", has_yard: false } },
    ],
  },
  {
    question: "How active are you?",
    options: [
      { label: "Relaxed 😴", prefs: { activity_level: "relaxed" } },
      { label: "Moderate 🚶", prefs: { activity_level: "moderate" } },
      { label: "Very Active 🏃", prefs: { activity_level: "very active" } },
    ],
  },
  {
    question: "Preferred dog size?",
    options: [
      { label: "Small 🐶", prefs: { size_preference: "small" } },
      { label: "Medium 🐕", prefs: { size_preference: "medium" } },
      { label: "Large / XL 🦮", prefs: { size_preference: "large" } },
      { label: "No preference 🤷", prefs: { size_preference: null } },
    ],
  },
  {
    question: "Kids at home?",
    options: [
      { label: "Yes, I have kids 👶", prefs: { has_kids: true } },
      { label: "No kids", prefs: { has_kids: false } },
    ],
  },
  {
    question: "Other pets at home?",
    options: [
      { label: "Dogs 🐕", prefs: { has_dogs: true, has_cats: false } },
      { label: "Cats 🐱", prefs: { has_dogs: false, has_cats: true } },
      { label: "Dogs & Cats 🐶🐱", prefs: { has_dogs: true, has_cats: true } },
      { label: "No other pets", prefs: { has_dogs: false, has_cats: false } },
    ],
  },
];

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<MatchResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [quizMode, setQuizMode] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [quizPrefs, setQuizPrefs] = useState<Partial<AdopterPreferences>>({});
  const [quizLoading, setQuizLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "NO_CREDITS") {
          setQuizMode(true);
          return;
        }
        throw new Error(data.error ?? "Something went wrong");
      }

      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: data.message,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);

      if (data.matches) {
        setMatches(data.matches);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function restart() {
    setMessages([GREETING]);
    setInput("");
    setMatches(null);
    setError(null);
    setQuizMode(false);
    setQuizStep(0);
    setQuizPrefs({});
  }

  async function handleQuizOption(prefs: Partial<AdopterPreferences>) {
    const merged = { ...quizPrefs, ...prefs };
    setQuizPrefs(merged);

    const nextStep = quizStep + 1;
    if (nextStep < QUIZ_STEPS.length) {
      setQuizStep(nextStep);
      return;
    }

    setQuizLoading(true);
    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(merged),
      });
      const data = await res.json();
      if (res.ok && data.matches) {
        setMatches(data.matches);
      } else {
        setError("Couldn't load matches. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setQuizLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">

      {/* Quiz fallback — shown instead of chat when AI credits are unavailable */}
      {quizMode && matches === null && (
        <div className="flex flex-col gap-4">
          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl px-4 py-3 text-sm text-center text-amber-800">
            AI chat temporarily unavailable — using quick quiz mode instead ✨
          </div>

          {quizLoading ? (
            <div className="card-sketchy p-12 text-center" style={{ borderRadius: WOBBLY[0] }}>
              <div className="flex gap-1.5 justify-center mb-3">
                <span className="w-2 h-2 rounded-full bg-forest animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 rounded-full bg-forest animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 rounded-full bg-forest animate-bounce [animation-delay:300ms]" />
              </div>
              <p className="font-heading text-lg font-bold opacity-60">Finding your matches…</p>
            </div>
          ) : (
            <div className="card-sketchy p-7" style={{ borderRadius: WOBBLY[0] }}>
              {/* Step progress */}
              <div className="flex gap-1.5 mb-6 justify-center">
                {QUIZ_STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i < quizStep
                        ? "bg-forest w-6"
                        : i === quizStep
                        ? "bg-forest w-8"
                        : "bg-pencil/20 w-4"
                    }`}
                  />
                ))}
              </div>

              <p className="font-heading text-xl font-bold text-center mb-6">
                {QUIZ_STEPS[quizStep].question}
              </p>

              <div className="grid grid-cols-2 gap-3">
                {QUIZ_STEPS[quizStep].options.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => handleQuizOption(opt.prefs)}
                    className="btn-sketchy py-3 text-sm text-center hover:bg-forest hover:text-white transition-colors"
                    style={{ borderRadius: WOBBLY[1] }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <p className="text-xs text-center opacity-40 mt-5">
                Question {quizStep + 1} of {QUIZ_STEPS.length}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Chat window — hidden when quiz mode is active */}
      {!quizMode && (
        <div
          className="card-sketchy overflow-hidden flex flex-col"
          style={{ borderRadius: WOBBLY[0], minHeight: 420 }}
        >
          {/* Message list */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 max-h-[480px]">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-forest text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                    🐾
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-forest text-white"
                      : "bg-paper-alt border-2 border-pencil/20"
                  }`}
                  style={{ borderRadius: WOBBLY[i % WOBBLY.length] }}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-forest text-white flex items-center justify-center text-sm flex-shrink-0">
                  🐾
                </div>
                <div
                  className="px-4 py-3 bg-paper-alt border-2 border-pencil/20 text-sm"
                  style={{ borderRadius: WOBBLY[1] }}
                >
                  <span className="inline-flex gap-1 items-center opacity-60">
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:300ms]" />
                  </span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          <div className="border-t-2 border-pencil/10 p-4 bg-white flex gap-3 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tell me about your lifestyle… (Enter to send)"
              rows={1}
              disabled={loading || matches !== null}
              className="flex-1 px-3 py-2.5 border-2 border-pencil/20 bg-paper text-sm font-body outline-none focus:border-forest resize-none rounded-xl disabled:opacity-50 leading-relaxed"
              style={{ maxHeight: 120, overflowY: "auto" }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading || matches !== null}
              className="btn-sketchy btn-primary text-sm px-4 py-2.5 flex-shrink-0 disabled:opacity-40"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-red-600 text-sm text-center">{error}</p>
      )}

      {/* Match results */}
      {matches !== null && (
        <div>
          <div
            className="card-sketchy p-6 mb-5 text-center"
            style={{ borderRadius: WOBBLY[1] }}
          >
            <span className="text-4xl block mb-2">🎉</span>
            <h2 className="font-heading text-2xl font-bold mb-1">Your top matches!</h2>
            <p className="opacity-60 text-sm">
              {quizMode ? "Based on your quiz answers" : "Based on our conversation"} — sorted by compatibility
            </p>
          </div>

          {matches.length === 0 ? (
            <div className="card-sketchy p-8 text-center" style={{ borderRadius: WOBBLY[2] }}>
              <span className="text-5xl block mb-3">😔</span>
              <p className="font-heading text-xl font-bold mb-2">No matches found right now</p>
              <p className="opacity-60 mb-4">Try broadening your preferences or browse all available dogs.</p>
              <div className="flex gap-3 justify-center flex-wrap">
                <button onClick={restart} className="btn-sketchy btn-primary text-base px-6 py-2">
                  Start Over
                </button>
                <Link href="/dogs" className="btn-sketchy text-base px-5 py-2">
                  Browse All
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-4">
                {matches.slice(0, 5).map((match, i) => (
                  <Link
                    key={match.dog.id}
                    href={`/dogs/${match.dog.id}`}
                    className="card-sketchy p-5 flex gap-4 items-start hover:scale-[1.01] transition-transform"
                    style={{ borderRadius: WOBBLY[i % WOBBLY.length] }}
                  >
                    <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-pencil/15 flex-shrink-0 bg-forest-pale flex items-center justify-center">
                      {match.dog.photos?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={match.dog.photos[0]} alt={match.dog.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">🐶</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-heading text-xl font-bold">{match.dog.name}</h3>
                        <span
                          className="text-xs font-bold px-2 py-0.5 border-2 border-pencil bg-forest text-white"
                          style={{ borderRadius: WOBBLY[0] }}
                        >
                          {match.score}% match
                        </span>
                      </div>
                      <p className="text-sm opacity-60 mb-2">
                        {match.dog.breed_primary ?? "Mixed"} · {match.dog.size} ·{" "}
                        {match.dog.shelter?.city ?? ""}
                      </p>
                      <ul className="flex flex-wrap gap-1.5">
                        {match.reasons.slice(0, 3).map((r, j) => (
                          <li
                            key={j}
                            className="text-xs px-2 py-0.5 border-2 border-erased bg-paper"
                            style={{ borderRadius: WOBBLY[j % WOBBLY.length] }}
                          >
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="flex gap-3 mt-5 flex-wrap">
                <button onClick={restart} className="btn-sketchy text-base px-5 py-2">
                  Start Over
                </button>
                <Link href="/dogs" className="btn-sketchy btn-primary text-base px-5 py-2">
                  Browse All Dogs
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
