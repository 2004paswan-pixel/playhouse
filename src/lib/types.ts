export type SlotStatus = "free" | "waiting" | "full";

export type BookingType = "individual" | "group";

export interface Amenity {
  id: string;
  name: string;
  size: "large" | "small";
  /** Path under /public once a real room photo is dropped in, e.g. "/rooms/gym.jpg" */
  image: string | null;
  bookingType: BookingType;
  /**
   * "individual" (e.g. Gym): how many people can independently hold a
   * confirmed spot in the same slot.
   * "group" (music/dance/pickleball): always 1 — one group occupies the
   * whole slot.
   */
  capacityPerSlot: number;
  /** "group" amenities only: max people per group, booker included. */
  groupSize?: number;
  /** Optional cap on how many can be on the waiting list for a slot. */
  waitlistCap?: number;
  /** XP cost to confirm a booking — joining a waitlist is always free. */
  xpCost: { offPeak: number; peak: number };
}

export interface BookingEntry {
  name: string;
  status: "confirmed" | "waiting";
  /** "group" amenities only: extra members the booker added, not incl. themself. */
  guests?: string[];
}

export interface TimeSlot {
  id: string; // `${amenityId}-${start}`
  start: string; // "06:00"
  end: string; // "06:30"
  capacity: number;
  bookings: BookingEntry[];
}

export function slotStatus(slot: TimeSlot): SlotStatus {
  const confirmed = slot.bookings.filter((b) => b.status === "confirmed").length;
  const waiting = slot.bookings.filter((b) => b.status === "waiting").length;
  if (confirmed < slot.capacity) return "free";
  if (waiting > 0) return "waiting";
  return "full";
}
