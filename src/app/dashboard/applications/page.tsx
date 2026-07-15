import { redirect } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";
import { WithdrawButton } from "@/components/dogs/WithdrawButton";
import type { Application } from "@/types";

const STATUS_CONFIG: Record<
  string,
  { label: string; emoji: string; color: string }
> = {
  submitted: { label: "Submitted", emoji: "📬", color: "bg-blue-50 border-blue-300 text-blue-700" },
  reviewing: { label: "Under Review", emoji: "🔍", color: "bg-yellow-50 border-yellow-300 text-yellow-700" },
  approved: { label: "Approved!", emoji: "🎉", color: "bg-green-50 border-green-300 text-green-700" },
  more_info: { label: "More Info Needed", emoji: "✏️", color: "bg-orange-50 border-orange-300 text-orange-700" },
  declined: { label: "Not a Match", emoji: "💔", color: "bg-red-50 border-red-300 text-red-700" },
  withdrawn: { label: "Withdrawn", emoji: "↩️", color: "bg-gray-50 border-gray-300 text-gray-500" },
};

const WOBBLY = [
  "255px 15px 225px 15px / 15px 225px 15px 255px",
  "15px 255px 15px 225px / 225px 15px 255px 15px",
  "30px 255px 20px 255px / 255px 30px 255px 20px",
];

export default async function ApplicationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: applications } = await supabase
    .from("applications")
    .select("*, dog:dogs(*, shelter:shelters(*))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const apps = (applications ?? []) as Application[];

  return (
    <>
      <Navbar />
      <main className="pt-[100px] pb-24 px-6">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/dashboard"
            className="inline-block font-heading text-forest font-bold mb-6 hover:underline"
          >
            &#x2190; Dashboard
          </Link>

          <h1 className="font-heading text-4xl font-bold mb-2">
            Your Applications &#x1f4cb;
          </h1>
          <p className="text-lg opacity-60 mb-10">
            Track where you are in the adoption process.
          </p>

          {apps.length === 0 ? (
            <div
              className="card-sketchy p-12 text-center"
              style={{ borderRadius: WOBBLY[0] }}
            >
              <span className="text-6xl block mb-4">&#x1f43e;</span>
              <h2 className="font-heading text-2xl font-bold mb-3">
                No applications yet
              </h2>
              <p className="opacity-60 mb-6">
                Find a dog you love and hit &ldquo;Apply to Adopt&rdquo;!
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
            <div className="flex flex-col gap-5">
              {apps.map((app, i) => {
                const status = STATUS_CONFIG[app.status] ?? STATUS_CONFIG.submitted;
                const dog = app.dog;
                const submittedAt = new Date(app.created_at).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                });

                return (
                  <div
                    key={app.id}
                    className="card-sketchy p-6"
                    style={{ borderRadius: WOBBLY[i % WOBBLY.length] }}
                  >
                    <div className="flex items-start gap-4 flex-wrap">
                      <span className="text-5xl shrink-0">&#x1f436;</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h2 className="font-heading text-xl font-bold">
                            {dog?.name ?? "Unknown Dog"}
                          </h2>
                          <span
                            className={`text-xs font-bold px-2 py-0.5 border-2 ${status.color}`}
                            style={{ borderRadius: WOBBLY[0] }}
                          >
                            {status.emoji} {status.label}
                          </span>
                        </div>
                        <p className="text-sm opacity-60 mb-3">
                          {dog?.breed_primary ?? "Mixed Breed"} &middot;{" "}
                          {dog?.shelter?.name ?? "Local Shelter"} &middot;{" "}
                          Applied {submittedAt}
                        </p>

                        {app.applicant_notes && (
                          <p className="text-sm opacity-70 italic mb-3 border-l-2 border-erased pl-3">
                            &ldquo;{app.applicant_notes}&rdquo;
                          </p>
                        )}

                        {app.shelter_notes && (
                          <div className="text-sm p-3 bg-paper-alt border-2 border-pencil mb-3 wobbly-2">
                            <strong className="font-heading">Shelter note:</strong>{" "}
                            {app.shelter_notes}
                          </div>
                        )}

                        <div className="flex items-center gap-4 flex-wrap mt-1">
                          <Link
                            href={`/dogs/${dog?.id}`}
                            className="text-sm text-forest font-bold hover:underline"
                          >
                            View {dog?.name}&apos;s profile &#x2192;
                          </Link>
                          {!["withdrawn", "declined", "approved"].includes(app.status) && (
                            <WithdrawButton applicationId={app.id} />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
