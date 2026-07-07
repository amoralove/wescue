"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const WOBBLY = "255px 15px 225px 15px / 15px 225px 15px 255px";
const WOBBLY2 = "15px 255px 15px 225px / 225px 15px 255px 15px";

interface Reference {
  name: string;
  relationship: string;
  phone: string;
  email: string;
}

interface HomePhoto {
  url: string;
  label: string;
}

interface FormState {
  full_name: string;
  phone: string;
  address: string;
  city: string;
  state_abbr: string;
  zip: string;
  owns_or_rents: string;
  landlord_name: string;
  landlord_phone: string;
  living_situation: string;
  has_fence: boolean;
  dog_sleep: string;
  hours_alone: string;
  background_check_consent: boolean;
  id_photo_url: string;
  home_photos: HomePhoto[];
  references: [Reference, Reference];
}

const HOME_PHOTO_SLOTS = [
  { label: "Outdoor / Yard", hint: "Show us your outdoor space" },
  { label: "Fence", hint: "If you have one — close-up of fencing" },
  { label: "Sleeping Area", hint: "Where will the dog sleep?" },
  { label: "Crate / Feeding Area", hint: "Crate setup or feeding station" },
  { label: "Living Room", hint: "General home environment" },
  { label: "Other", hint: "Anything else relevant" },
];

const EMPTY_REF: Reference = { name: "", relationship: "", phone: "", email: "" };

const DEFAULT_STATE: FormState = {
  full_name: "",
  phone: "",
  address: "",
  city: "",
  state_abbr: "",
  zip: "",
  owns_or_rents: "",
  landlord_name: "",
  landlord_phone: "",
  living_situation: "",
  has_fence: false,
  dog_sleep: "",
  hours_alone: "",
  background_check_consent: false,
  id_photo_url: "",
  home_photos: HOME_PHOTO_SLOTS.map((s) => ({ url: "", label: s.label })),
  references: [{ ...EMPTY_REF }, { ...EMPTY_REF }],
};

function inputClass(extra = "") {
  return `w-full px-4 py-3 border-2 border-pencil font-body text-base outline-none bg-white focus:border-forest focus:ring-2 focus:ring-forest/20 wobbly-1 ${extra}`;
}

function SectionHeader({ emoji, title, subtitle }: { emoji: string; title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-1">
        <span className="text-3xl">{emoji}</span>
        <h2 className="font-heading text-2xl font-bold">{title}</h2>
      </div>
      {subtitle && <p className="opacity-60 text-sm pl-12">{subtitle}</p>}
    </div>
  );
}

