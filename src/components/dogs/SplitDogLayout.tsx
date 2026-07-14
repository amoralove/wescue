"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export interface ParkDog {
  id: string;
  name: string;
  breed: string;
  age: string;
  emoji: string;
  shelter: string;
  shelterCity: string | null;
  shelterState: string | null;
  bio: string;
  url: string;
  photo: string | null;
  size: string;
  energy: string | null;
  goodWithKids: boolean | null;
  goodWithDogs: boolean | null;
  goodWithCats: boolean | null;
  houseTrained: boolean | null;
  feeCents: number | null;
}

type SizeFilter = "small" | "medium" | "large" | "xlarge";
type EnergyFilter = "low" | "moderate" | "high";

const SIZE_OPTIONS: [SizeFilter, string][] = [
  ["small", "Small 🐶"],
  ["medium", "Medium 🐕"],
  ["large", "Large 🦮"],
  ["xlarge", "XL 🦴"],
];
const ENERGY_OPTIONS: [EnergyFilter, string][] = [
  ["low", "Calm 😴"],
  ["moderate", "Moderate 🚶"],
  ["high", "Active 🏃"],
];
const GOODWITH_OPTIONS: [string, string][] = [
  ["kids", "Kids 👶"],
  ["dogs", "Other Dogs 🐕"],
  ["cats", "Cats 🐱"],
];

function toggle<T>(set: Set<T>, val: T): Set<T> {
  const next = new Set(set);
  next.has(val) ? next.delete(val) : next.add(val);
  return next;
}

