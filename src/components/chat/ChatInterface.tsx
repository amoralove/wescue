"use client";

import { useState } from "react";
import Link from "next/link";
import type { MatchResult, AdopterPreferences } from "@/types";

const WOBBLY = [
  "255px 15px 225px 15px / 15px 225px 15px 255px",
  "15px 255px 15px 225px / 225px 15px 255px 15px",
  "30px 255px 20px 255px / 255px 30px 255px 20px",
  "255px 20px 225px 20px / 20px 225px 20px 255px",
];

type Stage = "quiz" | "comment" | "loading" | "results";

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
      { label: "Pretty relaxed 😴", prefs: { activity_level: "relaxed" } },
      { label: "Moderate 🚶", prefs: { activity_level: "moderate" } },
      { label: "Very active 🏃", prefs: { activity_level: "very active" } },
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
    question: "Preferred age?",
    options: [
      { label: "Puppy 🐣", prefs: { age_preference: "puppy" } },
      { label: "Young (1–3 yrs) 🐕", prefs: { age_preference: "young adult" } },
      { label: "Adult (3–8 yrs) 🐶", prefs: { age_preference: "adult" } },
      { label: "Senior (8+ yrs) 🐾", prefs: { age_preference: "senior" } },
      { label: "No preference 🤷", prefs: { age_preference: undefined } },
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
      { label: "None", prefs: { has_dogs: false, has_cats: false } },
    ],
  },
];

const TOTAL_STEPS = QUIZ_STEPS.length + 1; // quiz questions + comment step

export function ChatInterface() {
  const [stage, setStage] = useState<Stage>("quiz");
  const [step, setStep] = useState(0);
  const [prefs, setPrefs] = useState<Partial<AdopterPreferences>>({});
  const [comment, setComment] = useState("");
  const [matches, setMatches] = useState<MatchResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleOption(optPrefs: Partial<AdopterPreferences>) {
    const merged = { ...prefs, ...optPrefs };
    setPrefs(merged);
    if (step + 1 < QUIZ_STEPS.length) {
      setStep(step + 1);
    } else {
      setStage("comment");
    }
  }

  function goBack() {
    if (stage === "comment") {
      setStage("quiz");
      setStep(QUIZ_STEPS.length - 1);
    } else if (step > 0) {
      setStep(step - 1);
    }
  }

  async function handleSubmit() {
    setStage("loading");
    setError(null);
    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      });
      const data = await res.json();
      if (res.ok && data.matches) {
        setMatches(data.matches);
        setStage("results");
      } else {
        setError("Couldn't load matches. Please try again.");
        setStage("comment");
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setStage("comment");
    }
  }

  function restart() {
    setStage("quiz");
    setStep(0);
    setPrefs({});
    setComment("");
    setMatches(null);
    setError(null);
  }

  // Progress bar dots — quiz step index OR comment step (last dot)
  const activeDot = stage === "comment" || stage === "loading" || stage === "results"
    ? TOTAL_STEPS - 1
    : step;

  function ProgressDots() {
    return (
      <div className="flex gap-1.5 mb-6 justify-center">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i < activeDot
                ? "bg-forest w-6"
                : i === activeDot
                ? "bg-forest w-8"
                : "bg-pencil/20 w-4"
            }`}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">

      {/* ── Quiz steps ── */}
      {stage === "quiz" && (
        <div className="card-sketchy p-7" style={{ borderRadius: WOBBLY[0] }}>
          <ProgressDots />

          <p className="font-heading text-xl font-bold text-center mb-6">
            {QUIZ_STEPS[step].question}
          </p>

          <div className="grid grid-cols-2 gap-3">
            {QUIZ_STEPS[step].options.map((opt, idx) => (
              <button
                key={opt.label}
                onClick={() => handleOption(opt.prefs)}
                className={`btn-sketchy py-4 text-sm text-center hover:bg-forest hover:text-white transition-colors ${
                  QUIZ_STEPS[step].options.length % 2 !== 0 &&
                  idx === QUIZ_STEPS[step].options.length - 1
                    ? "col-span-2"
                    : ""
                }`}
                style={{ borderRadius: WOBBLY[1] }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between mt-5">
            {step > 0 ? (
              <button onClick={goBack} className="text-xs opacity-40 hover:opacity-70">
                ← Back
              </button>
            ) : (
              <span />
            )}
            <p className="text-xs opacity-40">
              {step + 1} of {TOTAL_STEPS}
            </p>
          </div>
        </div>
      )}

      {/* ── Comment step ── */}
      {stage === "comment" && (
        <div className="card-sketchy p-7" style={{ borderRadius: WOBBLY[0] }}>
          <ProgressDots />

          <p className="font-heading text-xl font-bold text-center mb-1">
            Anything else? 🐾
          </p>
          <p className="text-sm text-center opacity-60 mb-5">
            Tell us about any special circumstances — allergies, shedding concerns, open to special needs dogs, specific breed interests, etc.
          </p>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="e.g. I'm allergic to heavy shedders, open to bonded pairs, would love a golden retriever mix…"
            rows={4}
            className="w-full px-4 py-3 border-2 border-pencil/20 bg-paper text-sm font-body outline-none focus:border-forest resize-none rounded-2xl mb-4 leading-relaxed"
          />

          {error && <p className="text-red-600 text-sm text-center mb-3">{error}</p>}

          <button
            onClick={handleSubmit}
            className="btn-sketchy btn-primary w-full py-3.5 text-base mb-3"
          >
            Find my matches! 🐾
          </button>

          <div className="flex items-center justify-between">
            <button onClick={goBack} className="text-xs opacity-40 hover:opacity-70">
              ← Back
            </button>
            <p className="text-xs opacity-40">{TOTAL_STEPS} of {TOTAL_STEPS}</p>
          </div>
        </div>
      )}

      {/* ── Loading ── */}
      {stage === "loading" && (
        <div className="card-sketchy p-16 text-center" style={{ borderRadius: WOBBLY[0] }}>
          <div className="flex gap-2 justify-center mb-4">
            <span className="w-2.5 h-2.5 rounded-full bg-forest animate-bounce [animation-delay:0ms]" />
            <span className="w-2.5 h-2.5 rounded-full bg-forest animate-bounce [animation-delay:150ms]" />
            <span className="w-2.5 h-2.5 rounded-full bg-forest animate-bounce [animation-delay:300ms]" />
          </div>
          <p className="font-heading text-xl font-bold opacity-60">Finding your perfect matches…</p>
        </div>
      )}

      {/* ── Results ── */}
      {stage === "results" && matches !== null && (
        <div>
          <div className="card-sketchy p-6 mb-5 text-center" style={{ borderRadius: WOBBLY[1] }}>
            <span className="text-4xl block mb-2">🎉</span>
            <h2 className="font-heading text-2xl font-bold mb-1">Your top matches!</h2>
            <p className="opacity-60 text-sm">Based on your answers — sorted by compatibility</p>
            {comment.trim() && (
              <p className="text-xs mt-2 opacity-50 italic border-t border-pencil/10 pt-2">
                Special note: &ldquo;{comment}&rdquo;
              </p>
            )}
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
