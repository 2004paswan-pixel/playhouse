import Header from "@/components/Header";
import AmenityCard from "@/components/AmenityCard";
import { AMENITIES } from "@/lib/amenities-data";

export default function Home() {
  const gym = AMENITIES.find((a) => a.id === "gym")!;
  const others = AMENITIES.filter((a) => a.id !== "gym");

  return (
    <div className="relative flex h-screen flex-col overflow-hidden text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 left-1/4 h-80 w-80 rounded-full bg-accent/10 blur-[110px]" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-accent/5 blur-[100px]" />
      </div>

      <Header />
      <main className="mx-auto flex w-full max-w-6xl min-h-0 flex-1 flex-col px-3.5 pt-2.5 pb-20 sm:px-6 sm:py-4">
        <div className="mb-2 shrink-0 sm:mb-4">
          <h1 className="font-display text-[1.5rem] italic leading-none sm:text-[clamp(2.1rem,6vh,3.75rem)]">
            Amenities
          </h1>
          <p className="mt-1 text-[0.72rem] text-muted sm:text-[clamp(0.9rem,2vh,1.15rem)]">
            Pick one to see the day&apos;s slots and book in.
          </p>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-2.5 sm:gap-4 md:flex-row">
          <div className="min-h-0 flex-1 md:flex-none md:basis-[36%]">
            <AmenityCard amenity={gym} />
          </div>
          <div className="grid min-h-0 flex-[1.4] grid-cols-2 auto-rows-fr gap-2.5 sm:gap-4 md:flex-1">
            {others.map((a) => (
              <AmenityCard key={a.id} amenity={a} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
