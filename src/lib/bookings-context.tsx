"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { AMENITIES, getSlotsForAmenity } from "./amenities-data";
import { TimeSlot } from "./types";

export const CURRENT_USER = "You";
const STORAGE_KEY = "playhouse-slots-v1";

type SlotsByAmenity = Record<string, TimeSlot[]>;

function loadInitial(): SlotsByAmenity {
  const fresh: SlotsByAmenity = {};
  for (const a of AMENITIES) fresh[a.id] = getSlotsForAmenity(a.id);

  if (typeof window === "undefined") return fresh;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fresh;
    const saved = JSON.parse(raw) as SlotsByAmenity;
    return { ...fresh, ...saved };
  } catch {
    return fresh;
  }
}

export interface MyBooking {
  amenityId: string;
  amenityName: string;
  slot: TimeSlot;
  status: "confirmed" | "waiting";
  guests?: string[];
}

interface BookingsContextValue {
  getSlots: (amenityId: string) => TimeSlot[];
  /** Returns false when the join was blocked (e.g. waitlist is full). */
  book: (amenityId: string, slotId: string) => boolean;
  cancel: (amenityId: string, slotId: string) => void;
  addGuest: (amenityId: string, slotId: string, guestName: string) => void;
  removeGuest: (amenityId: string, slotId: string, guestIndex: number) => void;
  myBookings: MyBooking[];
}

const BookingsContext = createContext<BookingsContextValue | null>(null);

export function BookingsProvider({ children }: { children: ReactNode }) {
  const [slotsByAmenity, setSlotsByAmenity] = useState<SlotsByAmenity>(loadInitial);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slotsByAmenity));
    } catch {
      // best-effort only
    }
  }, [slotsByAmenity]);

  function getSlots(amenityId: string): TimeSlot[] {
    return slotsByAmenity[amenityId] ?? getSlotsForAmenity(amenityId);
  }

  function book(amenityId: string, slotId: string): boolean {
    const amenity = AMENITIES.find((a) => a.id === amenityId);
    if (!amenity) return false;

    let blocked = false;
    setSlotsByAmenity((prev) => {
      const slots = prev[amenityId] ?? getSlotsForAmenity(amenityId);
      const updated = slots.map((s) => {
        if (s.id !== slotId) return s;
        if (s.bookings.some((b) => b.name === CURRENT_USER)) return s;

        const confirmedCount = s.bookings.filter((b) => b.status === "confirmed").length;
        const waitingCount = s.bookings.filter((b) => b.status === "waiting").length;
        const isFree = confirmedCount < s.capacity;

        if (!isFree && amenity.waitlistCap != null && waitingCount >= amenity.waitlistCap) {
          blocked = true;
          return s;
        }

        return {
          ...s,
          bookings: [
            ...s.bookings,
            {
              name: CURRENT_USER,
              status: isFree ? ("confirmed" as const) : ("waiting" as const),
              guests: amenity.bookingType === "group" && isFree ? [] : undefined,
            },
          ],
        };
      });
      return { ...prev, [amenityId]: updated };
    });
    return !blocked;
  }

  function cancel(amenityId: string, slotId: string) {
    setSlotsByAmenity((prev) => {
      const slots = prev[amenityId] ?? getSlotsForAmenity(amenityId);
      const updated = slots.map((s) =>
        s.id !== slotId
          ? s
          : { ...s, bookings: s.bookings.filter((b) => b.name !== CURRENT_USER) }
      );
      return { ...prev, [amenityId]: updated };
    });
  }

  function addGuest(amenityId: string, slotId: string, guestName: string) {
    const name = guestName.trim();
    if (!name) return;
    const amenity = AMENITIES.find((a) => a.id === amenityId);
    if (!amenity || amenity.bookingType !== "group") return;

    setSlotsByAmenity((prev) => {
      const slots = prev[amenityId] ?? getSlotsForAmenity(amenityId);
      const updated = slots.map((s) => {
        if (s.id !== slotId) return s;
        return {
          ...s,
          bookings: s.bookings.map((b) => {
            if (b.name !== CURRENT_USER || b.status !== "confirmed") return b;
            const guests = b.guests ?? [];
            const maxGuests = (amenity.groupSize ?? 1) - 1;
            if (guests.length >= maxGuests) return b;
            return { ...b, guests: [...guests, name] };
          }),
        };
      });
      return { ...prev, [amenityId]: updated };
    });
  }

  function removeGuest(amenityId: string, slotId: string, guestIndex: number) {
    setSlotsByAmenity((prev) => {
      const slots = prev[amenityId] ?? getSlotsForAmenity(amenityId);
      const updated = slots.map((s) => {
        if (s.id !== slotId) return s;
        return {
          ...s,
          bookings: s.bookings.map((b) => {
            if (b.name !== CURRENT_USER || !b.guests) return b;
            return { ...b, guests: b.guests.filter((_, i) => i !== guestIndex) };
          }),
        };
      });
      return { ...prev, [amenityId]: updated };
    });
  }

  const myBookings = useMemo<MyBooking[]>(() => {
    const list: MyBooking[] = [];
    for (const amenity of AMENITIES) {
      const slots = slotsByAmenity[amenity.id] ?? [];
      for (const slot of slots) {
        const mine = slot.bookings.find((b) => b.name === CURRENT_USER);
        if (mine) {
          list.push({
            amenityId: amenity.id,
            amenityName: amenity.name,
            slot,
            status: mine.status,
            guests: mine.guests,
          });
        }
      }
    }
    return list.sort((a, b) => a.slot.start.localeCompare(b.slot.start));
  }, [slotsByAmenity]);

  return (
    <BookingsContext.Provider
      value={{ getSlots, book, cancel, addGuest, removeGuest, myBookings }}
    >
      {children}
    </BookingsContext.Provider>
  );
}

export function useBookings() {
  const ctx = useContext(BookingsContext);
  if (!ctx) throw new Error("useBookings must be used within BookingsProvider");
  return ctx;
}
