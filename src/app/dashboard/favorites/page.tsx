import { redirect } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DogCard } from "@/components/dogs/DogCard";
import { FavoriteButton } from "@/components/dogs/FavoriteButton";
import { createClient } from "@/lib/supabase/server";
import type { Dog } from "@/types";

export default async function FavoritesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: favRows } = await supabase
    .from("favorites")
    .select("dog_id, dog:dogs(*, shelter:shelters(id, name, city, state))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const dogs = (favRows ?? [])
    .map((r) => r.dog as unknown as Dog)
    .filter(Boolean);

  const favIds = new Set(dogs.map((d) => d.id));

  return (
    <>
      <Navbar />
      <main className="pt-[100px] pb-24 px-6">
        <div className="max-w-5xl mx-auto">
          <Link
            href="/dashboard"
            className="inline-block font-heading text-forest font-bold mb-6 hover:underline"
          >
            &#x2190; Dashboard
          </Link>

          <h1 className="font-heading text-4xl font-bold mb-2">
            Saved Dogs &#x2764;
          </h1>
          <p className="text-lg opacity-60 mb-10">
            Dogs you&apos;ve hearted — they&apos;ll be right here when you&apos;re ready.
          </p>

          {dogs.length === 0 ? (
            <div
              className="card-sketchy p-12 text-center max-w-lg mx-auto"
              style={{ borderRadius: "255px 15px 225px 15px / 15px 225px 15px 255px" }}
            >
              <span className="text-6xl block mb-4">🤍</span>
              <h2 className="font-heading text-2xl font-bold mb-3">
                No saved dogs yet
              </h2>
              <p className="opacity-60 mb-6">
                Tap the heart on any dog to save them here for later.
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Link href="/chat" className="btn-sketchy btn-primary text-base px-6 py-3">
                  Find My Match
                </Link>
                <Link href="/dogs" className="btn-sketchy text-base px-6 py-3">
                  Browse Dogs
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {dogs.map((dog, i) => (
                <DogCard
                  key={dog.id}
                  dog={dog}
                  index={i}
                  headerAction={
                    <FavoriteButton
                      dogId={dog.id}
                      userId={user.id}
                      isFavorited={favIds.has(dog.id)}
                      size="sm"
                    />
                  }
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
