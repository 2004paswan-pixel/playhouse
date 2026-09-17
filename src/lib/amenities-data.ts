import { Amenity, BookingEntry, TimeSlot } from "./types";

// Slots run continuously across the whole bookable day — no morning/
// afternoon/evening split. 06:00–22:00 in 30-min steps = 32 slots.
export const DAY_WINDOW = { start: "06:00", end: "22:00" };

// Historically-busier windows — used only for a small "Peak" tag on the
// slot, not to split the calendar into sections.
export const PEAK_WINDOWS = [
  { start: "06:00", end: "09:00" },
  { start: "12:30", end: "14:00" },
  { start: "17:00", end: "22:00" },
];

export const AMENITIES: Amenity[] = [
  {
    id: "gym",
    name: "Gym",
    size: "large",
    image: "/rooms/gym.webp",
    bookingType: "individual",
    capacityPerSlot: 30,
    waitlistCap: 5,
    xpCost: { offPeak: 10, peak: 20 },
  },
  {
    id: "music-room-1",
    name: "Music Room 1",
    size: "small",
    image: "/rooms/music-room-1.jpg",
    bookingType: "group",
    capacityPerSlot: 1,
    groupSize: 5,
    xpCost: { offPeak: 25, peak: 50 },
  },
  {
    id: "music-room-2",
    name: "Music Room 2",
    size: "small",
    image: "/rooms/music-room-2.jpg",
    bookingType: "group",
    capacityPerSlot: 1,
    groupSize: 5,
    xpCost: { offPeak: 25, peak: 50 },
  },
  {
    id: "dance-room",
    name: "Dance Room",
    size: "small",
    image: "/rooms/dance-room.jpg",
    bookingType: "group",
    capacityPerSlot: 1,
    groupSize: 5,
    xpCost: { offPeak: 25, peak: 50 },
  },
  {
    id: "pickleball-court",
    name: "Pickleball Court",
    size: "small",
    image: "/rooms/pickleball-court.png",
    bookingType: "group",
    capacityPerSlot: 1,
    groupSize: 4,
    xpCost: { offPeak: 25, peak: 50 },
  },
];

function toMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function toTimeStr(mins: number): string {
  const h = Math.floor(mins / 60)
    .toString()
    .padStart(2, "0");
  const m = (mins % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

export function isPeak(start: string): boolean {
  return PEAK_WINDOWS.some((w) => start >= w.start && start < w.end);
}

/** XP charged for a CONFIRMED booking of this slot. Waitlist joins are free. */
export function xpCostFor(amenity: Amenity, start: string): number {
  return isPeak(start) ? amenity.xpCost.peak : amenity.xpCost.offPeak;
}

const NAMES = [
  "Ananya Rao",
  "Kabir Sen",
  "Meher Iyer",
  "Vivaan Shah",
  "Ishaan Gupta",
  "Diya Kapoor",
  "Aarav Mehta",
  "Sara Khan",
];

function hashOf(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) % 997;
  return hash;
}

// Deterministic pseudo-random fill so the demo shows a mix of
// free / waiting-list / full slots without a real backend yet.
function seededFillIndividual(seed: string, capacity: number, waitlistCap: number): BookingEntry[] {
  const bucket = hashOf(seed) % 5;

  if (bucket === 0) return []; // fully free
  if (bucket === 1) {
    const count = Math.min(Math.floor(capacity / 3), NAMES.length);
    return NAMES.slice(0, count).map((name) => ({ name, status: "confirmed" as const }));
  }
  if (bucket === 2) {
    // full, no waitlist yet
    return Array.from({ length: capacity }, (_, i) => ({
      name: NAMES[i % NAMES.length] + (i >= NAMES.length ? ` ${i}` : ""),
      status: "confirmed" as const,
    }));
  }
  if (bucket === 3) {
    // full + partial waitlist
    const confirmed = Array.from({ length: capacity }, (_, i) => ({
      name: NAMES[i % NAMES.length] + (i >= NAMES.length ? ` ${i}` : ""),
      status: "confirmed" as const,
    }));
    const waitCount = Math.min(2, waitlistCap);
    const waiting = NAMES.slice(0, waitCount).map((name) => ({
      name: `${name} (Jr)`,
      status: "waiting" as const,
    }));
    return [...confirmed, ...waiting];
  }
  return NAMES.slice(0, 1).map((name) => ({ name, status: "confirmed" as const }));
}

function seededFillGroup(seed: string, groupSize: number): BookingEntry[] {
  const bucket = hashOf(seed) % 4;

  if (bucket === 0) return []; // room free, no group booked yet
  if (bucket === 3) {
    // room taken + someone else waiting for it
    return [
      {
        name: NAMES[hashOf(seed + "b") % NAMES.length],
        status: "confirmed",
        guests: NAMES.slice(1, 1 + (hashOf(seed + "g") % groupSize)),
      },
      { name: NAMES[(hashOf(seed + "w") + 3) % NAMES.length], status: "waiting" },
    ];
  }
  // room taken by a group of varying size, no one waiting
  const guestCount = hashOf(seed + "n") % groupSize; // 0..groupSize-1
  return [
    {
      name: NAMES[hashOf(seed) % NAMES.length],
      status: "confirmed",
      guests: NAMES.filter((n) => n !== NAMES[hashOf(seed) % NAMES.length]).slice(0, guestCount),
    },
  ];
}

export function getSlotsForAmenity(amenityId: string): TimeSlot[] {
  const amenity = AMENITIES.find((a) => a.id === amenityId);
  if (!amenity) return [];

  const slots: TimeSlot[] = [];
  let cursor = toMinutes(DAY_WINDOW.start);
  const end = toMinutes(DAY_WINDOW.end);
  while (cursor < end) {
    const start = toTimeStr(cursor);
    const slotEnd = toTimeStr(cursor + 30);
    const id = `${amenityId}-${start}`;
    const bookings =
      amenity.bookingType === "individual"
        ? seededFillIndividual(id, amenity.capacityPerSlot, amenity.waitlistCap ?? 99)
        : seededFillGroup(id, amenity.groupSize ?? 4);
    slots.push({
      id,
      start,
      end: slotEnd,
      capacity: amenity.capacityPerSlot,
      bookings,
    });
    cursor += 30;
  }
  return slots;
}
