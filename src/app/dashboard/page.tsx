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

  return (
    <>
      <Navbar />
      <main className="pt-[100px] pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-heading text-4xl font-bold mb-2">
            Hey, {name}! &#x1f43e;
          </h1>
          <p className="text-lg opacity-60 mb-10">
            Welcome to your Wescue dashboard.
          </p>

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
            <div className="card-sketchy p-6 wobbly-3 opacity-60">
              <span className="text-4xl block mb-3">&#x2764;</span>
              <h2 className="font-heading text-xl font-bold mb-1">
                Saved Dogs
              </h2>
              <p className="text-sm opacity-60">
                Your favorited dogs will appear here. Coming soon!
              </p>
            </div>

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

            {/* Messages */}
            <div className="card-sketchy p-6 wobbly-1 opacity-60">
              <span className="text-4xl block mb-3">&#x1f4e8;</span>
              <h2 className="font-heading text-xl font-bold mb-1">
                Messages
              </h2>
              <p className="text-sm opacity-60">
                Chat with shelters about your applications. Coming soon!
              </p>
            </div>

            {/* Profile */}
            <div className="card-sketchy p-6 wobbly-2 opacity-60">
              <span className="text-4xl block mb-3">&#x1f464;</span>
              <h2 className="font-heading text-xl font-bold mb-1">
                Your Profile
              </h2>
              <p className="text-sm opacity-60">
                Complete your adopter profile for faster applications. Coming soon!
              </p>
            </div>
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
