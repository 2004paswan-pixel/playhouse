"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { AMENITIES, getSlotsForAmenity, xpCostFor } from "./amenities-data";
import { TimeSlot } from "./types";

export const CURRENT_USER = "You";
const STORAGE_KEY = "playhouse-state-v1";
const STARTING_XP = 100;

type SlotsByAmenity = Record<string, TimeSlot[]>;
interface PersistedState {
  slotsByAmenity: SlotsByAmenity;
  xp: number;
}

function loadInitial(): PersistedState {
  const freshSlots: SlotsByAmenity = {};
  for (const a of AMENITIES) freshSlots[a.id] = getSlotsForAmenity(a.id);
  const fresh: PersistedState = { slotsByAmenity: freshSlots, xp: STARTING_XP };

  if (typeof window === "undefined") return fresh;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fresh;
    const saved = JSON.parse(raw) as Partial<PersistedState>;
    return {
      slotsByAmenity: { ...freshSlots, ...saved.slotsByAmenity },
      xp: typeof saved.xp === "number" ? saved.xp : STARTING_XP,
    };
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

export type BookResult = "booked" | "waitlisted" | "waitlist-full" | "insufficient-xp";

interface BookingsContextValue {
  getSlots: (amenityId: string) => TimeSlot[];
  xp: number;
  book: (amenityId: string, slotId: string) => BookResult;
  cancel: (amenityId: string, slotId: string) => void;
  addGuest: (amenityId: string, slotId: string, guestName: string) => void;
  removeGuest: (amenityId: string, slotId: string, guestIndex: number) => void;
  myBookings: MyBooking[];
}

const BookingsContext = createContext<BookingsContextValue | null>(null);

export function BookingsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(loadInitial);
  const { slotsByAmenity, xp } = state;

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // best-effort only
    }
  }, [state]);

  function updateSlots(amenityId: string, updater: (slots: TimeSlot[]) => TimeSlot[]) {
    setState((prev) => {
      const slots = prev.slotsByAmenity[amenityId] ?? getSlotsForAmenity(amenityId);
      return {
        ...prev,
        slotsByAmenity: { ...prev.slotsByAmenity, [amenityId]: updater(slots) },
      };
    });
  }

  function getSlots(amenityId: string): TimeSlot[] {
    return slotsByAmenity[amenityId] ?? getSlotsForAmenity(amenityId);
  }

  function book(amenityId: string, slotId: string): BookResult {
    const amenity = AMENITIES.find((a) => a.id === amenityId);
    if (!amenity) return "waitlist-full";

    let result: BookResult = "booked";
    setState((prev) => {
      const slots = prev.slotsByAmenity[amenityId] ?? getSlotsForAmenity(amenityId);
      const updated = slots.map((s) => {
        if (s.id !== slotId) return s;
        if (s.bookings.some((b) => b.name === CURRENT_USER)) return s;

        const confirmedCount = s.bookings.filter((b) => b.status === "confirmed").length;
        const waitingCount = s.bookings.filter((b) => b.status === "waiting").length;
        const isFree = confirmedCount < s.capacity;

        if (!isFree && amenity.waitlistCap != null && waitingCount >= amenity.waitlistCap) {
          result = "waitlist-full";
          return s;
        }

        // Confirmed bookings cost XP; joining a waitlist is always free.
        if (isFree && prev.xp < xpCostFor(amenity, s.start)) {
          result = "insufficient-xp";
          return s;
        }

        result = isFree ? "booked" : "waitlisted";
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

      if (result === "waitlist-full" || result === "insufficient-xp") return prev;

      const charged = result === "booked" ? xpCostFor(amenity, slots.find((s) => s.id === slotId)!.start) : 0;
      return {
        slotsByAmenity: { ...prev.slotsByAmenity, [amenityId]: updated },
        xp: prev.xp - charged,
      };
    });
    return result;
  }

  function cancel(amenityId: string, slotId: string) {
    const amenity = AMENITIES.find((a) => a.id === amenityId);
    setState((prev) => {
      const slots = prev.slotsByAmenity[amenityId] ?? getSlotsForAmenity(amenityId);
      const mine = slots.find((s) => s.id === slotId)?.bookings.find((b) => b.name === CURRENT_USER);
      const refund = amenity && mine?.status === "confirmed" ? xpCostFor(amenity, slots.find((s) => s.id === slotId)!.start) : 0;

      const updated = slots.map((s) =>
        s.id !== slotId
          ? s
          : { ...s, bookings: s.bookings.filter((b) => b.name !== CURRENT_USER) }
      );
      return {
        slotsByAmenity: { ...prev.slotsByAmenity, [amenityId]: updated },
        xp: prev.xp + refund,
      };
    });
  }

  function addGuest(amenityId: string, slotId: string, guestName: string) {
    const name = guestName.trim();
    if (!name) return;
    const amenity = AMENITIES.find((a) => a.id === amenityId);
    if (!amenity || amenity.bookingType !== "group") return;

    updateSlots(amenityId, (slots) =>
      slots.map((s) => {
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
      })
    );
  }

  function removeGuest(amenityId: string, slotId: string, guestIndex: number) {
    updateSlots(amenityId, (slots) =>
      slots.map((s) => {
        if (s.id !== slotId) return s;
        return {
          ...s,
          bookings: s.bookings.map((b) => {
            if (b.name !== CURRENT_USER || !b.guests) return b;
            return { ...b, guests: b.guests.filter((_, i) => i !== guestIndex) };
          }),
        };
      })
    );
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
      value={{ getSlots, xp, book, cancel, addGuest, removeGuest, myBookings }}
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
