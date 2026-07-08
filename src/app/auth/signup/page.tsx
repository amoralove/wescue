"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  async function handleGoogleSignup() {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-md text-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-1 font-heading text-3xl font-bold text-forest mb-10"
          >
            <span className="text-2xl">&#x1f43e;</span> wescue
          </Link>

          <div
            className="card-sketchy p-8"
            style={{
              borderRadius:
                "255px 15px 225px 15px / 15px 225px 15px 255px",
            }}
          >
            <span className="text-6xl block mb-4">&#x2709;</span>
            <h2 className="font-heading text-2xl font-bold mb-3">
              Check your email!
            </h2>
            <p className="opacity-70 mb-6">
              We sent a confirmation link to{" "}
              <strong className="text-forest">{email}</strong>. Click it to
              activate your account.
            </p>
            <Link
              href="/auth/login"
              className="btn-sketchy btn-primary text-base px-6 py-3"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center justify-center gap-1 font-heading text-3xl font-bold text-forest mb-10"
        >
          <span className="text-2xl">&#x1f43e;</span> wescue
        </Link>

        <div
          className="card-sketchy p-8 relative"
          style={{
            borderRadius: "15px 255px 15px 225px / 225px 15px 255px 15px",
          }}
        >
          {/* Tape decoration */}
          <div
            className="tape tape-warm absolute w-[110px]"
            style={{ top: "-14px", left: "50%", transform: "translateX(-50%) rotate(1.5deg)" }}
          />

          <h1 className="font-heading text-3xl font-bold text-center mb-2">
            Join Wescue
          </h1>
          <p className="text-center opacity-60 mb-8">
            Create an account to save matches and apply to adopt
          </p>

          {error && (
            <div
              className="mb-6 p-3 bg-red-50 border-2 border-red-300 text-red-700 text-sm"
              style={{
                borderRadius:
                  "255px 15px 225px 15px / 15px 225px 15px 255px",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label className="block font-heading font-bold text-sm mb-1.5">
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="What should we call you?"
                required
                className="w-full px-4 py-3 border-2 border-pencil font-body text-base outline-none bg-white focus:border-forest focus:ring-2 focus:ring-forest/20 wobbly-1"
              />
            </div>

            <div>
              <label className="block font-heading font-bold text-sm mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 border-2 border-pencil font-body text-base outline-none bg-white focus:border-forest focus:ring-2 focus:ring-forest/20 wobbly-2"
              />
            </div>

            <div>
              <label className="block font-heading font-bold text-sm mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                minLength={6}
                className="w-full px-4 py-3 border-2 border-pencil font-body text-base outline-none bg-white focus:border-forest focus:ring-2 focus:ring-forest/20 wobbly-3"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-sketchy btn-primary w-full text-lg py-3.5 disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 border-t-2 border-dashed border-erased" />
            <span className="text-sm opacity-50">or</span>
            <div className="flex-1 border-t-2 border-dashed border-erased" />
          </div>

          {/* Google OAuth */}
          <button
            onClick={handleGoogleSignup}
            className="btn-sketchy w-full text-base py-3 bg-white hover:bg-paper-alt"
          >
            <svg
              className="w-5 h-5 mr-2 inline-block"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-sm mt-6 opacity-60">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-forest font-bold hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>

        <p className="text-center text-xs mt-6 opacity-40 max-w-sm mx-auto">
          By creating an account, you agree to our Terms of Service and
          Privacy Policy. Wescue is free for adopters — always.
        </p>
      </div>
    </div>
  );
}