export function SplitDogLayout({ dogs }: { dogs: ParkDog[] }) {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [sizes, setSizes] = useState<Set<SizeFilter>>(new Set());
  const [energies, setEnergies] = useState<Set<EnergyFilter>>(new Set());
  const [goodWith, setGoodWith] = useState<Set<string>>(new Set());
  const [filterOpen, setFilterOpen] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return dogs.filter((d) => {
      if (q && !d.name.toLowerCase().includes(q) && !d.breed.toLowerCase().includes(q)) return false;
      if (sizes.size && !sizes.has(d.size as SizeFilter)) return false;
      if (energies.size && !energies.has(d.energy as EnergyFilter)) return false;
      if (goodWith.has("kids") && d.goodWithKids === false) return false;
      if (goodWith.has("dogs") && d.goodWithDogs === false) return false;
      if (goodWith.has("cats") && d.goodWithCats === false) return false;
      return true;
    });
  }, [dogs, query, sizes, energies, goodWith]);

  // Push filter state into the park iframe whenever filters change
  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: "parkFilter", query, sizes: [...sizes], energies: [...energies], goodWith: [...goodWith] },
      "*"
    );
  }, [query, sizes, energies, goodWith]);

  // Navigate to full profile when a dog is clicked in the 3D park
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.data?.type !== "parkDogClicked") return;
      const dog = e.data.dog as ParkDog;
      if (dog?.url) router.push(dog.url);
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [router]);

  // Close filter panel on outside click
  useEffect(() => {
    if (!filterOpen) return;
    function onDown(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [filterOpen]);

  function clearFilters() {
    setQuery(""); setSizes(new Set()); setEnergies(new Set()); setGoodWith(new Set());
  }

  const filterCount = sizes.size + energies.size + goodWith.size;
  const hasFilter = filterCount > 0 || query.trim() !== "";

  return (
    <div
      className="fixed flex flex-col md:flex-row overflow-hidden"
      style={{ top: 72, left: 0, right: 0, bottom: 0 }}
    >
      {/* ── Left sidebar ── */}
      <aside className="flex flex-col flex-1 md:flex-none md:w-[340px] min-h-0 bg-paper border-b-[3px] md:border-b-0 md:border-r-[3px] border-pencil overflow-hidden">

        {/* Search + filter header */}
        <div className="p-3 border-b-[2px] border-pencil/20 flex-shrink-0 space-y-2">
          <div className="flex gap-2">
            <div className="flex-1 relative flex items-center">
              <span className="absolute left-3 text-sm pointer-events-none opacity-40">🔍</span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Name or breed…"
                className="w-full pl-8 pr-3 py-2 rounded-full border-2 border-pencil/30 bg-white text-sm focus:outline-none focus:border-pencil transition-colors"
              />
            </div>

            <div ref={filterRef} className="relative shrink-0">
              <button
                onClick={() => setFilterOpen((o) => !o)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border-2 text-sm font-bold transition-colors bg-white ${
                  filterCount > 0 ? "border-forest text-forest" : "border-pencil/30 text-pencil"
                }`}
              >
                Filters
                {filterCount > 0 && (
                  <span className="bg-forest text-white text-xs px-1.5 py-px rounded-full leading-none">
                    {filterCount}
                  </span>
                )}
              </button>

              {filterOpen && (
                <div className="absolute right-0 top-full mt-1.5 bg-paper border-2 border-pencil rounded-2xl p-4 w-52 shadow-hard z-40">
                  <div className="flex items-center justify-between mb-3">
                    <strong className="text-sm font-heading">Filters</strong>
                    {hasFilter && (
                      <button
                        onClick={() => { clearFilters(); setFilterOpen(false); }}
                        className="text-xs text-forest font-bold hover:underline"
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  <p className="text-[0.62rem] font-bold uppercase tracking-wider opacity-40 mb-1">Size</p>
                  {SIZE_OPTIONS.map(([v, l]) => (
                    <label key={v} className="flex items-center gap-2 py-0.5 text-sm cursor-pointer">
                      <input type="checkbox" checked={sizes.has(v)} onChange={() => setSizes(toggle(sizes, v))} className="accent-forest w-3.5 h-3.5" />
                      {l}
                    </label>
                  ))}

                  <p className="text-[0.62rem] font-bold uppercase tracking-wider opacity-40 mt-3 mb-1">Energy</p>
                  {ENERGY_OPTIONS.map(([v, l]) => (
                    <label key={v} className="flex items-center gap-2 py-0.5 text-sm cursor-pointer">
                      <input type="checkbox" checked={energies.has(v)} onChange={() => setEnergies(toggle(energies, v))} className="accent-forest w-3.5 h-3.5" />
                      {l}
                    </label>
                  ))}

                  <p className="text-[0.62rem] font-bold uppercase tracking-wider opacity-40 mt-3 mb-1">Good With</p>
                  {GOODWITH_OPTIONS.map(([v, l]) => (
                    <label key={v} className="flex items-center gap-2 py-0.5 text-sm cursor-pointer">
                      <input type="checkbox" checked={goodWith.has(v)} onChange={() => setGoodWith(toggle(goodWith, v))} className="accent-forest w-3.5 h-3.5" />
                      {l}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          <p className="text-xs text-pencil/50">
            <span className="font-bold text-forest">{filtered.length}</span>{" "}
            dog{filtered.length !== 1 ? "s" : ""} available
            {hasFilter && dogs.length !== filtered.length ? ` of ${dogs.length}` : ""}
          </p>
        </div>

        {/* Scrollable dog list */}
        <div className="flex-1 overflow-y-auto min-h-0 overscroll-contain">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-pencil/50">
              <span className="text-4xl mb-3">🔍</span>
              <p className="font-heading font-bold mb-1">No matches</p>
              <p className="text-sm mb-4">Try adjusting your filters.</p>
              <button onClick={clearFilters} className="btn-sketchy btn-primary !text-sm !px-5 !py-2">
                Clear filters
              </button>
            </div>
          ) : (
            filtered.map((dog) => (
              <button
                key={dog.id}
                onClick={() => router.push(dog.url)}
                className="flex items-center gap-3 w-full px-3 py-2.5 border-b border-pencil/10 hover:bg-paper-alt transition-colors text-left"
              >
                <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-pencil/15 flex-shrink-0 bg-forest-pale flex items-center justify-center">
                  {dog.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={dog.photo} alt={dog.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">{dog.emoji}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-pencil leading-tight">{dog.name}</p>
                  <p className="text-xs text-pencil/50 truncate mt-0.5">{dog.breed} · {dog.age}</p>
                  {dog.feeCents ? (
                    <p className="text-xs font-bold text-forest mt-0.5">${Math.round(dog.feeCents / 100)}</p>
                  ) : null}
                </div>

                <span className="text-pencil/25 text-xl flex-shrink-0">›</span>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* ── Right panel: 3D park ── */}
      <div className="hidden md:block flex-1 min-h-0 relative overflow-hidden">
        <iframe
          ref={iframeRef}
          src="/park/index.html"
          className="w-full h-full border-0 block"
          title="Wescue Dog Park"
        />
      </div>
    </div>
  );
}
