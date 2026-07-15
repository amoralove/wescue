"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const WOBBLY = "255px 15px 225px 15px / 15px 225px 15px 255px";

export default function ShelterRegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<"account" | "shelter">("account");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [shelterName, setShelterName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAccountStep(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signUp({ email, password });
    if (error) { setError(error.message); setLoading(false); return; }

    setStep("shelter");
    setLoading(false);
  }

  async function handleShelterStep(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/shelter/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: shelterName, email, phone, city, state, website, description }),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Registration failed"); setLoading(false); return; }

      router.push("/shelter/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-lg">
        <Link href="/" className="flex items-center justify-center gap-1 font-heading text-3xl font-bold text-forest mb-10">
          <span className="text-2xl">🐾</span> wescue
        </Link>

        <div className="card-sketchy p-8 relative" style={{ borderRadius: WOBBLY }}>
          <div className="tape tape-sage absolute w-[110px]"
            style={{ top: "-14px", left: "50%", transform: "translateX(-50%) rotate(-1.5deg)" }} />

          {/* Steps indicator */}
          <div className="flex items-center gap-3 mb-8">
            {["Account", "Shelter Info"].map((label, i) => {
              const active = (i === 0 && step === "account") || (i === 1 && step === "shelter");
              const done = i === 0 && step === "shelter";
              return (
                <div key={label} className="flex items-center gap-2">
                  {i > 0 && <div className="flex-1 h-px bg-pencil/20 w-8" />}
                  <div className={`flex items-center gap-1.5 text-sm font-bold ${active ? "text-forest" : done ? "text-pencil/40" : "text-pencil/30"}`}>
                    <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs ${active ? "border-forest bg-forest text-white" : done ? "border-pencil/30 bg-pencil/10" : "border-pencil/20"}`}>
                      {done ? "✓" : i + 1}
                    </span>
                    {label}
                  </div>
                </div>
              );
            })}
          </div>

          {error && (
            <div className="mb-5 p-3 bg-red-50 border-2 border-red-300 text-red-700 text-sm rounded-xl">
              {error}
            </div>
          )}

          {step === "account" && (
            <>
              <h1 className="font-heading text-2xl font-bold mb-1">Create your account</h1>
              <p className="opacity-60 text-sm mb-6">This will be your shelter login email.</p>
              <form onSubmit={handleAccountStep} className="space-y-4">
                <div>
                  <label className="block font-heading font-bold text-sm mb-1.5">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                    className="w-full px-4 py-3 border-2 border-pencil font-body text-base outline-none bg-white focus:border-forest wobbly-1" />
                </div>
                <div>
                  <label className="block font-heading font-bold text-sm mb-1.5">Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                    className="w-full px-4 py-3 border-2 border-pencil font-body text-base outline-none bg-white focus:border-forest wobbly-2" />
                </div>
                <button type="submit" disabled={loading} className="btn-sketchy btn-primary w-full text-lg py-3 disabled:opacity-50">
                  {loading ? "Creating account…" : "Continue →"}
                </button>
              </form>
            </>
          )}

          {step === "shelter" && (
            <>
              <h1 className="font-heading text-2xl font-bold mb-1">Tell us about your shelter</h1>
              <p className="opacity-60 text-sm mb-6">This info will be shown to potential adopters.</p>
              <form onSubmit={handleShelterStep} className="space-y-4">
                <div>
                  <label className="block font-heading font-bold text-sm mb-1.5">Shelter name *</label>
                  <input type="text" value={shelterName} onChange={(e) => setShelterName(e.target.value)} required
                    className="w-full px-4 py-3 border-2 border-pencil font-body text-base outline-none bg-white focus:border-forest wobbly-1" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-heading font-bold text-sm mb-1.5">City *</label>
                    <input type="text" value={city} onChange={(e) => setCity(e.target.value)} required
                      className="w-full px-4 py-3 border-2 border-pencil font-body text-base outline-none bg-white focus:border-forest wobbly-2" />
                  </div>
                  <div>
                    <label className="block font-heading font-bold text-sm mb-1.5">State *</label>
                    <input type="text" value={state} onChange={(e) => setState(e.target.value)} required maxLength={2} placeholder="CA"
                      className="w-full px-4 py-3 border-2 border-pencil font-body text-base outline-none bg-white focus:border-forest wobbly-3" />
                  </div>
                </div>
                <div>
                  <label className="block font-heading font-bold text-sm mb-1.5">Phone</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-pencil font-body text-base outline-none bg-white focus:border-forest wobbly-1" />
                </div>
                <div>
                  <label className="block font-heading font-bold text-sm mb-1.5">Website</label>
                  <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://"
                    className="w-full px-4 py-3 border-2 border-pencil font-body text-base outline-none bg-white focus:border-forest wobbly-2" />
                </div>
                <div>
                  <label className="block font-heading font-bold text-sm mb-1.5">About your shelter</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Tell adopters who you are and what makes your rescue special…"
                    className="w-full px-4 py-3 border-2 border-pencil font-body text-base outline-none bg-white focus:border-forest wobbly-1 resize-none" />
                </div>
                <button type="submit" disabled={loading} className="btn-sketchy btn-primary w-full text-lg py-3 disabled:opacity-50">
                  {loading ? "Setting up…" : "Complete Registration 🐾"}
                </button>
              </form>
            </>
          )}

          <p className="text-center text-sm mt-6 opacity-60">
            Already registered?{" "}
            <Link href="/shelter/login" className="text-forest font-bold hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
