import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function emojiForDog(breed: string | null, size: string): string {
  const b = (breed ?? "").toLowerCase();
  if (b.includes("dachshund") || b.includes("doxie") || b.includes("wiener")) return "🌭";
  if (b.includes("golden retriever") || b.includes("golden")) return "🦴";
  if (b.includes("poodle") || b.includes("doodle") || b.includes("oodle")) return "🐩";
  if (b.includes("shepherd") || b.includes("husky") || b.includes("malinois") || b.includes("collie")) return "🐕‍🦺";
  if (size === "small") return "🐶";
  if (size === "large" || size === "xlarge") return "🦮";
  return "🐕";
}

function ageLabel(years: number | null, months: number | null): string {
  if (years !== null && years > 0) return years === 1 ? "1 year" : `${years} years`;
  if (months !== null && months > 0) return months === 1 ? "1 month" : `${months} months`;
  return "Age unknown";
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("dogs")
      .select("id, name, breed_primary, age_years, age_months, size, energy_level, good_with_kids, good_with_dogs, good_with_cats, house_trained, adoption_fee_cents, personality, photos, shelter:shelters(name, city, state)")
      .eq("status", "available")
      .limit(50);

    if (error) throw error;

    const dogs = (data ?? []).map((dog) => ({
      id: dog.id,
      name: dog.name,
      breed: dog.breed_primary ?? "Mixed breed",
      age: ageLabel(dog.age_years, dog.age_months),
      emoji: emojiForDog(dog.breed_primary, dog.size),
      shelter: (dog.shelter as unknown as { name: string; city: string | null; state: string | null } | null)?.name ?? "Local Rescue",
      shelterCity: (dog.shelter as unknown as { name: string; city: string | null; state: string | null } | null)?.city ?? null,
      shelterState: (dog.shelter as unknown as { name: string; city: string | null; state: string | null } | null)?.state ?? null,
      bio: dog.personality ?? "This pup is still writing their bio.",
      url: `/dogs/${dog.id}`,
      photo: ((dog.photos as string[] | null)?.[0]) ?? null,
      size: dog.size ?? "medium",
      energy: dog.energy_level ?? null,
      goodWithKids: dog.good_with_kids ?? null,
      goodWithDogs: dog.good_with_dogs ?? null,
      goodWithCats: dog.good_with_cats ?? null,
      houseTrained: dog.house_trained ?? null,
      feeCents: dog.adoption_fee_cents ?? null,
    }));

    return NextResponse.json({ dogs }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json({ dogs: [] });
  }
}
