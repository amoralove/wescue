"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
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
          style={{ borderRadius: "255px 15px 225px 15px / 15px 225px 15px 255px" }}
        >
          <div
            className="tape tape-warm absolute w-[110px]"
            style={{ top: "-14px", left: "50%", transform: "translateX(-50%) rotate(1deg)" }}
          />

          {sent ? (
            <div className="text-center">
              <span className="text-5xl block mb-4">📬</span>
              <h1 className="font-heading text-2xl font-bold mb-2">Check your inbox</h1>
              <p className="opacity-60 mb-6">
                We sent a password reset link to <strong>{email}</strong>. It may take a minute to arrive.
              </p>
              <Link href="/auth/login" className="btn-sketchy btn-primary px-6 py-2.5">
                Back to login
              </Link>
            </div>
          ) : (
            <>
              <h1 className="font-heading text-3xl font-bold text-center mb-2">Forgot password?</h1>
              <p className="text-center opacity-60 mb-8">
                Enter your email and we&apos;ll send you a reset link.
              </p>

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
                  <label className="block font-heading font-bold text-sm mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full px-4 py-3 border-2 border-pencil font-body text-base outline-none bg-white focus:border-forest focus:ring-2 focus:ring-forest/20 wobbly-1"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-sketchy btn-primary w-full text-lg py-3.5 disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>

              <p className="text-center text-sm mt-6 opacity-60">
                Remember it?{" "}
                <Link href="/auth/login" className="text-forest font-bold hover:underline">
                  Log in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
