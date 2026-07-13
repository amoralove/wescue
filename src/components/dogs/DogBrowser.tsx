"use client";
import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { DogViewer } from "@/components/dogs/DogViewer";
import { FavoriteButton } from "@/components/dogs/FavoriteButton";
import type { Dog } from "@/types";

type SizeFilter = "small" | "medium" | "large" | "xlarge";
type EnergyFilter = "low" | "moderate" | "high";
type AgeGroup = "puppy" | "young" | "adult" | "senior";

function ageGroup(dog: Dog): AgeGroup {
  const totalMonths = (dog.age_years ?? 0) * 12 + (dog.age_months ?? 0);
  if (totalMonths < 12) return "puppy";
  if (totalMonths < 36) return "young";
  if (totalMonths < 96) return "adult";
  return "senior";
}

function ageLabel(dog: Dog): string {
  if (dog.age_years && dog.age_years > 0)
    return dog.age_years === 1 ? "1 year" : `${dog.age_years} years`;
  if (dog.age_months && dog.age_months > 0)
    return dog.age_months === 1 ? "1 month" : `${dog.age_months} months`;
  return "Age unknown";
}

const SIZE_LABELS: Record<SizeFilter, string> = {
  small: "Small 🐶",
  medium: "Medium 🐕",
  large: "Large 🦮",
  xlarge: "XL 🦴",
};

const ENERGY_LABELS: Record<EnergyFilter, string> = {
  low: "Calm 😴",
  moderate: "Moderate 🚶",
  high: "Active 🏃",
};

const AGE_LABELS: Record<AgeGroup, string> = {
  puppy: "Puppy (< 1 yr)",
  young: "Young (1–3 yrs)",
  adult: "Adult (3–8 yrs)",
  senior: "Senior (8+ yrs)",
};

interface Props {
  dogs: Dog[];
  userId: string | null;
  favoritedIds: Set<string>;
}

