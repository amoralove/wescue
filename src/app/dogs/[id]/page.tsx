import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";
import { ApplyButton } from "@/components/dogs/ApplyButton";
import { FavoriteButton } from "@/components/dogs/FavoriteButton";
import type { Dog } from "@/types";

function formatFee(cents: number | null): string {
  if (!cents) return "Contact shelter";
  return `$${Math.round(cents / 100)}`;
}

function formatAge(years: number | null, months: number | null): string {
  if (years && years > 0) return `${years} year${years > 1 ? "s" : ""} old`;
  if (months && months > 0) return `${months} month${months > 1 ? "s" : ""} old`;
  return "Age unknown";
}

export default async function DogProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: dog }, { data: { user } }] = await Promise.all([
    supabase.from("dogs").select("*, shelter:shelters(*)").eq("id", id).single(),
    supabase.auth.getUser(),
  ]);

  if (!dog) notFound();

  const typedDog = dog as Dog;

  let hasApplied = false;
  let isFavorited = false;
  if (user) {
    const [{ data: existing }, { data: fav }] = await Promise.all([
      supabase
        .from("applications")
        .select("id")
        .eq("user_id", user.id)
        .eq("dog_id", id)
        .maybeSingle(),
      supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("dog_id", id)
        .maybeSingle(),
    ]);
    hasApplied = !!existing;
    isFavorited = !!fav;
  }

  return (
    <>
      <Navbar />
      <main className="pt-[100px] pb-24 px-6">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/dogs"
            className="inline-block font-heading text-forest font-bold mb-6 hover:underline"
          >
            &#x2190; Back to all dogs
          </Link>

          {/* Photo */}
          <div
            className="card-sketchy overflow-hidden mb-8 wobbly-1"
          >
            <div className="h-[300px] md:h-[400px] bg-forest-pale flex items-center justify-center border-b-3 border-pencil">
              {typedDog.photos?.[0] ? (
                <img
                  src={typedDog.photos[0]}
                  alt={typedDog.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-[8rem]">&#x1f436;</span>
              )}
            </div>

            <div className="p-8">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="font-heading text-4xl font-bold">
                    {typedDog.name}
                  </h1>
                  <p className="text-lg opacity-60">
                    {typedDog.breed_primary ?? "Mixed Breed"}
                    {typedDog.breed_secondary
                      ? ` / ${typedDog.breed_secondary}`
                      : ""}{" "}
                    &middot; {formatAge(typedDog.age_years, typedDog.age_months)}{" "}
                    &middot;{" "}
                    {typedDog.size?.charAt(0).toUpperCase() +
                      typedDog.size?.slice(1)}{" "}
                    &middot;{" "}
                    {typedDog.sex?.charAt(0).toUpperCase() +
                      typedDog.sex?.slice(1)}
                  </p>
                </div>
                <span className="font-heading text-3xl font-bold text-forest">
                  {formatFee(typedDog.adoption_fee_cents)}
                </span>
              </div>

              {/* Compatibility */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                  {
                    label: "Kids",
                    value: typedDog.good_with_kids,
                  },
                  {
                    label: "Dogs",
                    value: typedDog.good_with_dogs,
                  },
                  {
                    label: "Cats",
                    value: typedDog.good_with_cats,
                  },
                  {
                    label: "House Trained",
                    value: typedDog.house_trained,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="p-3 border-2 border-pencil text-center wobbly-2 bg-paper"
                  >
                    <span className="block text-lg mb-1">
                      {item.value === true
                        ? "&#x2705;"
                        : item.value === false
                          ? "&#x274C;"
                          : "&#x2753;"}
                    </span>
                    <span className="text-sm font-bold">{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Personality */}
              {typedDog.personality && (
                <div className="mb-6">
                  <h3 className="font-heading text-xl font-bold mb-2">
                    About {typedDog.name}
                  </h3>
                  <p className="text-lg leading-relaxed opacity-80">
                    {typedDog.personality}
                  </p>
                </div>
              )}

              {/* Medical */}
              {typedDog.medical_notes && (
                <div className="mb-6">
                  <h3 className="font-heading text-xl font-bold mb-2">
                    Medical Notes
                  </h3>
                  <p className="opacity-70">{typedDog.medical_notes}</p>
                </div>
              )}

              {/* Special Needs */}
              {typedDog.special_needs && (
                <div className="mb-6 p-4 bg-warm-light border-2 border-pencil wobbly-3">
                  <h3 className="font-heading text-lg font-bold mb-1">
                    Special Needs
                  </h3>
                  <p className="opacity-80">{typedDog.special_needs}</p>
                </div>
              )}

              {/* Shelter info */}
              <div className="mt-8 pt-6 border-t-2 border-dashed border-erased">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-heading text-lg font-bold">
                      {typedDog.shelter?.name ?? "Local Shelter"}
                    </p>
                    {typedDog.shelter?.city && (
                      <p className="opacity-60">
                        {typedDog.shelter.city}, {typedDog.shelter.state}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <FavoriteButton
                      dogId={typedDog.id}
                      userId={user?.id ?? null}
                      isFavorited={isFavorited}
                    />
                    <ApplyButton
                      dogId={typedDog.id}
                      dogName={typedDog.name}
                      userId={user?.id ?? null}
                      hasApplied={hasApplied}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
