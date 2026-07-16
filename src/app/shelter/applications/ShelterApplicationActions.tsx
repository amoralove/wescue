"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUS_TRANSITIONS: Record<string, { label: string; next: string; style: string }[]> = {
  submitted: [
    { label: "Start Review", next: "reviewing", style: "btn-sketchy text-sm px-3 py-1.5" },
    { label: "Request Info", next: "more_info", style: "btn-sketchy text-sm px-3 py-1.5" },
    { label: "Decline", next: "declined", style: "btn-sketchy text-sm px-3 py-1.5 text-red-500 border-red-300 hover:border-red-500" },
  ],
  reviewing: [
    { label: "Approve ✓", next: "approved", style: "btn-sketchy btn-primary text-sm px-3 py-1.5" },
    { label: "Request Info", next: "more_info", style: "btn-sketchy text-sm px-3 py-1.5" },
    { label: "Decline", next: "declined", style: "btn-sketchy text-sm px-3 py-1.5 text-red-500 border-red-300 hover:border-red-500" },
  ],
  more_info: [
    { label: "Approve ✓", next: "approved", style: "btn-sketchy btn-primary text-sm px-3 py-1.5" },
    { label: "Decline", next: "declined", style: "btn-sketchy text-sm px-3 py-1.5 text-red-500 border-red-300 hover:border-red-500" },
  ],
};

export function ShelterApplicationActions({
  applicationId,
  currentStatus,
  shelterId,
}: {
  applicationId: string;
  currentStatus: string;
  shelterId: string;
}) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showNote, setShowNote] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);

  const transitions = STATUS_TRANSITIONS[currentStatus] ?? [];

  async function applyStatus(nextStatus: string) {
    setLoading(nextStatus);
    setError(null);

    const res = await fetch("/api/shelter/applications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: applicationId, status: nextStatus, shelter_notes: note || null, shelter_id: shelterId }),
    });

    setLoading(null);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Update failed");
      return;
    }

    setNote("");
    setShowNote(false);
    setPendingStatus(null);
    router.refresh();
  }

  return (
    <div className="space-y-3 mt-2">
      {error && <p className="text-red-500 text-xs">{error}</p>}

      <div className="flex flex-wrap gap-2">
        {transitions.map((t) => (
          <button
            key={t.next}
            onClick={() => {
              setPendingStatus(t.next);
              setShowNote(true);
            }}
            disabled={loading !== null}
            className={t.style}
          >
            {loading === t.next ? "…" : t.label}
          </button>
        ))}
        <button
          onClick={() => setShowNote((s) => !s)}
          className="text-xs opacity-50 hover:opacity-100 underline"
        >
          {showNote ? "Hide note" : "Add note"}
        </button>
      </div>

      {showNote && (
        <div className="flex gap-2 items-end">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional note to send to the adopter…"
            rows={2}
            className="flex-1 px-3 py-2 border-2 border-pencil/30 text-sm font-body outline-none bg-white focus:border-forest resize-none rounded-lg"
          />
          {pendingStatus && (
            <button
              onClick={() => applyStatus(pendingStatus)}
              disabled={loading !== null}
              className="btn-sketchy btn-primary text-sm px-4 py-2 flex-shrink-0"
            >
              {loading ? "…" : "Save"}
            </button>
          )}
        </div>
      )}

      {/* One-click shortcuts when note panel is closed */}
      {!showNote && transitions.map((t) => null) /* buttons already above */}
    </div>
  );
}
