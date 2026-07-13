"use client";
import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { DogViewer } from "@/components/dogs/DogViewer";
import { FavoriteButton } from "@/components/dogs/FavoriteButton";
import type { Dog } from "@/types";

type SizeFilter = "small" | "medium" | "large" | "xlarge";
type EnergyFilter = "low" | "moderate" | "high";
type AgeGroup = "puppy" | "young" | "adult" | "senior";

function ageGroup(dog: Dog): AgeGroup {
  const yrs = dog.age_years ?? 0;
  const mos = dog.age_months ?? 0;
  const totalMonths = yrs * 12 + mos;
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
  puppy: "Puppy",
  young: "Young",
  adult: "Adult",
  senior: "Senior",
};

interface Props {
  dogs: Dog[];
  userId: string | null;
  favoritedIds: Set<string>;
}

export function DogBrowser({ dogs, userId, favoritedIds: initialFavIds }: Props) {
  const [sizes, setSizes] = useState<Set<SizeFilter>>(new Set());
  const [energies, setEnergies] = useState<Set<EnergyFilter>>(new Set());
  const [ages, setAges] = useState<Set<AgeGroup>>(new Set());
  const [goodWithKids, setGoodWithKids] = useState(false);
  const [goodWithDogs, setGoodWithDogs] = useState(false);
  const [goodWithCats, setGoodWithCats] = useState(false);
  const [index, setIndex] = useState(0);
  const [favIds, setFavIds] = useState(initialFavIds);

  function toggle<T>(set: Set<T>, val: T): Set<T> {
    const next = new Set(set);
    next.has(val) ? next.delete(val) : next.add(val);
    return next;
  }

  const filtered = useMemo(() => {
    return dogs.filter((d) => {
      if (sizes.size && !sizes.has(d.size as SizeFilter)) return false;
      if (energies.size && !energies.has(d.energy_level as EnergyFilter)) return false;
      if (ages.size && !ages.has(ageGroup(d))) return false;
      if (goodWithKids && !d.good_with_kids) return false;
      if (goodWithDogs && !d.good_with_dogs) return false;
      if (goodWithCats && !d.good_with_cats) return false;
      return true;
    });
  }, [dogs, sizes, energies, ages, goodWithKids, goodWithDogs, goodWithCats]);

  const safeIndex = Math.min(index, Math.max(filtered.length - 1, 0));
  const dog = filtered[safeIndex] ?? null;

  const prev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);
  const next = useCallback(() => setIndex((i) => Math.min(filtered.length - 1, i + 1)), [filtered.length]);

  function handleFilterChange() {
    setIndex(0);
  }

  const filterCount = sizes.size + energies.size + ages.size +
    (goodWithKids ? 1 : 0) + (goodWithDogs ? 1 : 0) + (goodWithCats ? 1 : 0);

  function clearFilters() {
    setSizes(new Set());
    setEnergies(new Set());
    setAges(new Set());
    setGoodWithKids(false);
    setGoodWithDogs(false);
    setGoodWithCats(false);
    setIndex(0);
  }

  return (
    <div className="max-w-2xl mx-auto px-4">

      {/* ── Filters ── */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <span className="font-heading font-bold text-sm opacity-60 uppercase tracking-wider">Filters</span>
          {filterCount > 0 && (
            <button onClick={clearFilters} className="text-xs text-forest font-bold hover:underline">
              Clear all ({filterCount})
            </button>
          )}
        </div>

        {/* Size */}
        <div className="flex gap-2 flex-wrap mb-2">
          {(Object.keys(SIZE_LABELS) as SizeFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => { setSizes(toggle(sizes, s)); handleFilterChange(); }}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all ${
                sizes.has(s)
                  ? "bg-forest text-white border-forest"
                  : "border-erased hover:border-forest"
              }`}
            >
              {SIZE_LABELS[s]}
            </button>
          ))}
        </div>

        {/* Energy */}
        <div className="flex gap-2 flex-wrap mb-2">
          {(Object.keys(ENERGY_LABELS) as EnergyFilter[]).map((e) => (
            <button
              key={e}
              onClick={() => { setEnergies(toggle(energies, e)); handleFilterChange(); }}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all ${
                energies.has(e)
                  ? "bg-forest text-white border-forest"
                  : "border-erased hover:border-forest"
              }`}
            >
              {ENERGY_LABELS[e]}
            </button>
          ))}
        </div>

        {/* Age */}
        <div className="flex gap-2 flex-wrap mb-2">
          {(Object.keys(AGE_LABELS) as AgeGroup[]).map((a) => (
            <button
              key={a}
              onClick={() => { setAges(toggle(ages, a)); handleFilterChange(); }}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all ${
                ages.has(a)
                  ? "bg-forest text-white border-forest"
                  : "border-erased hover:border-forest"
              }`}
            >
              {AGE_LABELS[a]}
            </button>
          ))}
        </div>

        {/* Good With */}
        <div className="flex gap-2 flex-wrap">
          {([
            ["Kids 👶", goodWithKids, setGoodWithKids],
            ["Dogs 🐕", goodWithDogs, setGoodWithDogs],
            ["Cats 🐱", goodWithCats, setGoodWithCats],
          ] as [string, boolean, (v: boolean) => void][]).map(([label, val, setter]) => (
            <button
              key={label}
              onClick={() => { setter(!val); handleFilterChange(); }}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all ${
                val
                  ? "bg-sage text-pencil border-sage"
                  : "border-erased hover:border-sage"
              }`}
            >
              Good with {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Result count ── */}
      <p className="text-sm opacity-50 mb-4 font-heading">
        {filtered.length === 0
          ? "No dogs match these filters"
          : `${filtered.length} dog${filtered.length === 1 ? "" : "s"} available`}
        {filterCount > 0 && dogs.length !== filtered.length && ` (of ${dogs.length})`}
      </p>

      {/* ── Carousel ── */}
      {filtered.length === 0 ? (
        <div
          className="card-sketchy p-12 text-center"
          style={{ borderRadius: "255px 15px 225px 15px / 15px 225px 15px 255px" }}
        >
          <span className="text-5xl block mb-4">🔍</span>
          <p className="font-heading font-bold text-xl mb-2">No matches</p>
          <p className="opacity-60 mb-4">Try removing a filter or two.</p>
          <button onClick={clearFilters} className="btn-sketchy btn-primary px-6 py-2">
            Clear Filters
          </button>
        </div>
      ) : dog ? (
        <div className="card-sketchy overflow-hidden" style={{ borderRadius: "18px 255px 18px 255px / 255px 18px 255px 18px" }}>

          {/* 3D dog viewer */}
          <div className="relative bg-gradient-to-b from-sky-100 to-green-100 dark:from-sky-950 dark:to-green-950">
            <DogViewer
              key={dog.id}
              breed={dog.breed_primary}
              size={dog.size}
              className="w-full"
              style={{ height: "280px" }}
            />
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
              {dog.good_with_kids && <span className="text-xs bg-sage/20 text-pencil px-2 py-1 rounded-full">Good with kids</span>}
              {dog.good_with_dogs && <span className="text-xs bg-sage/20 text-pencil px-2 py-1 rounded-full">Good with dogs</span>}
              {dog.good_with_cats && <span className="text-xs bg-sage/20 text-pencil px-2 py-1 rounded-full">Good with cats</span>}
              {dog.house_trained && <span className="text-xs bg-sage/20 text-pencil px-2 py-1 rounded-full">House trained</span>}
              <span className={`text-xs px-2 py-1 rounded-full ${
                dog.energy_level === "high" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" :
                dog.energy_level === "low"  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" :
                "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
              }`}>
                {dog.energy_level === "high" ? "High energy 🏃" : dog.energy_level === "low" ? "Calm 😴" : "Moderate 🚶"}
              </span>
            </div>

            {dog.personality && (
              <p className="opacity-70 text-sm leading-relaxed mb-5 italic">&ldquo;{dog.personality}&rdquo;</p>
            )}

            {/* Actions */}
            <div className="flex gap-3 flex-wrap mb-5">
              <Link href={`/dogs/${dog.id}`} className="btn-sketchy btn-primary flex-1 text-center py-2.5">
                Meet {dog.name}
              </Link>
              <Link href={`/dogs/${dog.id}`} className="btn-sketchy flex-1 text-center py-2.5">
                Apply to Adopt
              </Link>
            </div>

            {/* Prev / Next */}
            <div className="flex items-center gap-3">
              <button
                onClick={prev}
                disabled={safeIndex === 0}
                className="btn-sketchy flex-1 py-2 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Previous dog"
              >
                ← Prev
              </button>
              <div className="flex gap-1.5 flex-wrap justify-center">
                {filtered.slice(0, 8).map((d, i) => (
                  <button
                    key={d.id}
                    onClick={() => setIndex(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === safeIndex ? "bg-forest scale-125" : "bg-erased hover:bg-forest/50"
                    }`}
                    aria-label={`Go to ${d.name}`}
                  />
                ))}
                {filtered.length > 8 && (
                  <span className="text-xs opacity-40 ml-1">+{filtered.length - 8}</span>
                )}
              </div>
              <button
                onClick={next}
                disabled={safeIndex === filtered.length - 1}
                className="btn-sketchy flex-1 py-2 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Next dog"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
