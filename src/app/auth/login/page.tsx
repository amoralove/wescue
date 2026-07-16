"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/dashboard";
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  async function handleGoogleLogin() {
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

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center justify-center gap-1 font-heading text-3xl font-bold text-forest mb-10"
        >
          <span className="text-2xl">&#x1f43e;</span> wescues
        </Link>

        <div
          className="card-sketchy p-8 relative"
          style={{
            borderRadius: "255px 15px 225px 15px / 15px 225px 15px 255px",
          }}
        >
          {/* Tape decoration */}
          <div
            className="tape tape-sage absolute w-[110px]"
            style={{ top: "-14px", left: "50%", transform: "translateX(-50%) rotate(-1.5deg)" }}
          />

          <h1 className="font-heading text-3xl font-bold text-center mb-2">
            Welcome back
          </h1>
          <p className="text-center opacity-60 mb-8">
            Log in to continue finding your match
          </p>

          {error && (
            <div
              className="mb-6 p-3 bg-red-50 border-2 border-red-300 text-red-700 text-sm"
              style={{
                borderRadius:
                  "15px 255px 15px 225px / 225px 15px 255px 15px",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
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
                className="w-full px-4 py-3 border-2 border-pencil font-body text-base outline-none bg-white focus:border-forest focus:ring-2 focus:ring-forest/20 wobbly-1"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-heading font-bold text-sm">Password</label>
                <Link href="/auth/forgot-password" className="text-xs text-forest font-bold hover:underline">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
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
              {loading ? "Logging in..." : "Log In"}
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
            onClick={handleGoogleLogin}
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
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/signup"
              className="text-forest font-bold hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
