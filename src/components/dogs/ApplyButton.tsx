"use client";

import { useState } from "react";
import Link from "next/link";

interface Props {
  dogId: string;
  dogName: string;
  userId: string | null;
  hasApplied: boolean;
}

const WOBBLY = "255px 15px 225px 15px / 15px 225px 15px 255px";

export function ApplyButton({ dogId, dogName, userId, hasApplied: initialHasApplied }: Props) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(initialHasApplied);
  const [error, setError] = useState<string | null>(null);

  if (!userId) {
    return (
      <Link
        href={`/auth/login?redirect=/dogs/${dogId}`}
        className="btn-sketchy btn-primary text-lg px-8 py-4"
      >
        Log in to Apply
      </Link>
    );
  }

  if (applied) {
    return (
      <div
        className="inline-flex items-center gap-2 px-6 py-3 border-2 border-forest bg-forest/10 font-heading font-bold text-forest"
        style={{ borderRadius: WOBBLY }}
      >
        <span>&#x2705;</span> Application Submitted
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dog_id: dogId, notes }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }

      setApplied(true);
      setOpen(false);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn-sketchy btn-primary text-lg px-8 py-4"
      >
        Apply to Adopt {dogName}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: "rgba(0,0,0,0.4)" }}
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-paper border-3 border-pencil shadow-[8px_8px_0px_0px_#2d2d2d] p-8 relative"
            style={{ borderRadius: WOBBLY }}
          >
            {/* tape */}
            <div
              className="tape tape-sage absolute w-[100px]"
              style={{ top: "-14px", left: "50%", transform: "translateX(-50%) rotate(-1.5deg)" }}
            />

            <h2 className="font-heading text-2xl font-bold mb-1">
              Apply to adopt {dogName} &#x1f436;
            </h2>
            <p className="opacity-60 text-sm mb-6">
              Your application goes directly to the shelter. They&apos;ll
              reach out to schedule a meet-and-greet.
            </p>

            <form onSubmit={handleSubmit}>
              <label className="block font-heading font-bold text-sm mb-1.5">
                Why would {dogName} be a great fit for you?{" "}
                <span className="font-normal opacity-50">(optional)</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={`Tell the shelter a bit about yourself and why you'd love ${dogName}...`}
                rows={4}
                className="w-full px-4 py-3 border-2 border-pencil font-body text-base outline-none bg-white focus:border-forest focus:ring-2 focus:ring-forest/20 wobbly-1 mb-5 resize-none"
              />

              {error && (
                <p className="text-red-600 text-sm mb-4">{error}</p>
              )}

              <div className="flex gap-3 flex-wrap">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-sketchy btn-primary text-lg px-8 py-3 disabled:opacity-50"
                >
                  {loading ? "Submitting..." : "Submit Application &#x1f43e;"}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="btn-sketchy text-base px-5 py-3"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