export function DogBrowser({ dogs, userId, favoritedIds: initialFavIds }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [sizes, setSizes] = useState<Set<SizeFilter>>(new Set());
  const [energies, setEnergies] = useState<Set<EnergyFilter>>(new Set());
  const [ages, setAges] = useState<Set<AgeGroup>>(new Set());
  const [goodWithKids, setGoodWithKids] = useState(false);
  const [goodWithDogs, setGoodWithDogs] = useState(false);
  const [goodWithCats, setGoodWithCats] = useState(false);
  const [index, setIndex] = useState(0);
  const [favIds, setFavIds] = useState(initialFavIds);

  const filterRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!filterOpen) return;
    function onDown(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [filterOpen]);

  function toggle<T>(set: Set<T>, val: T): Set<T> {
    const next = new Set(set);
    next.has(val) ? next.delete(val) : next.add(val);
    return next;
  }

  function resetIndex() { setIndex(0); }

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return dogs.filter((d) => {
      if (q) {
        const nameMatch = d.name.toLowerCase().includes(q);
        const breedMatch = (d.breed_primary ?? "").toLowerCase().includes(q);
        if (!nameMatch && !breedMatch) return false;
      }
      if (sizes.size && !sizes.has(d.size as SizeFilter)) return false;
      if (energies.size && !energies.has(d.energy_level as EnergyFilter)) return false;
      if (ages.size && !ages.has(ageGroup(d))) return false;
      if (goodWithKids && !d.good_with_kids) return false;
      if (goodWithDogs && !d.good_with_dogs) return false;
      if (goodWithCats && !d.good_with_cats) return false;
      return true;
    });
  }, [dogs, searchQuery, sizes, energies, ages, goodWithKids, goodWithDogs, goodWithCats]);

  const safeIndex = Math.min(index, Math.max(filtered.length - 1, 0));
  const dog = filtered[safeIndex] ?? null;

  const prev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);
  const next = useCallback(() => setIndex((i) => Math.min(filtered.length - 1, i + 1)), [filtered.length]);

  // Arrow key navigation — placed after filtered is defined
  useEffect(() => {
    const len = filtered.length;
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === "ArrowRight") setIndex((i) => Math.min(len - 1, i + 1));
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(0, i - 1));
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [filtered.length]);

  const filterCount =
    sizes.size + energies.size + ages.size +
    (goodWithKids ? 1 : 0) + (goodWithDogs ? 1 : 0) + (goodWithCats ? 1 : 0);

  function clearFilters() {
    setSizes(new Set());
    setEnergies(new Set());
    setAges(new Set());
    setGoodWithKids(false);
    setGoodWithDogs(false);
    setGoodWithCats(false);
    setSearchQuery("");
    setIndex(0);
  }

  return (
    <div className="max-w-2xl mx-auto px-4">

      {/* ── Search + Filter bar ── */}
      <div className="flex gap-3 mb-5">
        {/* Search input */}
        <div className="flex-1 relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm opacity-40 pointer-events-none">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); resetIndex(); }}
            placeholder="Search by name or breed…"
            className="w-full pl-9 pr-8 py-2.5 border-2 border-pencil rounded-full text-sm bg-paper focus:outline-none focus:border-forest transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(""); resetIndex(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-erased hover:text-pencil text-lg leading-none"
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        {/* Filters dropdown */}
        <div className="relative shrink-0" ref={filterRef}>
          <button
            onClick={() => setFilterOpen((o) => !o)}
            className={`btn-sketchy px-4 py-2.5 text-sm font-bold flex items-center gap-2 whitespace-nowrap ${
              filterCount > 0 ? "border-forest text-forest" : ""
            }`}
          >
            Filters
            {filterCount > 0 && (
              <span className="bg-forest text-white text-xs px-1.5 py-0.5 rounded-full leading-none">
                {filterCount}
              </span>
            )}
          </button>

          {filterOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 card-sketchy p-4 z-20 shadow-hard-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="font-heading font-bold text-sm">Filters</span>
                {filterCount > 0 && (
                  <button onClick={() => { clearFilters(); setFilterOpen(false); }}
                    className="text-xs text-forest font-bold hover:underline">
                    Clear all
                  </button>
                )}
              </div>

              {/* Size */}
              <div className="mb-3">
                <p className="text-xs font-bold uppercase tracking-wider opacity-50 mb-1.5">Size</p>
                {(Object.keys(SIZE_LABELS) as SizeFilter[]).map((s) => (
                  <label key={s} className="flex items-center gap-2 py-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sizes.has(s)}
                      onChange={() => { setSizes(toggle(sizes, s)); resetIndex(); }}
                      className="accent-green-700 w-3.5 h-3.5"
                    />
                    <span className="text-sm">{SIZE_LABELS[s]}</span>
                  </label>
                ))}
              </div>

              {/* Energy */}
              <div className="mb-3">
                <p className="text-xs font-bold uppercase tracking-wider opacity-50 mb-1.5">Energy</p>
                {(Object.keys(ENERGY_LABELS) as EnergyFilter[]).map((e) => (
                  <label key={e} className="flex items-center gap-2 py-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={energies.has(e)}
                      onChange={() => { setEnergies(toggle(energies, e)); resetIndex(); }}
                      className="accent-green-700 w-3.5 h-3.5"
                    />
                    <span className="text-sm">{ENERGY_LABELS[e]}</span>
                  </label>
                ))}
              </div>

              {/* Age */}
              <div className="mb-3">
                <p className="text-xs font-bold uppercase tracking-wider opacity-50 mb-1.5">Age</p>
                {(Object.keys(AGE_LABELS) as AgeGroup[]).map((a) => (
                  <label key={a} className="flex items-center gap-2 py-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ages.has(a)}
                      onChange={() => { setAges(toggle(ages, a)); resetIndex(); }}
                      className="accent-green-700 w-3.5 h-3.5"
                    />
                    <span className="text-sm">{AGE_LABELS[a]}</span>
                  </label>
                ))}
              </div>

              {/* Good With */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider opacity-50 mb-1.5">Good With</p>
                {([
                  ["Kids 👶", goodWithKids, setGoodWithKids],
                  ["Dogs 🐕", goodWithDogs, setGoodWithDogs],
                  ["Cats 🐱", goodWithCats, setGoodWithCats],
                ] as [string, boolean, (v: boolean) => void][]).map(([label, val, setter]) => (
                  <label key={label as string} className="flex items-center gap-2 py-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={val as boolean}
                      onChange={() => { (setter as (v: boolean) => void)(!val); resetIndex(); }}
                      className="accent-green-700 w-3.5 h-3.5"
                    />
                    <span className="text-sm">{label as string}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Result count ── */}
      <p className="text-sm opacity-50 mb-4 font-heading">
        {filtered.length === 0
          ? "No dogs match — try adjusting your filters"
          : `${filtered.length} dog${filtered.length === 1 ? "" : "s"} available`}
        {(filterCount > 0 || searchQuery) && dogs.length !== filtered.length
          ? ` (of ${dogs.length})`
          : ""}
      </p>

      {/* ── Carousel ── */}
      {filtered.length === 0 ? (
        <div className="card-sketchy p-12 text-center">
          <span className="text-5xl block mb-4">🔍</span>
          <p className="font-heading font-bold text-xl mb-2">No matches</p>
          <p className="opacity-60 mb-4">Try removing a filter or changing your search.</p>
          <button onClick={clearFilters} className="btn-sketchy btn-primary px-6 py-2">
            Clear All
          </button>
        </div>
      ) : dog ? (
        <div className="card-sketchy overflow-hidden">

          {/* Photo or 3D viewer */}
          <div className="relative">
            {dog.photos?.[0] ? (
              <div className="w-full overflow-hidden" style={{ height: "300px" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={dog.photos[0]}
                  alt={dog.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="bg-gradient-to-b from-sky-100 to-green-100 dark:from-sky-950 dark:to-green-950">
                <DogViewer
                  key={dog.id}
                  breed={dog.breed_primary}
                  size={dog.size}
                  className="w-full"
                  style={{ height: "300px" }}
                />
              </div>
            )}

            {/* Favorite button overlay */}
            {userId && (
              <div className="absolute top-3 right-3">
                <FavoriteButton
                  dogId={dog.id}
                  userId={userId}
                  isFavorited={favIds.has(dog.id)}
                  size="md"
                  onToggle={(id, fav) =>
                    setFavIds((prev) => {
                      const next = new Set(prev);
                      fav ? next.add(id) : next.delete(id);
                      return next;
                    })
                  }
                />
              </div>
            )}

            {/* Prev / Next arrows overlaid on photo */}
            <button
              onClick={prev}
              disabled={safeIndex === 0}
              aria-label="Previous dog"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-paper/90 border-2 border-pencil flex items-center justify-center font-bold text-lg shadow-hard disabled:opacity-20 disabled:cursor-not-allowed hover:bg-paper transition-colors"
            >
              ←
            </button>
            <button
              onClick={next}
              disabled={safeIndex === filtered.length - 1}
              aria-label="Next dog"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-paper/90 border-2 border-pencil flex items-center justify-center font-bold text-lg shadow-hard disabled:opacity-20 disabled:cursor-not-allowed hover:bg-paper transition-colors"
            >
              →
            </button>

            {/* Dot indicator */}
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
              {filtered.slice(0, 10).map((d, i) => (
                <button
                  key={d.id}
                  onClick={() => setIndex(i)}
                  className={`rounded-full transition-all ${
                    i === safeIndex
                      ? "bg-white w-4 h-2.5"
                      : "bg-white/50 w-2.5 h-2.5 hover:bg-white/80"
                  }`}
                  aria-label={`Go to ${d.name}`}
                />
              ))}
              {filtered.length > 10 && (
                <span className="text-white/60 text-xs self-center">+{filtered.length - 10}</span>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="p-6">
            <div className="flex items-start justify-between gap-3 mb-1">
              <h2 className="font-heading text-3xl font-bold">{dog.name}</h2>
              <span className="text-xs font-bold uppercase tracking-wider opacity-40 mt-2 shrink-0">
                {safeIndex + 1} / {filtered.length}
              </span>
            </div>
            <p className="opacity-60 mb-1">
              {dog.breed_primary ?? "Mixed breed"} · {ageLabel(dog)} · {dog.size}
            </p>
            {dog.shelter && (
              <p className="text-sm opacity-50 mb-3">
                📍 {dog.shelter.name}{dog.shelter.city ? `, ${dog.shelter.city}` : ""}
              </p>
            )}

            {/* Compatibility badges */}
            <div className="flex gap-2 flex-wrap mb-4">
              {dog.good_with_kids && (
                <span className="text-xs bg-sage/20 text-pencil px-2 py-1 rounded-full">Good with kids</span>
              )}
              {dog.good_with_dogs && (
                <span className="text-xs bg-sage/20 text-pencil px-2 py-1 rounded-full">Good with dogs</span>
              )}
              {dog.good_with_cats && (
                <span className="text-xs bg-sage/20 text-pencil px-2 py-1 rounded-full">Good with cats</span>
              )}
              {dog.house_trained && (
                <span className="text-xs bg-sage/20 text-pencil px-2 py-1 rounded-full">House trained</span>
              )}
              <span className={`text-xs px-2 py-1 rounded-full ${
                dog.energy_level === "high"
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                  : dog.energy_level === "low"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
              }`}>
                {dog.energy_level === "high" ? "High energy 🏃" : dog.energy_level === "low" ? "Calm 😴" : "Moderate 🚶"}
              </span>
            </div>

            {dog.personality && (
              <p className="opacity-70 text-sm leading-relaxed mb-5 italic">
                &ldquo;{dog.personality}&rdquo;
              </p>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 flex-wrap">
              <Link href={`/dogs/${dog.id}`} className="btn-sketchy btn-primary flex-1 text-center py-2.5">
                Meet {dog.name}
              </Link>
              <Link href={`/dogs/${dog.id}`} className="btn-sketchy flex-1 text-center py-2.5">
                Apply to Adopt
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
