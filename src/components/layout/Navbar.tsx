"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-paper/92 backdrop-blur-sm border-b-3 border-pencil">
      <div className="max-w-5xl mx-auto px-6 flex items-center justify-between h-[72px]">
        <Link
          href="/"
          className="font-heading text-[1.7rem] font-bold text-forest flex items-center gap-1"
        >
          <span className="text-xl">&#x1f43e;</span> wescue
        </Link>

        <div
          className={`${
            open ? "flex" : "hidden"
          } md:flex flex-col md:flex-row items-center gap-4 md:gap-7 absolute md:relative top-[72px] md:top-0 left-0 right-0 md:left-auto md:right-auto bg-paper md:bg-transparent border-b-3 md:border-b-0 border-pencil p-5 md:p-0`}
        >
          <Link
            href="/#how-it-works"
            className="text-lg text-pencil hover:text-forest transition-colors"
            onClick={() => setOpen(false)}
          >
            How It Works
          </Link>
          <Link
            href="/dogs"
            className="text-lg text-pencil hover:text-forest transition-colors"
            onClick={() => setOpen(false)}
          >
            Browse Dogs
          </Link>
          <Link
            href="/#shelters"
            className="text-lg text-pencil hover:text-forest transition-colors"
            onClick={() => setOpen(false)}
          >
            For Shelters
          </Link>
          <Link
            href="/chat"
            className="btn-sketchy btn-primary text-base px-5 py-2"
            onClick={() => setOpen(false)}
          >
            Start Matching!
          </Link>

          {user ? (
            <>
              <Link
                href="/dashboard"
                className="text-lg text-pencil hover:text-forest transition-colors"
                onClick={() => setOpen(false)}
              >
                Dashboard
              </Link>
              <button
                onClick={() => {
                  setOpen(false);
                  handleSignOut();
                }}
                className="text-lg text-pencil hover:text-red-600 transition-colors bg-transparent border-none cursor-pointer"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-lg text-pencil hover:text-forest transition-colors"
                onClick={() => setOpen(false)}
              >
                Log In
              </Link>
              <Link
                href="/auth/signup"
                className="btn-sketchy text-base px-5 py-2 bg-white hover:bg-paper-alt"
                onClick={() => setOpen(false)}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        <button
          className="flex md:hidden flex-col gap-[5px] p-1 bg-transparent border-none cursor-pointer"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <span className="block w-[26px] h-[3px] bg-pencil rounded-sm" />
          <span className="block w-[26px] h-[3px] bg-pencil rounded-sm" />
          <span className="block w-[26px] h-[3px] bg-pencil rounded-sm" />
        </button>
      </div>
    </nav>
  );
}
