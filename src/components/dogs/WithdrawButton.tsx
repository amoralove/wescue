"use client";

import { useState } from "react";

const WOBBLY = "255px 15px 225px 15px / 15px 225px 15px 255px";

export function WithdrawButton({ applicationId }: { applicationId: string }) {
  const [status, setStatus] = useState<"idle" | "confirm" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleWithdraw() {
    setStatus("loading");
    setError(null);

    const res = await fetch("/api/applications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: applicationId }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
      setStatus("confirm");
      return;
    }

    setStatus("done");
  }

  if (status === "done") {
    return (
      <span className="text-xs font-bold text-gray-400 opacity-60">Application withdrawn</span>
    );
  }

  if (status === "confirm") {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        {error && <span className="text-xs text-red-500">{error}</span>}
        <span className="text-xs opacity-60">Withdraw this application?</span>
        <button
          onClick={handleWithdraw}
          className="text-xs font-bold text-red-500 hover:underline"
        >
          Yes, withdraw
        </button>
        <button
          onClick={() => setStatus("idle")}
          className="text-xs opacity-50 hover:underline"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setStatus("confirm")}
      style={{ borderRadius: WOBBLY }}
      className="text-xs font-bold text-pencil/40 hover:text-red-500 border-2 border-pencil/15 hover:border-red-300 px-3 py-1 transition-colors"
    >
      Withdraw
    </button>
  );
}
