import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DogCard } from "@/components/dogs/DogCard";
import { FavoriteButton } from "@/components/dogs/FavoriteButton";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Dog } from "@/types";

export const metadata = {
  title: "Browse Dogs - Wescue",
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
      .limit(24),
    supabase.auth.getUser(),
  ]);

  const typedDogs = (dogs ?? []) as Dog[];

  // Fetch which dogs this user has favorited
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
      <main className="pt-[120px] pb-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div
              className="inline-block bg-forest text-white font-heading font-bold text-base px-5 py-1.5 border-3 border-pencil shadow-[4px_4px_0px_0px_#2d2d2d] mb-4 -rotate-2"
              style={{
                borderRadius:
                  "255px 15px 225px 15px / 15px 225px 15px 255px",
              }}
            >
              Browse Dogs
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-3">
              Dogs looking for homes
            </h1>
            <p className="text-lg opacity-70 max-w-md mx-auto mb-6">
              Every dog here is from a verified rescue or shelter.
            </p>
            <Link href="/chat" className="btn-sketchy btn-primary text-base px-6 py-3">
              Or let AI find your match &#x2192;
            </Link>
          </div>

          {typedDogs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {typedDogs.map((dog, i) => (
                <DogCard
                  key={dog.id}
                  dog={dog}
                  index={i}
                  headerAction={
                    <FavoriteButton
                      dogId={dog.id}
                      userId={user?.id ?? null}
                      isFavorited={favoritedIds.has(dog.id)}
                      size="sm"
                    />
                  }
                />
              ))}
            </div>
          ) : (
            <div
              className="card-sketchy p-12 text-center max-w-lg mx-auto wobbly-1"
            >
              <span className="text-6xl block mb-4">&#x1f43e;</span>
              <h3 className="font-heading text-2xl font-bold mb-3">
                No dogs listed yet
              </h3>
              <p className="opacity-70 mb-6">
                We&apos;re just getting started! Dogs from verified shelters
                will appear here soon.
              </p>
              <Link href="/chat" className="btn-sketchy btn-primary">
                Try AI matching instead
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
