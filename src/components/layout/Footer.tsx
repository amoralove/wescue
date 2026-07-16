import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-pencil text-white py-14 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="font-heading text-2xl font-bold text-forest-pale mb-2 flex items-center gap-1">
              <span>&#x1f43e;</span> wescues
            </div>
            <p className="text-white/50 text-base max-w-[280px]">
              Making rescue dog adoption easier, faster, and better matched.
            </p>
          </div>

          <div>
            <h4 className="font-heading font-bold text-forest-pale mb-3">
              Platform
            </h4>
            <Link href="/#how-it-works" className="block text-white/50 hover:text-white mb-2">
              How It Works
            </Link>
            <Link href="/chat" className="block text-white/50 hover:text-white mb-2">
              Find a Dog
            </Link>
            <Link href="/dogs" className="block text-white/50 hover:text-white mb-2">
              Browse Dogs
            </Link>
          </div>

          <div>
            <h4 className="font-heading font-bold text-forest-pale mb-3">
              Company
            </h4>
            <Link href="#" className="block text-white/50 hover:text-white mb-2">About</Link>
            <Link href="#" className="block text-white/50 hover:text-white mb-2">Mission</Link>
            <Link href="#" className="block text-white/50 hover:text-white mb-2">Contact</Link>
          </div>

          <div>
            <h4 className="font-heading font-bold text-forest-pale mb-3">
              Legal
            </h4>
            <Link href="#" className="block text-white/50 hover:text-white mb-2">Privacy Policy</Link>
            <Link href="#" className="block text-white/50 hover:text-white mb-2">Terms of Service</Link>
          </div>
        </div>

        <div className="border-t-2 border-dashed border-white/15 pt-5 text-center">
          <p className="text-white/40 text-sm">
            &copy; {new Date().getFullYear()} Wescues. Shelter-first, always. &#x1f43e;
          </p>
        </div>
      </div>
    </footer>
  );
}
