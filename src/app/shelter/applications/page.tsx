import Link from "next/link";
import { requireShelterAuth } from "@/lib/shelter-auth";
import { ShelterApplicationActions } from "./ShelterApplicationActions";

const STATUS_CONFIG: Record<string, { label: string; emoji: string; color: string }> = {
  submitted: { label: "New", emoji: "📬", color: "bg-blue-50 border-blue-300 text-blue-700" },
  reviewing: { label: "Reviewing", emoji: "🔍", color: "bg-yellow-50 border-yellow-300 text-yellow-700" },
  approved: { label: "Approved", emoji: "🎉", color: "bg-green-50 border-green-300 text-green-700" },
  more_info: { label: "More Info", emoji: "✏️", color: "bg-orange-50 border-orange-300 text-orange-700" },
  declined: { label: "Declined", emoji: "💔", color: "bg-red-50 border-red-300 text-red-700" },
  withdrawn: { label: "Withdrawn", emoji: "↩️", color: "bg-gray-50 border-gray-300 text-gray-500" },
};

const WOBBLY = "255px 15px 225px 15px / 15px 225px 15px 255px";

type AppRow = {
  id: string;
  status: string;
  created_at: string;
  applicant_notes: string | null;
  shelter_notes: string | null;
  dog: { id: string; name: string; breed_primary: string | null } | null;
  profile: { user_id: string } | null;
  user_email: string | null;
};

export default async function ShelterApplicationsPage() {
  const { shelter, supabase } = await requireShelterAuth();

  const { data: rawApps } = await supabase
    .from("applications")
    .select("id, status, created_at, applicant_notes, shelter_notes, dog:dogs(id, name, breed_primary)")
    .eq("shelter_id", shelter.id)
    .order("created_at", { ascending: false });

  const apps = (rawApps ?? []) as AppRow[];

  const grouped = {
    submitted: apps.filter((a) => a.status === "submitted"),
    reviewing: apps.filter((a) => a.status === "reviewing"),
    approved: apps.filter((a) => a.status === "approved"),
    more_info: apps.filter((a) => a.status === "more_info"),
    declined: apps.filter((a) => a.status === "declined"),
    withdrawn: apps.filter((a) => a.status === "withdrawn"),
  };

  const actionableStatuses = ["submitted", "reviewing", "more_info"] as const;
  const closedStatuses = ["approved", "declined", "withdrawn"] as const;

  return (
    <div className="min-h-screen bg-paper">
      <nav className="border-b-[3px] border-pencil bg-paper px-6 py-4 flex items-center justify-between">
        <Link href="/shelter/dashboard" className="font-heading text-xl font-bold text-forest flex items-center gap-2">
          🐾 <span className="text-pencil/30 font-normal">←</span> {shelter.name}
        </Link>
        <Link href="/shelter/dogs" className="text-sm font-bold hover:text-forest">Dogs</Link>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="font-heading text-3xl font-bold mb-2">Applications</h1>
        <p className="opacity-60 mb-8">{apps.length} total · {grouped.submitted.length} new</p>

        {apps.length === 0 ? (
          <div className="card-sketchy p-12 text-center" style={{ borderRadius: WOBBLY }}>
            <span className="text-5xl block mb-4">📬</span>
            <h2 className="font-heading text-xl font-bold mb-2">No applications yet</h2>
            <p className="opacity-60">Applications from adopters will appear here.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Actionable */}
            {actionableStatuses.map((status) => {
              const list = grouped[status];
              if (list.length === 0) return null;
              const cfg = STATUS_CONFIG[status];
              return (
                <section key={status}>
                  <h2 className="font-heading text-lg font-bold mb-3 flex items-center gap-2">
                    <span>{cfg.emoji}</span> {cfg.label}
                    <span className={`text-xs font-bold px-2 py-0.5 border-2 rounded-full ${cfg.color}`}>{list.length}</span>
                  </h2>
                  <div className="flex flex-col gap-3">
                    {list.map((app) => (
                      <ApplicationCard key={app.id} app={app} shelterId={shelter.id} />
                    ))}
                  </div>
                </section>
              );
            })}

            {/* Closed */}
            {closedStatuses.some((s) => grouped[s].length > 0) && (
              <section>
                <h2 className="font-heading text-lg font-bold mb-3 opacity-50">Closed</h2>
                <div className="flex flex-col gap-3">
                  {closedStatuses.flatMap((s) =>
                    grouped[s].map((app) => (
                      <ApplicationCard key={app.id} app={app} shelterId={shelter.id} />
                    ))
                  )}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function ApplicationCard({ app, shelterId }: { app: AppRow; shelterId: string }) {
  const cfg = STATUS_CONFIG[app.status] ?? STATUS_CONFIG.submitted;
  const dog = app.dog as { id: string; name: string; breed_primary: string | null } | null;
  const date = new Date(app.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="card-sketchy p-5">
      <div className="flex items-start gap-4 flex-wrap">
        <span className="text-3xl">🐶</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-heading font-bold">
              {dog ? (
                <Link href={`/dogs/${dog.id}`} className="hover:underline text-forest">
                  {dog.name}
                </Link>
              ) : "Unknown Dog"}
            </h3>
            <span className={`text-xs font-bold px-2 py-0.5 border-2 rounded-full ${cfg.color}`}>
              {cfg.emoji} {cfg.label}
            </span>
            <span className="text-xs opacity-40">{date}</span>
          </div>
          {dog?.breed_primary && (
            <p className="text-sm opacity-60 mb-2">{dog.breed_primary}</p>
          )}
          {app.applicant_notes && (
            <p className="text-sm italic opacity-70 border-l-2 border-erased pl-3 mb-3">
              &ldquo;{app.applicant_notes}&rdquo;
            </p>
          )}
          {app.shelter_notes && (
            <div className="text-sm p-2 bg-paper-alt border border-pencil/20 rounded mb-3 opacity-70">
              <strong>Your note:</strong> {app.shelter_notes}
            </div>
          )}
          {!["approved", "declined", "withdrawn"].includes(app.status) && (
            <ShelterApplicationActions applicationId={app.id} currentStatus={app.status} shelterId={shelterId} />
          )}
        </div>
      </div>
    </div>
  );
}
