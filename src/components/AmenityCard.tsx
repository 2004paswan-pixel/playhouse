import Link from "next/link";
import { Dumbbell, Music, Footprints, CircleDot, ArrowUpRight } from "lucide-react";
import { Amenity } from "@/lib/types";

const ICONS: Record<string, typeof Dumbbell> = {
  gym: Dumbbell,
  "music-room-1": Music,
  "music-room-2": Music,
  "dance-room": Footprints,
  "pickleball-court": CircleDot,
};

// Distinct gradient per amenity so cards read differently even without a
// real photo yet — swap in `amenity.image` and this is skipped entirely.
const PLACEHOLDER_GRADIENTS: Record<string, string> = {
  gym: "from-[#2a2f1a] via-[#131417] to-[#131417]",
  "music-room-1": "from-[#1a1f2a] via-[#131417] to-[#131417]",
  "music-room-2": "from-[#241a2a] via-[#131417] to-[#131417]",
  "dance-room": "from-[#2a1a22] via-[#131417] to-[#131417]",
  "pickleball-court": "from-[#1a2a24] via-[#131417] to-[#131417]",
};

export default function AmenityCard({ amenity }: { amenity: Amenity }) {
  const Icon = ICONS[amenity.id] ?? Dumbbell;
  const isLarge = amenity.size === "large";

  return (
    <Link
      href={`/amenities/${amenity.id}`}
      className="group relative flex h-full min-h-0 w-full flex-col justify-end overflow-hidden rounded-xl border border-border bg-surface shadow-[0_10px_28px_-12px_rgba(0,0,0,0.6)] transition-all duration-300 ease-out active:scale-[0.97] active:border-accent/60 active:shadow-[0_20px_45px_-15px_rgba(0,0,0,0.7)] hover:-translate-y-1 hover:border-accent/70 hover:shadow-[0_20px_45px_-15px_rgba(0,0,0,0.65)]"
    >
      {amenity.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={amenity.image}
          alt={amenity.name}
          className="absolute inset-0 h-full w-full object-cover brightness-90 saturate-[1.05] transition-transform duration-500 ease-out group-hover:scale-110 group-hover:brightness-100"
        />
      ) : (
        <div
          className={`absolute inset-0 bg-gradient-to-br transition-transform duration-500 ease-out group-hover:scale-110 ${PLACEHOLDER_GRADIENTS[amenity.id] ?? "from-surface-2 to-surface"}`}
        >
          <Icon
            size={isLarge ? 120 : 64}
            className="absolute -right-3 -top-3 text-foreground/5"
          />
        </div>
      )}

      {/* base vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/15 to-transparent" />
      {/* accent glow that fades in on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-accent/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-active:opacity-100 group-hover:opacity-100" />
      {/* inner ring for a bit of polish */}
      <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/5" />

      <div className={`relative z-10 flex items-end justify-between gap-1.5 ${isLarge ? "p-3.5 sm:p-6" : "p-2.5 sm:p-4"}`}>
        <div className="min-w-0">
          <h3
            className={`truncate font-display italic leading-none text-foreground ${
              isLarge
                ? "text-[1.6rem] sm:text-[2.1rem] md:text-[clamp(1.9rem,5.2vh,3.4rem)]"
                : "text-[0.95rem] sm:text-lg md:text-[clamp(1.15rem,3.2vh,1.85rem)]"
            }`}
          >
            {amenity.name}
          </h3>
          <p
            className={`hidden items-center gap-1 text-accent transition-all duration-300 sm:flex ${
              isLarge ? "mt-1.5 text-sm" : "mt-1 text-xs"
            } translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100`}
          >
            View slots <ArrowUpRight size={isLarge ? 14 : 12} />
          </p>
        </div>
        <div
          className={`flex shrink-0 items-center justify-center rounded-full bg-black/50 text-accent backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 ${
            isLarge ? "h-8 w-8 sm:h-12 sm:w-12" : "h-6 w-6 sm:h-8 sm:w-8"
          }`}
        >
          <Icon size={isLarge ? 17 : 12} className="sm:hidden" />
          <Icon size={isLarge ? 24 : 15} className="hidden sm:block" />
        </div>
      </div>
    </Link>
  );
}
