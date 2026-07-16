import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="pt-[140px] pb-20 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h1 className="font-heading text-4xl md:text-[3.4rem] font-bold leading-tight mb-2">
              Find your perfect rescue dog
              <span className="text-forest">.</span>
            </h1>
            <p className="font-heading text-xl md:text-2xl font-bold text-forest mb-4">
              No breeders. No puppy mills. Ever.
            </p>
            <p className="text-lg md:text-xl opacity-75 max-w-[480px] mb-8 leading-relaxed">
              Every dog on Wescues comes from a verified shelter or rescue.
              Just tell us about your life, and we&apos;ll match you with
              dogs that actually fit.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link href="/chat" className="btn-sketchy btn-primary text-lg px-8 py-4">
                Start Matching!
              </Link>
              <Link href="#how-it-works" className="btn-sketchy bg-erased text-lg px-8 py-4">
                How does it work?
              </Link>
            </div>
          </div>

          <div className="flex items-center justify-center relative pt-4">
            {/* tape across top of hero card */}
            <div
              className="tape tape-sage absolute w-[120px] z-10"
              style={{ top: "-2px", left: "50%", transform: "translateX(-50%) rotate(-2deg)" }}
            />
            <div
              className="bg-paper-alt border-3 border-pencil shadow-[8px_8px_0px_0px_#2d2d2d] p-10 text-center rotate-2"
              style={{
                borderRadius:
                  "255px 15px 225px 15px / 15px 225px 15px 255px",
              }}
            >
              <span className="text-[7rem] block mb-3 animate-[wiggle_3s_ease-in-out_infinite]">
                &#x1f436;
              </span>
              <p className="font-heading text-xl font-bold text-forest">
                your new best friend is waiting!
              </p>
            </div>
            <div className="hidden md:block absolute -top-5 -right-5 w-[50px] h-[50px] bg-forest border-3 border-pencil blob-1 animate-[bounce-gentle_3s_ease-in-out_infinite]" />
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-[700px] mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { num: "6.3M", label: "dogs enter shelters yearly", blob: "blob-1" },
            { num: "50%", label: "still waiting for homes", blob: "blob-2" },
            { num: "~5 min", label: "to find your match", blob: "blob-1" },
          ].map((stat) => (
            <div
              key={stat.num}
              className={`card-sketchy ${stat.blob} p-6 text-center hover:rotate-[-2deg]`}
            >
              <span className="block font-heading text-3xl font-bold text-forest">
                {stat.num}
              </span>
              <span className="text-sm opacity-60">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <div
            className="inline-block bg-forest text-white font-heading font-bold text-base px-5 py-1.5 border-3 border-pencil shadow-[4px_4px_0px_0px_#2d2d2d] mb-4 -rotate-2"
            style={{
              borderRadius:
                "255px 15px 225px 15px / 15px 225px 15px 255px",
            }}
          >
            How It Works
          </div>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-12">
            Three steps. Five minutes.
            <br />
            One perfect match.
          </h2>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            {[
              {
                n: "1",
                icon: "\u{1F4AC}",
                title: "Chat with our AI",
                desc: "Tell us about your home, lifestyle, and family. It's a conversation, not a form!",
                rot: "-1.5deg",
              },
              {
                n: "2",
                icon: "❤",
                title: "Get matched",
                desc: "We recommend shelter dogs by energy, temperament, and real compatibility.",
                rot: "1deg",
              },
              {
                n: "3",
                icon: "\u{1F3E0}",
                title: "Apply & adopt",
                desc: "Apply with one click using your pre-filled profile. Meet your new best friend!",
                rot: "-0.8deg",
              },
            ].map((step) => (
              <div
                key={step.n}
                className="card-sketchy p-8 w-full max-w-[300px] text-center relative hover:rotate-1"
                style={{
                  borderRadius:
                    "30px 255px 20px 255px / 255px 30px 255px 20px",
                  transform: `rotate(${step.rot})`,
                }}
              >
                <div className="absolute -top-4 -left-3 w-10 h-10 bg-forest text-white font-heading text-lg font-bold flex items-center justify-center border-3 border-pencil blob-1 shadow-[2px_2px_0px_0px_#2d2d2d] z-10">
                  {step.n}
                </div>
                <div className="text-5xl mb-3">{step.icon}</div>
                <h3 className="font-heading text-xl font-bold mb-2">
                  {step.title}
                </h3>
                <p className="opacity-70">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Wescues */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div
            className="inline-block bg-forest text-white font-heading font-bold text-base px-5 py-1.5 border-3 border-pencil shadow-[4px_4px_0px_0px_#2d2d2d] mb-4 -rotate-2"
            style={{
              borderRadius:
                "255px 15px 225px 15px / 15px 225px 15px 255px",
            }}
          >
            Why Wescues?
          </div>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-12">
            We&apos;re building adoption
            <br />
            the way it should be.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7 text-left">
            {[
              {
                icon: "\u{1F50D}",
                title: "Smarter than search",
                desc: "Tell us about your life and we'll find the right dogs. No more endless scrolling.",
                rot: "-1deg",
                highlight: false,
              },
              {
                icon: "\u{1F4CB}",
                title: "One app, every shelter",
                desc: "Your profile travels with you. No more repeating the same long form.",
                rot: "0.8deg",
                highlight: false,
              },
              {
                icon: "\u{1F3AF}",
                title: "Better matches",
                desc: "We optimize for lifelong placements. A matched dog is a dog that stays.",
                rot: "-0.5deg",
                highlight: false,
              },
              {
                icon: "\u{1F6E1}",
                title: "Verified rescues only",
                desc: "Other platforms mix shelters with breeders. We eliminated that problem entirely.",
                rot: "1.2deg",
                highlight: true,
              },
              {
                icon: "\u{1F436}",
                title: "Every dog gets seen",
                desc: "Our algorithm surfaces seniors, special needs dogs, and overlooked breeds.",
                rot: "-1.3deg",
                highlight: false,
              },
              {
                icon: "\u{1F4B0}",
                title: "Always free",
                desc: "We'll never charge adopters. Adoption should be accessible.",
                rot: "0.6deg",
                highlight: false,
              },
            ].map((f) => (
              <div
                key={f.title}
                className={`card-sketchy p-7 relative hover:rotate-[-1deg] ${
                  f.highlight
                    ? "bg-paper-alt border-forest shadow-[4px_4px_0px_0px_#2d6a4f]"
                    : ""
                }`}
                style={{
                  borderRadius:
                    "255px 15px 225px 15px / 15px 225px 15px 255px",
                  transform: `rotate(${f.rot})`,
                }}
              >
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-heading text-xl font-bold mb-2">
                  {f.title}
                </h3>
                <p className="opacity-70 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Shelters */}
      <section id="shelters" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <div>
            <div
              className="inline-block bg-forest text-white font-heading font-bold text-base px-5 py-1.5 border-3 border-pencil shadow-[4px_4px_0px_0px_#2d2d2d] mb-4 -rotate-2"
              style={{
                borderRadius:
                  "255px 15px 225px 15px / 15px 225px 15px 255px",
              }}
            >
              For Shelters
            </div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              We bring you
              <br />
              better adopters.
            </h2>
            <p className="text-lg opacity-70 mb-8 leading-relaxed">
              Pre-qualified, lifestyle-matched, and ready to commit. Less
              time screening, more time saving lives.
            </p>
            <ul className="space-y-0 mb-8">
              {[
                ["Pre-qualified applicants.", "Adopters arrive with lifestyle data already collected."],
                ["Every dog gets visibility.", "Our algorithm ensures overlooked dogs reach the right people."],
                ["Reduce returns.", "Better matches mean longer-lasting adoptions."],
                ["Free to join.", "Wescues is free for shelters. Always will be."],
              ].map(([strong, rest]) => (
                <li
                  key={strong}
                  className="flex gap-3 py-3.5 border-b-2 border-dashed border-erased"
                >
                  <span className="text-forest text-lg shrink-0">&#x2714;</span>
                  <span>
                    <strong>{strong}</strong> {rest}
                  </span>
                </li>
              ))}
            </ul>
            <Link href="/shelter/register" className="btn-sketchy btn-primary text-lg px-8 py-4">
              Register Your Shelter
            </Link>
          </div>

          <div
            className="bg-forest-dark text-white border-3 border-pencil shadow-[8px_8px_0px_0px_#2d2d2d] p-9 rotate-1 relative"
            style={{
              borderRadius:
                "255px 15px 225px 15px / 15px 225px 15px 255px",
            }}
          >
            <div className="absolute top-[-8px] left-1/2 -translate-x-1/2 rotate-2 w-[80px] h-[22px] bg-forest/30 border border-pencil/10 rounded" />
            <h3 className="font-heading text-2xl font-bold mb-7">
              The problem we&apos;re solving
            </h3>
            {[
              { num: "~20%", desc: "of adopted dogs are returned within the first year" },
              { num: "70%", desc: "of returns cite lifestyle incompatibility" },
              { num: "45 min", desc: "average time shelters spend per application review" },
            ].map((s) => (
              <div key={s.num} className="mb-6 last:mb-0">
                <span className="block font-heading text-4xl font-bold text-warm">
                  {s.num}
                </span>
                <span className="text-base opacity-80">{s.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 bg-forest-dark text-white text-center"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      >
        <h2 className="font-heading text-3xl md:text-4xl font-bold mb-3">
          Every dog deserves a home that fits.
        </h2>
        <p className="text-xl opacity-80 mb-8">
          Start a conversation and meet your match in minutes.
        </p>
        <Link
          href="/chat"
          className="btn-sketchy bg-warm text-forest-dark border-pencil text-xl px-10 py-4 hover:bg-white"
        >
          Start Matching!
        </Link>
      </section>

      <Footer />
    </>
  );
}
