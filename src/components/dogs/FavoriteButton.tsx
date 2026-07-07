"use client";

import { useState } from "react";

interface Props {
  dogId: string;
  userId: string | null;
  isFavorited: boolean;
  size?: "sm" | "md";
}

export function FavoriteButton({ dogId, userId, isFavorited: initial, size = "md" }: Props) {
  const [favorited, setFavorited] = useState(initial);
  const [loading, setLoading] = useState(false);

  if (!userId) return null;

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    setLoading(true);

    const prev = favorited;
    setFavorited(!prev);

    try {
      const res = await fetch("/api/favorites", {
        method: prev ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dog_id: dogId }),
      });
      if (!res.ok) setFavorited(prev); // revert on error
    } catch {
      setFavorited(prev);
    } finally {
      setLoading(false);
    }
  }

  const sizeClass = size === "sm"
    ? "text-lg px-2.5 py-1.5"
    : "text-2xl px-3 py-2";

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-label={favorited ? "Remove from favorites" : "Save to favorites"}
      className={`btn-sketchy ${sizeClass} transition-colors leading-none ${
        favorited
          ? "bg-red-50 border-red-400 text-red-500"
          : "bg-paper hover:bg-red-50 hover:border-red-400 hover:text-red-400"
      } disabled:opacity-50`}
    >
      {favorited ? "❤️" : "🤍"}
    </button>
  );
}
