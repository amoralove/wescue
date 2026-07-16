"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="flex items-center justify-center gap-1 font-heading text-3xl font-bold text-forest mb-10"
        >
          <span className="text-2xl">🐾</span> wescues
        </Link>

        <div
          className="card-sketchy p-8 relative"
          style={{ borderRadius: "15px 255px 15px 225px / 225px 15px 255px 15px" }}
        >
          <div
            className="tape tape-sage absolute w-[110px]"
            style={{ top: "-14px", left: "50%", transform: "translateX(-50%) rotate(-1.5deg)" }}
          />

          <h1 className="font-heading text-3xl font-bold text-center mb-2">Set new password</h1>
          <p className="text-center opacity-60 mb-8">Choose a strong password for your account.</p>

          {error && (
            <div
              className="mb-6 p-3 bg-red-50 border-2 border-red-300 text-red-700 text-sm"
              style={{ borderRadius: "15px 255px 15px 225px / 225px 15px 255px 15px" }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-heading font-bold text-sm mb-1.5">New password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                minLength={6}
                className="w-full px-4 py-3 border-2 border-pencil font-body text-base outline-none bg-white focus:border-forest focus:ring-2 focus:ring-forest/20 wobbly-1"
              />
            </div>

            <div>
              <label className="block font-heading font-bold text-sm mb-1.5">Confirm password</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Same password again"
                required
                minLength={6}
                className="w-full px-4 py-3 border-2 border-pencil font-body text-base outline-none bg-white focus:border-forest focus:ring-2 focus:ring-forest/20 wobbly-2"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-sketchy btn-primary w-full text-lg py-3.5 disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
