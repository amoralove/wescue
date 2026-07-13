import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DogBrowser } from "@/components/dogs/DogBrowser";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Dog } from "@/types";

export const metadata = {
  title: "Browse Dogs — Wescue",
  description: "Browse rescue dogs available for adoption from verified shelters.",
};

export default async function DogsPage() {
  const supabase = await createClient();

  const [{ data: dogs }, { data: { user } }] = await Promise.all([
    supabase
      .from("dogs")
      .select("*, shelter:shelters(id, name, city, state)")
      .eq("status", "available")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase.auth.getUser(),
  ]);

  const typedDogs = (dogs ?? []) as Dog[];

  let favoritedIds = new Set<string>();
  if (user) {
    const { data: favs } = await supabase
      .from("favorites")
      .select("dog_id")
      .eq("user_id", user.id);
    favoritedIds = new Set((favs ?? []).map((f) => f.dog_id as string));
  }

  return (
    <>
      <Navbar />
      <main className="pt-[110px] pb-24 px-4">
        <div className="max-w-2xl mx-auto mb-8 text-center">
          <div
            className="inline-block bg-forest text-white font-heading font-bold text-base px-5 py-1.5 border-3 border-pencil shadow-[4px_4px_0px_0px_#2d2d2d] mb-4 -rotate-2"
            style={{ borderRadius: "255px 15px 225px 15px / 15px 225px 15px 255px" }}
          >
            Browse Dogs
          </div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-3">
            Find your dog
          </h1>
          <p className="opacity-60 mb-4">
            Every dog here is from a verified rescue or shelter. Filter, browse, and meet them.
          </p>
          <Link href="/chat" className="btn-sketchy btn-primary text-sm px-5 py-2">
            Or let AI find your match →
          </Link>
        </div>

        {typedDogs.length === 0 ? (
          <div className="card-sketchy p-12 text-center max-w-lg mx-auto">
            <span className="text-6xl block mb-4">🐾</span>
            <h3 className="font-heading text-2xl font-bold mb-3">No dogs listed yet</h3>
            <p className="opacity-70 mb-6">Dogs from verified shelters will appear here soon.</p>
            <Link href="/chat" className="btn-sketchy btn-primary">Try AI matching instead</Link>
          </div>
        ) : (
          <DogBrowser
            dogs={typedDogs}
            userId={user?.id ?? null}
            favoritedIds={favoritedIds}
          />
        )}
      </main>
      <Footer />
    </>
  );
}
