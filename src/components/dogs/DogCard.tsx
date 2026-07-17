import Link from "next/link";
import type { Dog } from "@/types";

const WOBBLY_VARIANTS = [
  "255px 15px 225px 15px / 15px 225px 15px 255px",
  "15px 255px 15px 225px / 225px 15px 255px 15px",
  "30px 255px 20px 255px / 255px 30px 255px 20px",
  "255px 20px 225px 20px / 20px 225px 20px 255px",
];

const ROTATIONS = ["-1.5deg", "0.8deg", "-0.5deg", "1.2deg", "-1deg", "0.6deg"];
const TAPE_ROTATIONS = ["-2deg", "1.5deg", "-1deg", "2.5deg", "-1.8deg", "0.8deg"];
const TAPE_VARIANTS = ["tape", "tape tape-warm", "tape tape-sage", "tape tape-wide", "tape", "tape tape-warm"];

const BG_COLORS = ["#d4edda", "#dce8f0", "#f0e0e8", "#e8e0d4", "#fff3cd", "#e0ddd5"];

function formatFee(cents: number | null): string {
  if (!cents) return "Ask";
  return `$${Math.round(cents / 100)}`;
}

function formatAge(years: number | null, months: number | null): string {
  if (years && years > 0) return `${years} yr${years > 1 ? "s" : ""}`;
  if (months && months > 0) return `${months} mo`;
  return "Unknown";
}

export function DogCard({
  dog,
  index = 0,
  headerAction,
}: {
  dog: Dog;
  index?: number;
  headerAction?: React.ReactNode;
}) {
  const wobbly = WOBBLY_VARIANTS[index % WOBBLY_VARIANTS.length];
  const rotation = ROTATIONS[index % ROTATIONS.length];
  const bgColor = BG_COLORS[index % BG_COLORS.length];
  const tapeClass = TAPE_VARIANTS[index % TAPE_VARIANTS.length];
  const tapeRotation = TAPE_ROTATIONS[index % TAPE_ROTATIONS.length];

  const photoUrl = dog.photos?.[0];

  return (
    <div className="relative pt-3">
      {/* tape — outside the link so it doesn't interfere */}
      <div
        className={`${tapeClass} absolute top-0 left-1/2 -translate-x-1/2 w-[90px] z-10`}
        style={{ transform: `translateX(-50%) rotate(${tapeRotation})` }}
      />

      <div
        className="card-sketchy overflow-hidden relative hover:rotate-[-1deg]"
        style={{ borderRadius: wobbly, transform: `rotate(${rotation})` }}
      >
        {/* Heart button sits above the link, not inside it */}
        {headerAction && (
          <div className="absolute top-2 right-2 z-20">{headerAction}</div>
        )}

        <Link href={`/dogs/${dog.id}`} className="block cursor-pointer">
          <div
            className="h-[240px] flex items-center justify-center relative border-b-3 border-pencil"
            style={{ backgroundColor: bgColor }}
          >
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={dog.name}
                className="w-full h-full object-cover object-top"
              />
            ) : (
              <span className="text-[5rem]">&#x1f436;</span>
            )}

            {dog.good_with_kids && (
              <span
                className="absolute top-2.5 left-2.5 bg-forest text-white font-heading text-xs font-bold px-3 py-1 border-2 border-pencil shadow-[2px_2px_0px_0px_#2d2d2d]"
                style={{ borderRadius: wobbly }}
              >
                Great with kids
              </span>
            )}
          </div>

          <div className="p-4">
            <h3 className="font-heading text-2xl font-bold">{dog.name}</h3>
            <p className="text-sm opacity-60 mb-2">
              {dog.breed_primary ?? "Mixed"} &middot;{" "}
              {formatAge(dog.age_years, dog.age_months)} &middot;{" "}
              {dog.size?.charAt(0).toUpperCase() + dog.size?.slice(1)}
            </p>

            {dog.personality && (
              <p className="text-base leading-snug opacity-80 mb-3 line-clamp-2">
                {dog.personality}
              </p>
            )}

            <div className="flex flex-wrap gap-1.5 mb-3">
              <span className="px-2.5 py-0.5 border-2 border-erased text-xs bg-paper wobbly-1">
                {dog.energy_level?.charAt(0).toUpperCase() +
                  dog.energy_level?.slice(1)}{" "}
                Energy
              </span>
              {dog.house_trained && (
                <span className="px-2.5 py-0.5 border-2 border-erased text-xs bg-paper wobbly-2">
                  House Trained
                </span>
              )}
            </div>

            <div className="flex justify-between items-center pt-3 border-t-2 border-dashed border-erased">
              <span className="text-sm opacity-50">
                {dog.shelter?.name ?? "Local Shelter"}
              </span>
              <span className="font-heading font-bold text-lg text-forest">
                {formatFee(dog.adoption_fee_cents)}
              </span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
