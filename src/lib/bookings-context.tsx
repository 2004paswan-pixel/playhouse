"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { AMENITIES, getSlotsForAmenity, xpCostFor, isPeak } from "./amenities-data";
import { TimeSlot, XpTransaction } from "./types";
import { addDays, todayISO } from "./date-utils";

export const CURRENT_USER = "You";
// Demo build: seeded with fake bookings/history for showing the UI, so this
// is bumped past any real localStorage left over from earlier testing. Swap
// back to an empty `fresh` state (see buildDemoSeed below) once the demo is
// no longer needed.
const STORAGE_KEY = "players-union-state-demo-v1";
export const STARTING_XP = 100;
const MAX_HISTORY = 200;

// Slots are stored per amenity *and* day, keyed `${amenityId}::${dateISO}`,
// so a booking on Friday doesn't affect Saturday's grid.
type SlotsByKey = Record<string, TimeSlot[]>;

function keyOf(amenityId: string, date: string): string {
  return `${amenityId}::${date}`;
}

interface PersistedState {
  slotsByKey: SlotsByKey;
  xp: number;
  xpHistory: XpTransaction[];
}

/** First slot on `date` still under capacity, in or out of a peak window as asked. */
function pickOpenSlot(amenityId: string, date: string, wantPeak: boolean): TimeSlot | undefined {
  return getSlotsForAmenity(amenityId, date).find(
    (s) => isPeak(s.start) === wantPeak && s.bookings.filter((b) => b.status === "confirmed").length < s.capacity
  );
}

// Demo seed: a couple of confirmed Gym bookings (so the XP math is exact)
// plus a few waitlisted bookings on other amenities purely for visual
// variety in "My bookings" — waitlisting is free, so it doesn't touch the
// balance. Dates are computed relative to "today" so it always looks live.
function buildDemoSeed(): PersistedState {
  const today = todayISO();
  const d1 = addDays(today, 1);
  const d2 = addDays(today, 2);
  const d3 = addDays(today, 3);
  const d4 = addDays(today, 4);
  const now = Date.now();
  const hour = 60 * 60 * 1000;

  const gym = AMENITIES.find((a) => a.id === "gym")!;
  const gymSlot1 = pickOpenSlot("gym", d1, true) ?? getSlotsForAmenity("gym", d1)[0];
  const gymSlot2 = pickOpenSlot("gym", d3, true) ?? getSlotsForAmenity("gym", d3)[0];
  const cost1 = xpCostFor(gym, gymSlot1.start);
  const cost2 = xpCostFor(gym, gymSlot2.start);

  const slotsByKey: SlotsByKey = {};
  function addConfirmed(amenityId: string, date: string, slot: TimeSlot) {
    const key = keyOf(amenityId, date);
    const slots = slotsByKey[key] ?? getSlotsForAmenity(amenityId, date);
    slotsByKey[key] = slots.map((s) =>
      s.id === slot.id ? { ...s, bookings: [...s.bookings, { name: CURRENT_USER, status: "confirmed" as const }] } : s
    );
  }
  function addWaiting(amenityId: string, date: string, start: string) {
    const key = keyOf(amenityId, date);
    const slots = slotsByKey[key] ?? getSlotsForAmenity(amenityId, date);
    slotsByKey[key] = slots.map((s) =>
      s.start === start ? { ...s, bookings: [...s.bookings, { name: CURRENT_USER, status: "waiting" as const }] } : s
    );
  }

  addConfirmed("gym", d1, gymSlot1);
  addConfirmed("gym", d3, gymSlot2);
  addWaiting("music-room-1", d1, "11:00");
  addWaiting("pickleball-court", d2, "16:00");
  addWaiting("dance-room", d4, "12:00");

  return {
    xp: STARTING_XP - cost1 - cost2,
    xpHistory: [
      { id: "demo-gym-2", amenityName: "Gym", date: d3, start: gymSlot2.start, delta: -cost2, reason: "booked", at: now - 2 * hour },
      { id: "demo-gym-1", amenityName: "Gym", date: d1, start: gymSlot1.start, delta: -cost1, reason: "booked", at: now - 5 * hour },
    ],
    slotsByKey,
  };
}

function loadInitial(): PersistedState {
  if (typeof window === "undefined") return { slotsByKey: {}, xp: STARTING_XP, xpHistory: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildDemoSeed();
    const saved = JSON.parse(raw) as Partial<PersistedState>;
    return {
      slotsByKey: saved.slotsByKey ?? {},
      xp: typeof saved.xp === "number" ? saved.xp : STARTING_XP,
      xpHistory: Array.isArray(saved.xpHistory) ? saved.xpHistory : [],
    };
  } catch {
    return buildDemoSeed();
  }
}

export interface MyBooking {
  amenityId: string;
  amenityName: string;
  date: string;
  slot: TimeSlot;
  status: "confirmed" | "waiting";
  guests?: string[];
}

export type BookResult = "booked" | "waitlisted" | "waitlist-full" | "insufficient-xp";