export default function ProfilePage() {
  const [form, setForm] = useState<FormState>(DEFAULT_STATE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState(false);
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
  const idFileRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then(({ profile }) => {
        if (profile) {
          setForm((prev) => ({
            ...prev,
            full_name: profile.full_name ?? "",
            phone: profile.phone ?? "",
            address: profile.address ?? "",
            city: profile.city ?? "",
            state_abbr: profile.state_abbr ?? "",
            zip: profile.zip ?? "",
            owns_or_rents: profile.owns_or_rents ?? "",
            landlord_name: profile.landlord_name ?? "",
            landlord_phone: profile.landlord_phone ?? "",
            living_situation: profile.living_situation ?? "",
            has_fence: profile.has_fence ?? false,
            dog_sleep: profile.dog_sleep ?? "",
            hours_alone: profile.hours_alone ?? "",
            background_check_consent: profile.background_check_consent ?? false,
            id_photo_url: profile.id_photo_url ?? "",
            home_photos: profile.home_photos?.length
              ? profile.home_photos
              : HOME_PHOTO_SLOTS.map((s) => ({ url: "", label: s.label })),
            references: profile.personal_references ?? [{ ...EMPTY_REF }, { ...EMPTY_REF }],
          }));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function setRef(idx: 0 | 1, field: keyof Reference, value: string) {
    setForm((prev) => {
      const refs = [...prev.references] as [Reference, Reference];
      refs[idx] = { ...refs[idx], [field]: value };
      return { ...prev, references: refs };
    });
    setSaved(false);
  }

  function setHomePhoto(idx: number, url: string) {
    setForm((prev) => {
      const photos = [...prev.home_photos];
      photos[idx] = { ...photos[idx], url };
      return { ...prev, home_photos: photos };
    });
    setSaved(false);
  }

  async function uploadFile(
    bucket: string,
    path: string,
    file: File
  ): Promise<string> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true });
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return publicUrl;
  }

  async function handleIdUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingId(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const ext = file.name.split(".").pop();
      const url = await uploadFile(
        "profile-uploads",
        `${user.id}/id/license.${ext}`,
        file
      );
      set("id_photo_url", url);
    } catch {
      setError("Failed to upload ID photo. Make sure the storage bucket is set up.");
    } finally {
      setUploadingId(false);
    }
  }

  async function handleHomePhotoUpload(
    idx: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingSlot(idx);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const ext = file.name.split(".").pop();
      const url = await uploadFile(
        "profile-uploads",
        `${user.id}/home/${idx}-${Date.now()}.${ext}`,
        file
      );
      setHomePhoto(idx, url);
    } catch {
      setError("Failed to upload photo. Make sure the storage bucket is set up.");
    } finally {
      setUploadingSlot(null);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: form.full_name,
          phone: form.phone,
          address: form.address,
          city: form.city,
          state_abbr: form.state_abbr,
          zip: form.zip,
          owns_or_rents: form.owns_or_rents,
          landlord_name: form.landlord_name,
          landlord_phone: form.landlord_phone,
          living_situation: form.living_situation,
          has_fence: form.has_fence,
          dog_sleep: form.dog_sleep,
          hours_alone: form.hours_alone,
          background_check_consent: form.background_check_consent,
          id_photo_url: form.id_photo_url,
          home_photos: form.home_photos,
          personal_references: form.references,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Failed to save");
        return;
      }

      setSaved(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-4xl animate-pulse">&#x1f43e;</span>
      </div>
    );
  }

  const completedSections = [
    !!(form.full_name && form.phone),
    !!(form.living_situation && form.hours_alone),
    !!(form.id_photo_url && form.background_check_consent),
    form.home_photos.some((p) => p.url),
    !!(form.references[0].name && form.references[0].phone),
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-paper">
      {/* Top nav bar */}
      <div className="sticky top-0 z-40 bg-paper border-b-2 border-pencil px-6 py-3 flex items-center justify-between gap-4">
        <Link href="/dashboard" className="font-heading text-forest font-bold hover:underline text-sm">
          &#x2190; Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs opacity-50 hidden sm:block">
            {completedSections}/5 sections complete
          </span>
          <button
            form="profile-form"
            type="submit"
            disabled={saving}
            className="btn-sketchy btn-primary text-sm px-5 py-2 disabled:opacity-50"
          >
            {saving ? "Saving..." : saved ? "&#x2705; Saved!" : "Save Profile"}
          </button>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="font-heading text-4xl font-bold mb-2">
            Your Adopter Profile &#x1f464;
          </h1>
          <p className="opacity-60">
            Shelters review this when you apply. A complete profile speeds up
            the adoption process.
          </p>
        </div>

        <form id="profile-form" onSubmit={handleSave} className="space-y-12">

          {/* ── Section 1: Personal Info ── */}
          <section
            className="card-sketchy p-7 relative"
            style={{ borderRadius: WOBBLY }}
          >
            <div className="tape tape-warm absolute w-[100px]" style={{ top: "-14px", left: "50%", transform: "translateX(-50%) rotate(-1.5deg)" }} />
            <SectionHeader emoji="👤" title="Personal Info" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block font-heading font-bold text-sm mb-1.5">Full Legal Name</label>
                <input type="text" value={form.full_name} onChange={(e) => set("full_name", e.target.value)}
                  placeholder="As it appears on your ID" className={inputClass()} />
              </div>
              <div>
                <label className="block font-heading font-bold text-sm mb-1.5">Phone</label>
                <input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)}
                  placeholder="(555) 000-0000" className={inputClass()} />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-heading font-bold text-sm mb-1.5">Street Address</label>
                <input type="text" value={form.address} onChange={(e) => set("address", e.target.value)}
                  placeholder="123 Main St" className={inputClass()} />
              </div>
              <div>
                <label className="block font-heading font-bold text-sm mb-1.5">City</label>
                <input type="text" value={form.city} onChange={(e) => set("city", e.target.value)}
                  placeholder="Portland" className={inputClass()} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-heading font-bold text-sm mb-1.5">State</label>
                  <input type="text" value={form.state_abbr} onChange={(e) => set("state_abbr", e.target.value.toUpperCase())}
                    placeholder="OR" maxLength={2} className={inputClass()} />
                </div>
                <div>
                  <label className="block font-heading font-bold text-sm mb-1.5">ZIP</label>
                  <input type="text" value={form.zip} onChange={(e) => set("zip", e.target.value)}
                    placeholder="97201" maxLength={10} className={inputClass()} />
                </div>
              </div>
            </div>
          </section>

          {/* ── Section 2: Your Home ── */}
          <section
            className="card-sketchy p-7 relative"
            style={{ borderRadius: WOBBLY2 }}
          >
            <div className="tape tape-sage absolute w-[100px]" style={{ top: "-14px", left: "50%", transform: "translateX(-50%) rotate(1.5deg)" }} />
            <SectionHeader emoji="🏠" title="Your Home" subtitle="Shelters use this to assess fit for specific dogs" />

            <div className="space-y-5">
              <div>
                <label className="block font-heading font-bold text-sm mb-2">Do you own or rent?</label>
                <div className="flex gap-3 flex-wrap">
                  {["own", "rent"].map((v) => (
                    <label key={v} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="owns_or_rents" value={v}
                        checked={form.owns_or_rents === v}
                        onChange={() => set("owns_or_rents", v)}
                        className="accent-forest w-4 h-4" />
                      <span className="font-heading font-bold capitalize">{v}</span>
                    </label>
                  ))}
                </div>
              </div>

              {form.owns_or_rents === "rent" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-paper-alt border-2 border-dashed border-pencil wobbly-2">
                  <p className="sm:col-span-2 text-sm opacity-60">Some shelters require landlord approval — we may contact them.</p>
                  <div>
                    <label className="block font-heading font-bold text-sm mb-1.5">Landlord Name</label>
                    <input type="text" value={form.landlord_name} onChange={(e) => set("landlord_name", e.target.value)}
                      placeholder="Jane Smith" className={inputClass()} />
                  </div>
                  <div>
                    <label className="block font-heading font-bold text-sm mb-1.5">Landlord Phone / Email</label>
                    <input type="text" value={form.landlord_phone} onChange={(e) => set("landlord_phone", e.target.value)}
                      placeholder="(555) 000-0000" className={inputClass()} />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-heading font-bold text-sm mb-2">Living situation</label>
                <select value={form.living_situation} onChange={(e) => set("living_situation", e.target.value)} className={inputClass()}>
                  <option value="">Select…</option>
                  <option value="house_with_yard">House with yard</option>
                  <option value="house_no_yard">House, no yard</option>
                  <option value="apartment">Apartment / condo</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <input type="checkbox" id="has_fence" checked={form.has_fence}
                  onChange={(e) => set("has_fence", e.target.checked)}
                  className="accent-forest w-5 h-5" />
                <label htmlFor="has_fence" className="font-heading font-bold text-sm cursor-pointer">
                  We have a fenced yard or outdoor area
                </label>
              </div>

              <div>
                <label className="block font-heading font-bold text-sm mb-2">Where will the dog sleep?</label>
                <select value={form.dog_sleep} onChange={(e) => set("dog_sleep", e.target.value)} className={inputClass()}>
                  <option value="">Select…</option>
                  <option value="crate">In a crate</option>
                  <option value="dog_bed">On a dog bed</option>
                  <option value="our_bed">On the bed with us</option>
                  <option value="sofa">On the sofa</option>
                  <option value="laundry_room">Laundry room / utility area</option>
                </select>
              </div>

              <div>
                <label className="block font-heading font-bold text-sm mb-2">
                  How many hours will the dog be alone on a typical weekday?
                </label>
                <select value={form.hours_alone} onChange={(e) => set("hours_alone", e.target.value)} className={inputClass()}>
                  <option value="">Select…</option>
                  <option value="0-2">0–2 hours (I work from home / am home most days)</option>
                  <option value="2-4">2–4 hours</option>
                  <option value="4-6">4–6 hours</option>
                  <option value="6-8">6–8 hours</option>
                  <option value="8+">8+ hours</option>
                </select>
              </div>
            </div>
          </section>

          {/* ── Section 3: Home Photos ── */}
          <section
            className="card-sketchy p-7 relative"
            style={{ borderRadius: WOBBLY }}
          >
            <div className="tape absolute w-[100px]" style={{ top: "-14px", left: "50%", transform: "translateX(-50%) rotate(-1deg)" }} />
            <SectionHeader
              emoji="📷"
              title="Home Photos"
              subtitle="Help shelters picture where a dog would live. Upload what you have — nothing is required."
            />

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {HOME_PHOTO_SLOTS.map((slot, idx) => {
                const photo = form.home_photos[idx];
                const isUploading = uploadingSlot === idx;

                return (
                  <label
                    key={idx}
                    className="relative cursor-pointer group"
                    title={slot.hint}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => handleHomePhotoUpload(idx, e)}
                      disabled={isUploading}
                    />
                    <div
                      className="aspect-square border-2 border-dashed border-pencil bg-paper-alt flex flex-col items-center justify-center overflow-hidden hover:border-forest transition-colors wobbly-2"
                    >
                      {photo?.url ? (
                        <>
                          <img src={photo.url} alt={slot.label} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-xs font-bold">Change</span>
                          </div>
                        </>
                      ) : isUploading ? (
                        <span className="text-2xl animate-spin">⏳</span>
                      ) : (
                        <>
                          <span className="text-2xl mb-1 opacity-40">📷</span>
                          <span className="text-xs opacity-40 text-center px-1">{slot.label}</span>
                        </>
                      )}
                    </div>
                    <p className="text-xs font-heading font-bold mt-1 text-center opacity-60 truncate">{slot.label}</p>
                  </label>
                );
              })}
            </div>

            <p className="text-xs opacity-40 mt-4">
              Photos are stored securely and only shared with shelters you apply to.
            </p>
          </section>

          {/* ── Section 4: ID Verification ── */}
          <section
            className="card-sketchy p-7 relative"
            style={{ borderRadius: WOBBLY2 }}
          >
            <div className="tape tape-warm absolute w-[100px]" style={{ top: "-14px", left: "50%", transform: "translateX(-50%) rotate(1.5deg)" }} />
            <SectionHeader
              emoji="🪪"
              title="ID Verification"
              subtitle="Your driver's license or state ID — kept private, only shared with shelters for applications you submit"
            />

            <div className="space-y-5">
              <div>
                <label className="block font-heading font-bold text-sm mb-3">
                  Photo ID (front of driver&apos;s license or state ID)
                </label>

                {form.id_photo_url ? (
                  <div className="flex items-start gap-4">
                    <div className="relative w-48 h-28 border-2 border-pencil wobbly-1 overflow-hidden">
                      <img src={form.id_photo_url} alt="ID" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-sm text-forest font-bold mb-2">&#x2705; ID uploaded</p>
                      <button
                        type="button"
                        onClick={() => idFileRef.current?.click()}
                        className="btn-sketchy text-sm px-4 py-2"
                      >
                        Replace
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => idFileRef.current?.click()}
                    disabled={uploadingId}
                    className="btn-sketchy text-base px-6 py-3 flex items-center gap-2"
                  >
                    {uploadingId ? (
                      <><span className="animate-spin">⏳</span> Uploading…</>
                    ) : (
                      <><span>📤</span> Upload Photo ID</>
                    )}
                  </button>
                )}

                <input
                  ref={idFileRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleIdUpload}
                />
              </div>

              <div
                className="flex items-start gap-3 p-4 border-2 border-pencil bg-paper-alt wobbly-2"
              >
                <input
                  type="checkbox"
                  id="bgcheck"
                  checked={form.background_check_consent}
                  onChange={(e) => set("background_check_consent", e.target.checked)}
                  className="accent-forest w-5 h-5 mt-0.5 shrink-0"
                />
                <label htmlFor="bgcheck" className="text-sm cursor-pointer leading-relaxed">
                  <strong className="font-heading">I consent to a background check</strong> — I understand that
                  shelters may run a standard background check as part of the adoption process.
                  This is a common requirement to ensure the safety and welfare of their animals.
                </label>
              </div>
            </div>
          </section>

          {/* ── Section 5: References ── */}
          <section
            className="card-sketchy p-7 relative"
            style={{ borderRadius: WOBBLY }}
          >
            <div className="tape tape-sage absolute w-[100px]" style={{ top: "-14px", left: "50%", transform: "translateX(-50%) rotate(-1.5deg)" }} />
            <SectionHeader
              emoji="👥"
              title="References"
              subtitle="Two people who can vouch for your ability to care for a dog — friends, family, a vet, or a neighbor"
            />

            <div className="space-y-8">
              {([0, 1] as const).map((idx) => (
                <div key={idx}>
                  <p className="font-heading font-bold text-sm mb-3 opacity-60">
                    Reference {idx + 1}{idx === 0 ? "" : " (optional)"}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-heading font-bold text-sm mb-1.5">Name</label>
                      <input type="text" value={form.references[idx].name}
                        onChange={(e) => setRef(idx, "name", e.target.value)}
                        placeholder="Alex Johnson" className={inputClass()} />
                    </div>
                    <div>
                      <label className="block font-heading font-bold text-sm mb-1.5">Relationship</label>
                      <input type="text" value={form.references[idx].relationship}
                        onChange={(e) => setRef(idx, "relationship", e.target.value)}
                        placeholder="Friend / Neighbor / Vet" className={inputClass()} />
                    </div>
                    <div>
                      <label className="block font-heading font-bold text-sm mb-1.5">Phone</label>
                      <input type="tel" value={form.references[idx].phone}
                        onChange={(e) => setRef(idx, "phone", e.target.value)}
                        placeholder="(555) 000-0000" className={inputClass()} />
                    </div>
                    <div>
                      <label className="block font-heading font-bold text-sm mb-1.5">Email</label>
                      <input type="email" value={form.references[idx].email}
                        onChange={(e) => setRef(idx, "email", e.target.value)}
                        placeholder="alex@example.com" className={inputClass()} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Submit ── */}
          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}

          <div className="flex gap-3 flex-wrap pb-8">
            <button
              type="submit"
              disabled={saving}
              className="btn-sketchy btn-primary text-lg px-8 py-4 disabled:opacity-50"
            >
              {saving ? "Saving…" : saved ? "✅ Profile Saved!" : "Save Profile 🐾"}
            </button>
            <Link href="/dashboard" className="btn-sketchy text-base px-6 py-4">
              Back to Dashboard
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
