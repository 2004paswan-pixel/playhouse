"use client";

import { use, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, X, Dumbbell, Music, Footprints, CircleDot, Flame, CalendarDays, Plus, Ticket, Clock3, Lock, Ban } from "lucide-react";
import Header from "@/components/Header";
import Avatar from "@/components/Avatar";
import { AMENITIES, isPeak, xpCostFor } from "@/lib/amenities-data";
import { useBookings, CURRENT_USER } from "@/lib/bookings-context";
import { Amenity, TimeSlot, slotStatus } from "@/lib/types";

const ICONS: Record<string, typeof Dumbbell> = {
  gym: Dumbbell,
  "music-room-1": Music,
  "music-room-2": Music,
  "dance-room": Footprints,
  "pickleball-court": CircleDot,
};

const STATUS_LABEL: Record<string, string> = {
  free: "Free",
  waiting: "Waitlist open",
  full: "Full",
};

// Only one color carries meaning: green = available. Everything else is
// deliberately dull — the waiting count is written out as text instead.
const STATUS_CELL: Record<string, string> = {
  free: "bg-success/10 text-success",
  waiting: "bg-surface text-muted",
  full: "bg-surface text-muted",
};

export default function AmenityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const amenity = AMENITIES.find((a) => a.id === slug);
  if (!amenity) notFound();
  const Icon = ICONS[amenity.id] ?? Dumbbell;

  const { getSlots } = useBookings();
  const slots = getSlots(slug);
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);
  const activeSlot = slots.find((s) => s.id === activeSlotId) ?? null;
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="relative flex min-h-screen flex-col text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 left-1/4 h-80 w-80 rounded-full bg-accent/10 blur-[110px]" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-accent/5 blur-[100px]" />
      </div>

      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-3.5 py-3 sm:px-6 sm:py-6">
        <Link
          href="/"
          className="mb-2.5 inline-flex items-center gap-1.5 text-xs text-muted hover:text-foreground sm:mb-3 sm:text-sm"
        >
          <ArrowLeft size={13} />
          All amenities
        </Link>

        {/* Room hero */}
        <div className="relative mb-3 flex h-24 items-end overflow-hidden rounded-lg border border-border bg-gradient-to-br from-surface-2 to-surface sm:mb-4 sm:h-36">
          {amenity.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={amenity.image}
              alt={amenity.name}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <Icon size={72} className="absolute -right-2 -top-2 text-foreground/5" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="relative z-10 flex items-center gap-2 p-2.5 sm:gap-3 sm:p-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-black/40 text-accent backdrop-blur-sm sm:h-10 sm:w-10">
              <Icon size={16} className="sm:hidden" />
              <Icon size={20} className="hidden sm:block" />
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-lg italic leading-tight sm:text-2xl">{amenity.name}</h1>
              <p className="truncate text-[10px] text-muted sm:text-xs">
                {amenity.bookingType === "individual"
                  ? `${amenity.capacityPerSlot} spots per slot · waitlist up to ${amenity.waitlistCap}`
                  : `One group per slot · up to ${amenity.groupSize} people`}
              </p>
            </div>
          </div>
        </div>

        {/* Date + legend */}
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-1.5 text-xs font-semibold leading-none sm:text-sm">
            <CalendarDays size={13} className="text-accent sm:hidden" />
            <CalendarDays size={15} className="hidden text-accent sm:block" />
            {today}
          </h2>
          <div className="flex items-center gap-2.5 text-[10px] leading-none text-muted sm:gap-3 sm:text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-success/60" /> Available
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-surface-2 border border-border" /> Unavailable
            </span>
            <span className="flex items-center gap-1">
              <Flame size={10} className="text-danger" /> Peak
            </span>
          </div>
        </div>

        {/* Continuous day calendar — 06:00 to 22:00, 32 slots. Kept compact and
            framed rather than a wall-to-wall grid of boxes. */}
        <div className="rounded-xl border border-border/60 bg-surface/40 p-1.5 sm:border-none sm:bg-transparent sm:p-0">
          <div className="grid grid-cols-5 gap-1 sm:grid-cols-6 sm:gap-2.5 md:grid-cols-8">
            {slots.map((slot) => {
              const status = slotStatus(slot);
              const mine = slot.bookings.some((b) => b.name === CURRENT_USER);
              const peak = isPeak(slot.start);
              const waitingCount = slot.bookings.filter((b) => b.status === "waiting").length;

              return (
                <button
                  key={slot.id}
                  onClick={() => setActiveSlotId(slot.id)}
                  title={`${slot.start}–${slot.end} · ${STATUS_LABEL[status]}`}
                  className={`relative flex aspect-[3/2] flex-col items-center justify-center gap-0.5 rounded-md border border-border/70 text-center shadow-sm transition-transform active:scale-95 hover:-translate-y-0.5 hover:border-accent/50 sm:aspect-square sm:rounded-lg sm:border-border ${STATUS_CELL[status]} ${
                    mine ? "ring-2 ring-inset ring-accent" : ""
                  }`}
                >
                  {peak && (
                    <Flame size={7} className="absolute right-0.5 top-0.5 text-danger opacity-90 sm:right-1 sm:top-1 sm:size-2" />
                  )}
                  <span className="font-mono-tight text-[9px] font-medium leading-none sm:text-[11px]">
                    {slot.start}
                  </span>
                  {waitingCount > 0 && (
                    <span className="text-[7px] leading-none opacity-90 sm:text-[9px]">
                      {waitingCount}
                      {amenity.waitlistCap != null && `/${amenity.waitlistCap}`}
                      <span className="hidden sm:inline"> waiting</span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </main>

      {activeSlot && (
        <SlotDetail
          slot={activeSlot}
          amenity={amenity}
          onClose={() => setActiveSlotId(null)}
        />
      )}
    </div>
  );
}

function SlotDetail({
  slot,
  amenity,
  onClose,
}: {
  slot: TimeSlot;
  amenity: Amenity;
  onClose: () => void;
}) {
  const { book, cancel, addGuest, removeGuest, xp } = useBookings();
  const [guestInput, setGuestInput] = useState("");
  const status = slotStatus(slot);
  const confirmed = slot.bookings.filter((b) => b.status === "confirmed");
  const waitlisted = slot.bookings.filter((b) => b.status === "waiting");
  const mine = slot.bookings.find((b) => b.name === CURRENT_USER);
  const isGroup = amenity.bookingType === "group";
  const waitlistFull =
    amenity.waitlistCap != null && waitlisted.length >= amenity.waitlistCap && !mine;
  const cost = xpCostFor(amenity, slot.start);
  const canAffordBooking = status !== "free" || xp >= cost;

  function handleBook() {
    book(amenity.id, slot.id); // blocked cases are pre-disabled in the UI below
  }

  function handleAddGuest() {
    if (!guestInput.trim()) return;
    addGuest(amenity.id, slot.id, guestInput.trim());
    setGuestInput("");
  }

  const maxGuests = (amenity.groupSize ?? 1) - 1;
  const myGuests = mine?.guests ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="scroll-list max-h-[85vh] w-full max-w-sm overflow-y-auto rounded-lg border border-border bg-surface p-5">
        <div className="mb-3 flex items-start justify-between">
          <div>
            <h3 className="font-display text-lg italic leading-tight">
              {amenity.name} &middot; {slot.start}–{slot.end}
            </h3>
            <p className="text-xs text-muted">
              {isGroup
                ? confirmed.length > 0
                  ? "Room booked"
                  : "Room free"
                : `${confirmed.length}/${slot.capacity} joined`}
              {waitlisted.length > 0 &&
                ` · ${waitlisted.length}${amenity.waitlistCap != null ? `/${amenity.waitlistCap}` : ""} waitlisted`}
            </p>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-muted hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        <div className="mb-4 flex flex-col gap-4">
          {/* Confirmed / group section */}
          <div>
            <p className="mb-1.5 text-xs font-medium uppercase text-muted">
              {isGroup ? "In this session" : "Joined"}
            </p>
            {confirmed.length === 0 ? (
              <p className="text-sm text-muted">No one yet — be the first.</p>
            ) : (
              <ul className="scroll-list flex max-h-44 flex-col gap-2 pr-1">
                {confirmed.map((b, i) => (
                  <li key={i} className="flex flex-col gap-2">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={b.name} />
                      <span className="text-sm">
                        {b.name}
                        {b.name === CURRENT_USER && (
                          <span className="ml-1 text-xs text-accent">(you)</span>
                        )}
                        {isGroup && (
                          <span className="ml-1 text-xs text-muted">&middot; booked this</span>
                        )}
                      </span>
                    </div>
                    {isGroup && b.guests && b.guests.length > 0 && (
                      <ul className="ml-8 flex flex-col gap-1.5">
                        {b.guests.map((g, gi) => (
                          <li key={gi} className="flex items-center justify-between gap-2">
                            <span className="flex items-center gap-2.5">
                              <Avatar name={g} size={22} />
                              <span className="text-sm text-muted">{g}</span>
                            </span>
                            {b.name === CURRENT_USER && (
                              <button
                                onClick={() => removeGuest(amenity.id, slot.id, gi)}
                                className="text-muted hover:text-danger"
                              >
                                <X size={13} />
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {/* Add-member UI: only for the group booker, only if room left */}
            {isGroup && mine?.status === "confirmed" && myGuests.length < maxGuests && (
              <div className="mt-2.5 flex items-center gap-1.5">
                <input
                  value={guestInput}
                  onChange={(e) => setGuestInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddGuest()}
                  placeholder={`Add member (${myGuests.length}/${maxGuests})`}
                  className="min-w-0 flex-1 rounded-md border border-border bg-surface-2 px-2.5 py-1.5 text-sm outline-none focus:border-accent"
                />
                <button
                  onClick={handleAddGuest}
                  className="flex shrink-0 items-center justify-center rounded-md bg-accent p-1.5 text-accent-foreground hover:opacity-90"
                >
                  <Plus size={15} />
                </button>
              </div>
            )}
          </div>

          {waitlisted.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-medium uppercase text-muted">Waitlisted</p>
              <ul className="scroll-list flex max-h-32 flex-col gap-2 pr-1">
                {waitlisted.map((b, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <Avatar name={b.name} />
                    <span className="text-sm">
                      {b.name}
                      {b.name === CURRENT_USER && (
                        <span className="ml-1 text-xs text-accent">(you)</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {mine ? (
          <button
            onClick={() => cancel(amenity.id, slot.id)}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-danger/40 bg-danger/5 py-3 text-sm font-semibold text-danger shadow-sm transition-all active:scale-[0.97] hover:border-danger/60 hover:bg-danger/10"
          >
            <Ban size={15} />
            {mine.status === "confirmed" ? "Cancel booking" : "Leave waitlist"}
          </button>
        ) : waitlistFull ? (
          <button
            disabled
            className="flex w-full cursor-not-allowed items-center justify-center gap-1.5 rounded-xl border border-border bg-surface-2/60 py-3 text-sm font-medium text-muted"
          >
            <Lock size={14} />
            Waitlist full
          </button>
        ) : !canAffordBooking ? (
          <button
            disabled
            className="flex w-full cursor-not-allowed items-center justify-center gap-1.5 rounded-xl border border-border bg-surface-2/60 py-3 text-sm font-medium text-muted"
          >
            <Lock size={14} />
            Not enough XP · need {cost}
          </button>
        ) : (
          <button
            onClick={handleBook}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-accent to-emerald-400 py-3 text-sm font-bold text-accent-foreground shadow-[0_10px_28px_-8px_rgba(215,251,61,0.55)] transition-all active:scale-[0.97] hover:shadow-[0_14px_34px_-8px_rgba(215,251,61,0.7)] hover:brightness-105"
          >
            {status === "free" ? (
              <>
                <Ticket size={16} />
                Book this slot <span className="font-medium opacity-80">· {cost} XP</span>
              </>
            ) : (
              <>
                <Clock3 size={16} />
                Join waitlist <span className="font-medium opacity-80">· free</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
