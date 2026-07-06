"use client";

import { useState } from "react";
import Link from "next/link";
import type { MatchResult, AdopterPreferences } from "@/types";

interface Step {
  id: keyof AdopterPreferences | "notes";
  question: string;
  emoji: string;
  multi?: boolean;
  options: { label: string; emoji: string; value: unknown }[];
}

const STEPS: Step[] = [
  {
    id: "living_situation",
    question: "Where do you live?",
    emoji: "🏠",
    options: [
      { label: "House with yard", emoji: "🏡", value: "house_with_yard" },
      { label: "House, no yard", emoji: "🏠", value: "house_no_yard" },
      { label: "Apartment", emoji: "🏢", value: "apartment" },
    ],
  },
  {
    id: "has_kids",
    question: "Any kids at home?",
    emoji: "👨‍👩‍👧",
    options: [
      { label: "Yes, kids at home", emoji: "👶", value: true },
      { label: "No kids", emoji: "🧑", value: false },
    ],
  },
  {
    id: "has_dogs",
    question: "Do you have other dogs?",
    emoji: "🐕",
    options: [
      { label: "Yes, I have dogs", emoji: "🐕", value: true },
      { label: "No other dogs", emoji: "✌️", value: false },
    ],
  },
  {
    id: "has_cats",
    question: "Any cats in the home?",
    emoji: "🐱",
    options: [
      { label: "Yes, I have cats", emoji: "🐱", value: true },
      { label: "No cats", emoji: "✌️", value: false },
    ],
  },
  {
    id: "activity_level",
    question: "How active is your lifestyle?",
    emoji: "🏃",
    options: [
      { label: "Very active", emoji: "🏃", value: "very active" },
      { label: "Moderate", emoji: "🚶", value: "moderate" },
      { label: "Relaxed", emoji: "🛋️", value: "relaxed" },
    ],
  },
  {
    id: "size_preference",
    question: "What size dog do you prefer?",
    emoji: "📏",
    options: [
      { label: "Small", emoji: "🐩", value: "small" },
      { label: "Medium", emoji: "🐕", value: "medium" },
      { label: "Large", emoji: "🐕‍🦺", value: "large" },
      { label: "No preference", emoji: "💛", value: null },
    ],
  },
  {
    id: "age_preference",
    question: "Any preference on age?",
    emoji: "🐾",
    options: [
      { label: "Puppy", emoji: "🐶", value: "puppy" },
      { label: "Young adult", emoji: "⚡", value: "young adult" },
      { label: "Adult", emoji: "🐕", value: "adult" },
      { label: "Senior", emoji: "🤍", value: "senior" },
      { label: "No preference", emoji: "💛", value: null },
    ],
  },
  {
    id: "experience_level",
    question: "How experienced are you with dogs?",
    emoji: "🎓",
    options: [
      { label: "First-time owner", emoji: "🌱", value: "first-time" },
      { label: "Some experience", emoji: "👍", value: "some" },
      { label: "Very experienced", emoji: "🏆", value: "experienced" },
    ],
  },
];

const WOBBLY = [
  "255px 15px 225px 15px / 15px 225px 15px 255px",
  "15px 255px 15px 225px / 225px 15px 255px 15px",
  "30px 255px 20px 255px / 255px 30px 255px 20px",
  "255px 20px 225px 20px / 20px 225px 20px 255px",
];

