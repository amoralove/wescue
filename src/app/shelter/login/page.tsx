"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const WOBBLY = "15px 255px 15px 225px / 225px 15px 255px 15px";

export default function ShelterLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); return; }

    if (!data.user?.user_metadata?.shelter_id) {
      await supabase.auth.signOut();
      setError("No shelter account found for this email. Please register first.");
      setLoading(false);
      return;
    }

    router.push("/shelter/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-1 font-heading text-3xl font-bold text-forest mb-10">
          <span className="text-2xl">🐾</span> wescues
        </Link>

        <div className="card-sketchy p-8 relative" style={{ borderRadius: WOBBLY }}>
          <div className="tape tape-warm absolute w-[110px]"
            style={{ top: "-14px", left: "50%", transform: "translateX(-50%) rotate(1deg)" }} />

          <h1 className="font-heading text-3xl font-bold text-center mb-2">Shelter login</h1>
          <p className="text-center opacity-60 mb-8">Manage your dogs and applications.</p>

          {error && (
            <div className="mb-5 p-3 bg-red-50 border-2 border-red-300 text-red-700 text-sm rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block font-heading font-bold text-sm mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full px-4 py-3 border-2 border-pencil font-body text-base outline-none bg-white focus:border-forest wobbly-1" />
            </div>
            <div>
              <label className="block font-heading font-bold text-sm mb-1.5">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                className="w-full px-4 py-3 border-2 border-pencil font-body text-base outline-none bg-white focus:border-forest wobbly-2" />
            </div>
            <button type="submit" disabled={loading} className="btn-sketchy btn-primary w-full text-lg py-3.5 disabled:opacity-50">
              {loading ? "Logging in…" : "Log In"}
            </button>
          </form>

          <p className="text-center text-sm mt-6 opacity-60">
            New shelter?{" "}
            <Link href="/shelter/register" className="text-forest font-bold hover:underline">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
