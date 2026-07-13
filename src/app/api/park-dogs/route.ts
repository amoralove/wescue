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
      .select("id, name, breed_primary, age_years, age_months, size, personality, shelter:shelters(name)")
      .eq("status", "available")
      .limit(30);

    if (error) throw error;

    const dogs = (data ?? []).map((dog) => ({
      id: dog.id,
      name: dog.name,
      breed: dog.breed_primary ?? "Mixed breed",
      age: ageLabel(dog.age_years, dog.age_months),
      emoji: emojiForDog(dog.breed_primary, dog.size),
      shelter: (dog.shelter as unknown as { name: string } | null)?.name ?? "Local Rescue",
      bio: dog.personality ?? "This pup is still writing their bio.",
      url: `/dogs/${dog.id}`,
    }));

    return NextResponse.json({ dogs }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json({ dogs: [] });
  }
}
