import Link from "next/link";
import { requireShelterAuth } from "@/lib/shelter-auth";

export default async function ShelterDogsPage() {
  const { shelter, supabase } = await requireShelterAuth();

  const { data: dogs } = await supabase
    .from("dogs")
    .select("id, name, breed_primary, size, status, photos, age_years, age_months, adoption_fee_cents")
    .eq("shelter_id", shelter.id)
    .order("created_at", { ascending: false });

  const STATUS_STYLE: Record<string, string> = {
    available: "bg-green-50 border-green-300 text-green-700",
    pending: "bg-yellow-50 border-yellow-300 text-yellow-700",
    adopted: "bg-blue-50 border-blue-300 text-blue-700",
    on_hold: "bg-orange-50 border-orange-300 text-orange-700",
  };

  return (
    <div className="min-h-screen bg-paper">
      <nav className="border-b-[3px] border-pencil bg-paper px-6 py-4 flex items-center justify-between">
        <Link href="/shelter/dashboard" className="font-heading text-xl font-bold text-forest flex items-center gap-2">
          🐾 <span className="text-pencil/30 font-normal">←</span> {shelter.name}
        </Link>
        <div className="flex items-center gap-4 text-sm font-bold">
          <Link href="/shelter/applications" className="hover:text-forest">Applications</Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-3xl font-bold mb-1">Your Dogs</h1>
            <p className="opacity-60">{dogs?.length ?? 0} dog{dogs?.length !== 1 ? "s" : ""} listed</p>
          </div>
          <Link href="/shelter/dogs/new" className="btn-sketchy btn-primary text-base px-5 py-2.5">
            + Add Dog
          </Link>
        </div>

        {!dogs || dogs.length === 0 ? (
          <div className="card-sketchy p-12 text-center" style={{ borderRadius: "255px 15px 225px 15px / 15px 225px 15px 255px" }}>
            <span className="text-6xl block mb-4">🐾</span>
            <h2 className="font-heading text-2xl font-bold mb-3">No dogs yet</h2>
            <p className="opacity-60 mb-6">Add your first dog to start receiving adoption applications.</p>
            <Link href="/shelter/dogs/new" className="btn-sketchy btn-primary text-base px-6 py-3">
              Add Your First Dog
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {dogs.map((dog) => {
              const statusStyle = STATUS_STYLE[dog.status] ?? "bg-gray-50 border-gray-300 text-gray-500";
              return (
                <Link
                  key={dog.id}
                  href={`/shelter/dogs/${dog.id}`}
                  className="card-sketchy p-4 flex items-center gap-4 hover:shadow-hard-lg transition-shadow"
                >
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-forest-pale flex items-center justify-center flex-shrink-0 border-2 border-pencil/15">
                    {dog.photos?.[0]
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={dog.photos[0]} alt={dog.name} className="w-full h-full object-cover" />
                      : <span className="text-2xl">🐶</span>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-heading font-bold text-lg leading-tight">{dog.name}</p>
                    <p className="text-sm opacity-60">
                      {dog.breed_primary ?? "Mixed"} · {dog.size}
                      {dog.adoption_fee_cents ? ` · $${Math.round(dog.adoption_fee_cents / 100)}` : ""}
                    </p>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 border-2 rounded-full flex-shrink-0 ${statusStyle}`}>
                    {dog.status}
                  </span>
                  <span className="text-pencil/25 text-xl flex-shrink-0">›</span>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
