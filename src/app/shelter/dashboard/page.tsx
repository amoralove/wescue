import Link from "next/link";
import { requireShelterAuth } from "@/lib/shelter-auth";

const STATUS_COLORS: Record<string, string> = {
  submitted: "bg-blue-50 border-blue-300 text-blue-700",
  reviewing: "bg-yellow-50 border-yellow-300 text-yellow-700",
  approved: "bg-green-50 border-green-300 text-green-700",
  more_info: "bg-orange-50 border-orange-300 text-orange-700",
  declined: "bg-red-50 border-red-300 text-red-700",
  withdrawn: "bg-gray-50 border-gray-300 text-gray-500",
};

const WOBBLY = [
  "255px 15px 225px 15px / 15px 225px 15px 255px",
  "15px 255px 15px 225px / 225px 15px 255px 15px",
  "30px 255px 20px 255px / 255px 30px 255px 20px",
];

export default async function ShelterDashboardPage() {
  const { shelter, supabase } = await requireShelterAuth();

  const [{ data: dogs }, { data: applications }] = await Promise.all([
    supabase
      .from("dogs")
      .select("id, name, breed_primary, size, status, photos")
      .eq("shelter_id", shelter.id)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("applications")
      .select("id, status, created_at, dog:dogs(name), user_id")
      .eq("shelter_id", shelter.id)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const totalDogs = dogs?.length ?? 0;
  const pendingApps = (applications ?? []).filter((a) => a.status === "submitted" || a.status === "reviewing").length;

  return (
    <div className="min-h-screen bg-paper">
      {/* Shelter nav */}
      <nav className="border-b-[3px] border-pencil bg-paper px-6 py-4 flex items-center justify-between">
        <Link href="/shelter/dashboard" className="font-heading text-xl font-bold text-forest flex items-center gap-2">
          🐾 Wescue <span className="text-pencil/30 font-normal">· Shelter Portal</span>
        </Link>
        <div className="flex items-center gap-4 text-sm font-bold">
          <Link href="/shelter/dogs" className="hover:text-forest transition-colors">Dogs</Link>
          <Link href="/shelter/applications" className="hover:text-forest transition-colors">Applications</Link>
          <Link href="/auth/login" className="opacity-50 hover:opacity-100 transition-opacity">Sign out</Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold mb-1">{shelter.name}</h1>
          <p className="opacity-60">{shelter.city}, {shelter.state}</p>
          {!shelter.verified && (
            <div className="mt-3 inline-flex items-center gap-2 text-sm px-3 py-1.5 bg-yellow-50 border-2 border-yellow-300 text-yellow-700 rounded-full">
              ⏳ Pending verification — your dogs will be visible once approved
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          {[
            { label: "Dogs Listed", value: totalDogs, emoji: "🐕", href: "/shelter/dogs" },
            { label: "Pending Review", value: pendingApps, emoji: "📬", href: "/shelter/applications" },
            { label: "Total Applications", value: applications?.length ?? 0, emoji: "📋", href: "/shelter/applications" },
          ].map((stat, i) => (
            <Link
              key={stat.label}
              href={stat.href}
              className="card-sketchy p-5 flex items-center gap-4 hover:shadow-hard-lg transition-shadow group"
              style={{ borderRadius: WOBBLY[i] }}
            >
              <span className="text-4xl">{stat.emoji}</span>
              <div>
                <p className="font-heading text-3xl font-bold group-hover:text-forest transition-colors">{stat.value}</p>
                <p className="text-sm opacity-60">{stat.label}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent dogs */}
          <div className="card-sketchy p-5" style={{ borderRadius: WOBBLY[1] }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-lg font-bold">Recent Dogs</h2>
              <Link href="/shelter/dogs" className="text-sm text-forest font-bold hover:underline">View all →</Link>
            </div>
            {!dogs || dogs.length === 0 ? (
              <div className="text-center py-6 opacity-50">
                <p className="font-heading font-bold mb-2">No dogs yet</p>
                <Link href="/shelter/dogs/new" className="text-forest font-bold hover:underline text-sm">Add your first dog →</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {dogs.map((dog) => (
                  <Link key={dog.id} href={`/shelter/dogs/${dog.id}`} className="flex items-center gap-3 hover:bg-paper-alt rounded-lg p-2 -mx-2 transition-colors">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-forest-pale flex items-center justify-center flex-shrink-0">
                      {dog.photos?.[0]
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={dog.photos[0]} alt={dog.name} className="w-full h-full object-cover" />
                        : <span className="text-xl">🐶</span>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm">{dog.name}</p>
                      <p className="text-xs opacity-50 truncate">{dog.breed_primary ?? "Mixed"} · {dog.size}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 border rounded-full ${
                      dog.status === "available" ? "bg-green-50 border-green-300 text-green-700" :
                      dog.status === "adopted" ? "bg-blue-50 border-blue-300 text-blue-700" :
                      "bg-gray-50 border-gray-300 text-gray-500"
                    }`}>
                      {dog.status}
                    </span>
                  </Link>
                ))}
              </div>
            )}
            <div className="mt-4 pt-3 border-t border-pencil/10">
              <Link href="/shelter/dogs/new" className="btn-sketchy btn-primary text-sm px-4 py-2 w-full text-center block">
                + Add Dog
              </Link>
            </div>
          </div>

          {/* Recent applications */}
          <div className="card-sketchy p-5" style={{ borderRadius: WOBBLY[2] }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-lg font-bold">Recent Applications</h2>
              <Link href="/shelter/applications" className="text-sm text-forest font-bold hover:underline">View all →</Link>
            </div>
            {!applications || applications.length === 0 ? (
              <div className="text-center py-6 opacity-50">
                <p className="font-heading font-bold">No applications yet</p>
                <p className="text-sm mt-1">They&apos;ll appear here once adopters apply.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map((app) => {
                  const color = STATUS_COLORS[app.status] ?? STATUS_COLORS.submitted;
                  const dog = app.dog as { name: string } | null;
                  return (
                    <Link key={app.id} href={`/shelter/applications/${app.id}`} className="flex items-center gap-3 hover:bg-paper-alt rounded-lg p-2 -mx-2 transition-colors">
                      <span className="text-2xl flex-shrink-0">📋</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm">{dog?.name ?? "Unknown dog"}</p>
                        <p className="text-xs opacity-50">{new Date(app.created_at).toLocaleDateString()}</p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-0.5 border-2 rounded-full ${color}`}>
                        {app.status}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
