import { redirect } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const name =
    user.user_metadata?.full_name ??
    user.email?.split("@")[0] ??
    "Friend";

  const { data: profile } = await supabase
    .from("adopter_profiles")
    .select("id, living_situation, activity_level")
    .eq("user_id", user.id)
    .maybeSingle();

  const profileIncomplete = !profile || !profile.living_situation || !profile.activity_level;

  return (
    <>
      <Navbar />
      <main className="pt-[100px] pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-heading text-4xl font-bold mb-2">
            Hey, {name}! &#x1f43e;
          </h1>
          <p className="text-lg opacity-60 mb-6">
            Welcome to your Wescue dashboard.
          </p>

          {profileIncomplete && (
            <Link
              href="/dashboard/profile"
              className="flex items-start gap-4 p-4 mb-8 border-2 border-forest/40 bg-forest/5 rounded-xl hover:bg-forest/10 transition-colors group"
            >
              <span className="text-3xl flex-shrink-0">📋</span>
              <div className="flex-1 min-w-0">
                <p className="font-heading font-bold text-forest group-hover:underline">
                  Complete your adopter profile
                </p>
                <p className="text-sm opacity-70 mt-0.5">
                  A complete profile helps shelters say yes faster. Add your home info, references, and ID — takes about 3 minutes.
                </p>
              </div>
              <span className="text-forest/50 text-xl flex-shrink-0 self-center">→</span>
            </Link>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Start Matching */}
            <Link
              href="/chat"
              className="card-sketchy p-6 hover:shadow-hard-lg transition-shadow wobbly-1 group"
            >
              <span className="text-4xl block mb-3">&#x1f4ac;</span>
              <h2 className="font-heading text-xl font-bold mb-1 group-hover:text-forest">
                Find Your Match
              </h2>
              <p className="text-sm opacity-60">
                Chat with our AI to discover dogs that fit your lifestyle.
              </p>
            </Link>

            {/* Browse Dogs */}
            <Link
              href="/dogs"
              className="card-sketchy p-6 hover:shadow-hard-lg transition-shadow wobbly-2 group"
            >
              <span className="text-4xl block mb-3">&#x1f436;</span>
              <h2 className="font-heading text-xl font-bold mb-1 group-hover:text-forest">
                Browse Dogs
              </h2>
              <p className="text-sm opacity-60">
                Explore all available dogs from verified rescues and shelters.
              </p>
            </Link>

            {/* Favorites */}
            <Link
              href="/dashboard/favorites"
              className="card-sketchy p-6 hover:shadow-hard-lg transition-shadow wobbly-3 group"
            >
              <span className="text-4xl block mb-3">&#x2764;</span>
              <h2 className="font-heading text-xl font-bold mb-1 group-hover:text-forest">
                Saved Dogs
              </h2>
              <p className="text-sm opacity-60">
                Dogs you&apos;ve hearted — ready when you are.
              </p>
            </Link>

            {/* Applications */}
            <Link
              href="/dashboard/applications"
              className="card-sketchy p-6 hover:shadow-hard-lg transition-shadow wobbly-4 group"
            >
              <span className="text-4xl block mb-3">&#x1f4cb;</span>
              <h2 className="font-heading text-xl font-bold mb-1 group-hover:text-forest">
                Applications
              </h2>
              <p className="text-sm opacity-60">
                Track your adoption applications and shelter responses.
              </p>
            </Link>

            {/* Dog Park */}
            <Link
              href="/dog-park"
              className="card-sketchy p-6 hover:shadow-hard-lg transition-shadow wobbly-1 group"
            >
              <span className="text-4xl block mb-3">&#x1f3de;&#xfe0f;</span>
              <h2 className="font-heading text-xl font-bold mb-1 group-hover:text-forest">
                Dog Park
              </h2>
              <p className="text-sm opacity-60">
                Watch real rescue dogs roam around. Click one to meet them.
              </p>
            </Link>

            {/* Messages */}
            <div className="card-sketchy p-6 wobbly-2 opacity-60">
              <span className="text-4xl block mb-3">&#x1f4e8;</span>
              <h2 className="font-heading text-xl font-bold mb-1">
                Messages
              </h2>
              <p className="text-sm opacity-60">
                Chat with shelters about your applications. Coming soon!
              </p>
            </div>

            {/* Profile */}
            <Link
              href="/dashboard/profile"
              className="card-sketchy p-6 hover:shadow-hard-lg transition-shadow wobbly-2 group"
            >
              <span className="text-4xl block mb-3">&#x1f464;</span>
              <h2 className="font-heading text-xl font-bold mb-1 group-hover:text-forest">
                Your Profile
              </h2>
              <p className="text-sm opacity-60">
                ID, home photos, references — make applications faster.
              </p>
            </Link>
          </div>

          {/* Account Info */}
          <div className="mt-12 pt-8 border-t-2 border-dashed border-erased">
            <h3 className="font-heading text-lg font-bold mb-3 opacity-60">
              Account
            </h3>
            <p className="text-sm opacity-50">
              Signed in as{" "}
              <strong className="text-forest">{user.email}</strong>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