interface BookingsContextValue {
  getSlots: (amenityId: string, date: string) => TimeSlot[];
  xp: number;
  xpHistory: XpTransaction[];
  book: (amenityId: string, date: string, slotId: string) => BookResult;
  cancel: (amenityId: string, date: string, slotId: string) => void;
  addGuest: (amenityId: string, date: string, slotId: string, guestName: string) => void;
  removeGuest: (amenityId: string, date: string, slotId: string, guestIndex: number) => void;
  myBookings: MyBooking[];
}

const BookingsContext = createContext<BookingsContextValue | null>(null);

export function BookingsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(loadInitial);
  const { slotsByKey, xp, xpHistory } = state;

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // best-effort only
    }
  }, [state]);

  function updateSlots(amenityId: string, date: string, updater: (slots: TimeSlot[]) => TimeSlot[]) {
    const key = keyOf(amenityId, date);
    setState((prev) => {
      const slots = prev.slotsByKey[key] ?? getSlotsForAmenity(amenityId, date);
      return {
        ...prev,
        slotsByKey: { ...prev.slotsByKey, [key]: updater(slots) },
      };
    });
  }

  function getSlots(amenityId: string, date: string): TimeSlot[] {
    return slotsByKey[keyOf(amenityId, date)] ?? getSlotsForAmenity(amenityId, date);
  }

  function book(amenityId: string, date: string, slotId: string): BookResult {
    const amenity = AMENITIES.find((a) => a.id === amenityId);
    if (!amenity) return "waitlist-full";
    const key = keyOf(amenityId, date);

    let result: BookResult = "booked";
    setState((prev) => {
      const slots = prev.slotsByKey[key] ?? getSlotsForAmenity(amenityId, date);
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

      const bookedSlot = slots.find((s) => s.id === slotId)!;
      const charged = result === "booked" ? xpCostFor(amenity, bookedSlot.start) : 0;
      const history =
        result === "booked"
          ? [
              {
                id: `${slotId}-${Date.now()}`,
                amenityName: amenity.name,
                date,
                start: bookedSlot.start,
                delta: -charged,
                reason: "booked" as const,
                at: Date.now(),
              },
              ...prev.xpHistory,
            ].slice(0, MAX_HISTORY)
          : prev.xpHistory;

      return {
        slotsByKey: { ...prev.slotsByKey, [key]: updated },
        xp: prev.xp - charged,
        xpHistory: history,
      };
    });
    return result;
  }

  function cancel(amenityId: string, date: string, slotId: string) {
    const amenity = AMENITIES.find((a) => a.id === amenityId);
    const key = keyOf(amenityId, date);
    setState((prev) => {
      const slots = prev.slotsByKey[key] ?? getSlotsForAmenity(amenityId, date);
      const cancelledSlot = slots.find((s) => s.id === slotId)!;
      const mine = cancelledSlot.bookings.find((b) => b.name === CURRENT_USER);
      const refund = amenity && mine?.status === "confirmed" ? xpCostFor(amenity, cancelledSlot.start) : 0;

      const updated = slots.map((s) =>
        s.id !== slotId
          ? s
          : { ...s, bookings: s.bookings.filter((b) => b.name !== CURRENT_USER) }
      );

      const history =
        amenity && refund > 0
          ? [
              {
                id: `${slotId}-${Date.now()}`,
                amenityName: amenity.name,
                date,
                start: cancelledSlot.start,
                delta: refund,
                reason: "cancelled" as const,
                at: Date.now(),
              },
              ...prev.xpHistory,
            ].slice(0, MAX_HISTORY)
          : prev.xpHistory;

      return {
        slotsByKey: { ...prev.slotsByKey, [key]: updated },
        xp: prev.xp + refund,
        xpHistory: history,
      };
    });
  }

  function addGuest(amenityId: string, date: string, slotId: string, guestName: string) {
    const name = guestName.trim();
    if (!name) return;
    const amenity = AMENITIES.find((a) => a.id === amenityId);
    if (!amenity || amenity.bookingType !== "group") return;

    updateSlots(amenityId, date, (slots) =>
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

  function removeGuest(amenityId: string, date: string, slotId: string, guestIndex: number) {
    updateSlots(amenityId, date, (slots) =>
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
    for (const [key, slots] of Object.entries(slotsByKey)) {
      const [amenityId, date] = key.split("::");
      const amenity = AMENITIES.find((a) => a.id === amenityId);
      if (!amenity) continue;
      for (const slot of slots) {
        const mine = slot.bookings.find((b) => b.name === CURRENT_USER);
        if (mine) {
          list.push({
            amenityId,
            amenityName: amenity.name,
            date,
            slot,
            status: mine.status,
            guests: mine.guests,
          });
        }
      }
    }
    const today = todayISO();
    return list.sort((a, b) => {
      // today's bookings first, then future days in order; keeps the panel
      // showing what's immediately relevant at the top.
      const aKey = (a.date >= today ? "0" : "1") + a.date + a.slot.start;
      const bKey = (b.date >= today ? "0" : "1") + b.date + b.slot.start;
      return aKey.localeCompare(bKey);
    });
  }, [slotsByKey]);

  return (
    <BookingsContext.Provider
      value={{ getSlots, xp, xpHistory, book, cancel, addGuest, removeGuest, myBookings }}
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
