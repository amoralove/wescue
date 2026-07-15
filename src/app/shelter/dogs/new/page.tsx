"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const WOBBLY = "255px 15px 225px 15px / 15px 225px 15px 255px";

export default function NewDogPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "", breed_primary: "", breed_secondary: "", age_years: "", age_months: "",
    size: "medium", sex: "female", energy_level: "moderate",
    good_with_kids: "", good_with_dogs: "", good_with_cats: "",
    house_trained: "", personality: "", medical_notes: "", special_needs: "",
    adoption_fee_cents: "", photos: "",
  });

  function set(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function parseBool(v: string): boolean | null {
    if (v === "true") return true;
    if (v === "false") return false;
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload = {
      name: form.name,
      breed_primary: form.breed_primary || null,
      breed_secondary: form.breed_secondary || null,
      age_years: form.age_years ? parseInt(form.age_years) : null,
      age_months: form.age_months ? parseInt(form.age_months) : null,
      size: form.size,
      sex: form.sex,
      energy_level: form.energy_level,
      good_with_kids: parseBool(form.good_with_kids),
      good_with_dogs: parseBool(form.good_with_dogs),
      good_with_cats: parseBool(form.good_with_cats),
      house_trained: parseBool(form.house_trained),
      personality: form.personality || null,
      medical_notes: form.medical_notes || null,
      special_needs: form.special_needs || null,
      adoption_fee_cents: form.adoption_fee_cents ? Math.round(parseFloat(form.adoption_fee_cents) * 100) : null,
      photos: form.photos ? form.photos.split("\n").map((s) => s.trim()).filter(Boolean) : [],
    };

    const res = await fetch("/api/shelter/dogs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Failed to add dog"); setLoading(false); return; }

    router.push("/shelter/dogs");
  }

  const labelClass = "block font-heading font-bold text-sm mb-1.5";
  const inputClass = "w-full px-4 py-3 border-2 border-pencil font-body text-base outline-none bg-white focus:border-forest wobbly-1";
  const selectClass = "w-full px-4 py-3 border-2 border-pencil font-body text-base outline-none bg-white focus:border-forest";

  return (
    <div className="min-h-screen bg-paper">
      <nav className="border-b-[3px] border-pencil bg-paper px-6 py-4 flex items-center gap-4">
        <Link href="/shelter/dogs" className="font-heading font-bold text-forest hover:underline">← Dogs</Link>
        <span className="opacity-30">/</span>
        <span className="font-heading font-bold">Add Dog</span>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="font-heading text-3xl font-bold mb-8">Add a Dog</h1>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border-2 border-red-300 text-red-700 text-sm rounded-xl">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic info */}
          <div className="card-sketchy p-5" style={{ borderRadius: WOBBLY }}>
            <h2 className="font-heading font-bold text-lg mb-4">Basic Info</h2>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Name *</label>
                <input value={form.name} onChange={(e) => set("name", e.target.value)} required className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Primary breed</label>
                  <input value={form.breed_primary} onChange={(e) => set("breed_primary", e.target.value)} className={inputClass} placeholder="Labrador Mix" />
                </div>
                <div>
                  <label className={labelClass}>Secondary breed</label>
                  <input value={form.breed_secondary} onChange={(e) => set("breed_secondary", e.target.value)} className={inputClass} placeholder="Optional" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Sex *</label>
                  <select value={form.sex} onChange={(e) => set("sex", e.target.value)} className={selectClass}>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Size *</label>
                  <select value={form.size} onChange={(e) => set("size", e.target.value)} className={selectClass}>
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                    <option value="xlarge">XL</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={labelClass}>Age (years)</label>
                  <input type="number" min="0" max="25" value={form.age_years} onChange={(e) => set("age_years", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Age (months)</label>
                  <input type="number" min="0" max="11" value={form.age_months} onChange={(e) => set("age_months", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Adoption fee ($)</label>
                  <input type="number" min="0" step="5" value={form.adoption_fee_cents} onChange={(e) => set("adoption_fee_cents", e.target.value)} placeholder="150" className={inputClass} />
                </div>
              </div>
            </div>
          </div>

          {/* Personality & energy */}
          <div className="card-sketchy p-5" style={{ borderRadius: "15px 255px 15px 225px / 225px 15px 255px 15px" }}>
            <h2 className="font-heading font-bold text-lg mb-4">Personality</h2>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Energy level *</label>
                <select value={form.energy_level} onChange={(e) => set("energy_level", e.target.value)} className={selectClass}>
                  <option value="low">Low / Calm</option>
                  <option value="moderate">Moderate</option>
                  <option value="high">High / Active</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>About this dog</label>
                <textarea value={form.personality} onChange={(e) => set("personality", e.target.value)} rows={4}
                  placeholder="Tell potential adopters what makes this dog special…"
                  className="w-full px-4 py-3 border-2 border-pencil font-body text-base outline-none bg-white focus:border-forest wobbly-1 resize-none" />
              </div>
            </div>
          </div>

          {/* Compatibility */}
          <div className="card-sketchy p-5" style={{ borderRadius: "30px 255px 20px 255px / 255px 30px 255px 20px" }}>
            <h2 className="font-heading font-bold text-lg mb-4">Compatibility</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: "good_with_kids", label: "Good with kids" },
                { key: "good_with_dogs", label: "Good with dogs" },
                { key: "good_with_cats", label: "Good with cats" },
                { key: "house_trained", label: "House trained" },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className={labelClass}>{label}</label>
                  <select value={form[key as keyof typeof form]} onChange={(e) => set(key, e.target.value)} className={selectClass}>
                    <option value="">Unknown</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Medical */}
          <div className="card-sketchy p-5" style={{ borderRadius: WOBBLY }}>
            <h2 className="font-heading font-bold text-lg mb-4">Medical & Special Needs</h2>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Medical notes</label>
                <textarea value={form.medical_notes} onChange={(e) => set("medical_notes", e.target.value)} rows={2}
                  placeholder="Vaccines, spayed/neutered, heartworm, medications…"
                  className="w-full px-4 py-3 border-2 border-pencil font-body text-base outline-none bg-white focus:border-forest wobbly-2 resize-none" />
              </div>
              <div>
                <label className={labelClass}>Special needs</label>
                <textarea value={form.special_needs} onChange={(e) => set("special_needs", e.target.value)} rows={2}
                  placeholder="Dietary restrictions, mobility issues, behavioral notes…"
                  className="w-full px-4 py-3 border-2 border-pencil font-body text-base outline-none bg-white focus:border-forest wobbly-1 resize-none" />
              </div>
            </div>
          </div>

          {/* Photos */}
          <div className="card-sketchy p-5" style={{ borderRadius: "15px 255px 15px 225px / 225px 15px 255px 15px" }}>
            <h2 className="font-heading font-bold text-lg mb-1">Photo URLs</h2>
            <p className="text-sm opacity-60 mb-4">One URL per line. The first photo is the main image.</p>
            <textarea value={form.photos} onChange={(e) => set("photos", e.target.value)} rows={3}
              placeholder={"https://example.com/dog1.jpg\nhttps://example.com/dog2.jpg"}
              className="w-full px-4 py-3 border-2 border-pencil font-body text-sm outline-none bg-white focus:border-forest wobbly-1 resize-none font-mono" />
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="btn-sketchy btn-primary text-lg px-8 py-3 disabled:opacity-50">
              {loading ? "Adding…" : "Add Dog 🐾"}
            </button>
            <Link href="/shelter/dogs" className="btn-sketchy text-base px-5 py-3">Cancel</Link>
          </div>
        </form>
      </main>
    </div>
  );
}