export function ChatInterface() {
  const [step, setStep] = useState(-1); // -1 = intro
  const [answers, setAnswers] = useState<Partial<AdopterPreferences>>({});
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<MatchResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const progress = step < 0 ? 0 : Math.round(((step + 1) / STEPS.length) * 100);
  const currentStep = STEPS[step];
  const isDone = step >= STEPS.length;

  async function handleAnswer(value: unknown) {
    const updated = { ...answers, [currentStep.id]: value };
    setAnswers(updated);

    if (step + 1 >= STEPS.length) {
      setStep(STEPS.length); // notes step
    } else {
      setStep(step + 1);
    }
  }

  async function handleSubmit() {
    setLoading(true);
    setError(null);

    try {
      const preferences: AdopterPreferences = {
        ...answers,
      };

      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });

      const data = await res.json();
      setMatches(data.matches ?? []);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function restart() {
    setStep(-1);
    setAnswers({});
    setNotes("");
    setMatches(null);
    setError(null);
  }

  // — Matches screen —
  if (matches !== null) {
    return (
      <div className="max-w-2xl mx-auto">
        <div
          className="card-sketchy p-6 mb-6 text-center"
          style={{ borderRadius: WOBBLY[0] }}
        >
          <span className="text-4xl block mb-2">🎉</span>
          <h2 className="font-heading text-2xl font-bold mb-1">
            Your top matches!
          </h2>
          <p className="opacity-60 text-sm">
            Based on your answers — sorted by compatibility
          </p>
        </div>

        {matches.length === 0 ? (
          <div className="card-sketchy p-8 text-center" style={{ borderRadius: WOBBLY[1] }}>
            <span className="text-5xl block mb-3">😔</span>
            <p className="font-heading text-xl font-bold mb-2">No matches found</p>
            <p className="opacity-60 mb-4">Try broadening your preferences.</p>
            <button onClick={restart} className="btn-sketchy btn-primary text-base px-6 py-2">
              Try Again
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {matches.slice(0, 5).map((match, i) => (
              <Link
                key={match.dog.id}
                href={`/dogs/${match.dog.id}`}
                className="card-sketchy p-5 flex gap-4 items-start hover:scale-[1.01] transition-transform"
                style={{ borderRadius: WOBBLY[i % WOBBLY.length] }}
              >
                <div className="text-5xl shrink-0">🐶</div>
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
                    {match.dog.breed_primary ?? "Mixed"} &middot;{" "}
                    {match.dog.size} &middot;{" "}
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

            <div className="flex gap-3 mt-2 flex-wrap">
              <button onClick={restart} className="btn-sketchy text-base px-5 py-2">
                Start Over
              </button>
              <Link href="/dogs" className="btn-sketchy btn-primary text-base px-5 py-2">
                Browse All Dogs
              </Link>
            </div>
          </div>
        )}
      </div>
    );
  }

  // — Intro screen —
  if (step === -1) {
    return (
      <div
        className="max-w-2xl mx-auto card-sketchy p-8 text-center relative"
        style={{ borderRadius: WOBBLY[0] }}
      >
        <div
          className="tape tape-sage absolute w-[110px]"
          style={{ top: "-14px", left: "50%", transform: "translateX(-50%) rotate(-1.5deg)" }}
        />
        <span className="text-6xl block mb-4">🐾</span>
        <h2 className="font-heading text-2xl font-bold mb-3">
          Let&apos;s find your perfect match
        </h2>
        <p className="opacity-70 mb-8 max-w-sm mx-auto">
          Answer 8 quick questions by clicking buttons — no typing needed.
          Takes about 60 seconds.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <button
            className="btn-sketchy btn-primary text-lg px-8 py-3"
            onClick={() => setStep(0)}
          >
            Let&apos;s go!
          </button>
          <Link href="/dogs" className="btn-sketchy text-lg px-8 py-3">
            Browse first
          </Link>
        </div>
      </div>
    );
  }

  // — Notes / submit screen —
  if (isDone) {
    return (
      <div
        className="max-w-2xl mx-auto card-sketchy p-8 relative"
        style={{ borderRadius: WOBBLY[1] }}
      >
        <div
          className="tape tape-warm absolute w-[110px]"
          style={{ top: "-14px", left: "50%", transform: "translateX(-50%) rotate(1.5deg)" }}
        />

        {/* Progress bar */}
        <div className="w-full h-2 bg-erased rounded-full mb-6">
          <div className="h-2 bg-forest rounded-full transition-all duration-500" style={{ width: "100%" }} />
        </div>

        <span className="text-4xl block mb-3">✏️</span>
        <h2 className="font-heading text-2xl font-bold mb-2">
          Almost there!
        </h2>
        <p className="opacity-70 mb-5">
          Anything else we should know? (optional)
        </p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. I travel a lot, I have a small apartment, I want a dog that doesn't shed..."
          rows={4}
          className="w-full px-4 py-3 border-2 border-pencil font-body text-base outline-none bg-white focus:border-forest focus:ring-2 focus:ring-forest/20 wobbly-1 mb-5 resize-none"
        />

        {error && (
          <p className="text-red-600 text-sm mb-4">{error}</p>
        )}

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-sketchy btn-primary text-lg px-8 py-3 disabled:opacity-50"
          >
            {loading ? "Finding matches..." : "Find My Match! 🐾"}
          </button>
          <button
            onClick={() => setStep(STEPS.length - 1)}
            className="btn-sketchy text-base px-5 py-2"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  // — Question step —
  return (
    <div
      className="max-w-2xl mx-auto card-sketchy p-8 relative"
      style={{ borderRadius: WOBBLY[step % WOBBLY.length] }}
    >
      <div
        className="tape absolute w-[110px]"
        style={{ top: "-14px", left: "50%", transform: `translateX(-50%) rotate(${step % 2 === 0 ? "-1.5deg" : "1.5deg"})` }}
      />

      {/* Progress bar */}
      <div className="w-full h-2 bg-erased rounded-full mb-6">
        <div
          className="h-2 bg-forest rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step counter */}
      <p className="text-sm opacity-50 mb-3 font-heading">
        Question {step + 1} of {STEPS.length}
      </p>

      <span className="text-4xl block mb-3">{currentStep.emoji}</span>
      <h2 className="font-heading text-2xl font-bold mb-6">
        {currentStep.question}
      </h2>

      <div className="flex flex-col gap-3">
        {currentStep.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(opt.value)}
            className="btn-sketchy text-left text-lg px-6 py-4 flex items-center gap-3 hover:bg-forest hover:text-white hover:border-forest-dark"
            style={{ borderRadius: WOBBLY[i % WOBBLY.length] }}
          >
            <span className="text-2xl">{opt.emoji}</span>
            {opt.label}
          </button>
        ))}
      </div>

      {step > 0 && (
        <button
          onClick={() => setStep(step - 1)}
          className="mt-5 text-sm opacity-50 hover:opacity-100 bg-transparent border-none cursor-pointer font-body"
        >
          ← Back
        </button>
      )}
    </div>
  );
}
