"use client";

import { useState } from "react";
import Image from "next/image";
import { CalendarCheck, Clock3, ChevronRight } from "lucide-react";
import { useBookings, STARTING_XP } from "@/lib/bookings-context";
import { dateSuffix, isUpcoming, nowHHMM, todayISO } from "@/lib/date-utils";
import XpRing from "./XpRing";
import MyBookingsPanel from "./MyBookingsPanel";
import XPHistoryPanel from "./XPHistoryPanel";

const VISIBLE_UPCOMING = 3;

// Desktop-only dashboard shown to the right of the amenities grid: a live
// XP ring (drains/refills as bookings cost or refund XP, tap to see the
// full history) and a separate, compact "My bookings" card capped to the
// next 3 upcoming bookings, with "Show all" opening the full panel. Cards
// size to their own content rather than stretching to fill the column, so
// there's no empty bordered box when there isn't much to show. Hidden below
// `lg` — mobile keeps the profile menu's "My bookings" panel instead.
export default function DashboardSidebar() {
  const { xp, myBookings, cancel } = useBookings();
  const [bookingsOpen, setBookingsOpen] = useState(false);
  const [xpHistoryOpen, setXpHistoryOpen] = useState(false);

  const today = todayISO();
  const now = nowHHMM();
  const upcoming = myBookings.filter((b) => isUpcoming(b.date, b.slot.start, today, now));
  const visibleUpcoming = upcoming.slice(0, VISIBLE_UPCOMING);
  const used = Math.max(0, STARTING_XP - xp);

  return (
    <aside className="hidden lg:flex lg:w-[19rem] lg:shrink-0 lg:flex-col lg:gap-4">
      <button
        onClick={() => setXpHistoryOpen(true)}
        className="group flex shrink-0 flex-col items-center gap-3 rounded-lg border border-accent/40 bg-accent/10 px-4 py-5 text-center transition-all hover:border-accent/70 hover:bg-accent/15 active:scale-[0.98]"
      >
        <div className="relative flex items-center justify-center">
          <XpRing value={xp} max={STARTING_XP} />
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold leading-none text-accent">{xp}</span>
            <span className="mt-1.5 flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-accent/70">
              <Image src="/xp-token.png" alt="XP" width={28} height={28} className="h-3.5 w-3.5 shrink-0" />
              left
            </span>
          </div>
        </div>
        <div>
          <p className="text-xs text-muted">
            {used} of {STARTING_XP} XP used
          </p>
          <p className="mt-0.5 text-[11px] font-medium text-accent/80 opacity-0 transition-opacity group-hover:opacity-100">
            View history
          </p>
        </div>
      </button>

      <div className="flex shrink-0 flex-col rounded-lg border border-border bg-surface p-4">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <CalendarCheck size={16} className="text-accent" />
          My bookings
        </h3>

        {myBookings.length === 0 ? (
          <p className="text-sm text-muted">No bookings yet.</p>
        ) : visibleUpcoming.length === 0 ? (
          <p className="text-sm text-muted">Nothing upcoming.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {visibleUpcoming.map((b) => (
              <li
                key={b.slot.id + b.amenityId}
                className="flex items-center justify-between gap-2 rounded-md border border-border bg-surface-2 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{b.amenityName}</p>
                  <p className="flex items-center gap-1 text-xs text-muted">
                    <Clock3 size={11} />
                    {b.slot.start}–{b.slot.end}
                    {dateSuffix(b.date, today)}
                    {b.status === "waiting" && (
                      <span className="ml-1 text-warning">&middot; waitlisted</span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => cancel(b.amenityId, b.date, b.slot.id)}
                  className="shrink-0 rounded border border-danger/40 px-2 py-1 text-xs font-medium text-danger hover:bg-danger/10"
                >
                  {b.status === "confirmed" ? "Cancel" : "Leave"}
                </button>
              </li>
            ))}
          </ul>
        )}

        {myBookings.length > 0 && (
          <button
            onClick={() => setBookingsOpen(true)}
            className="mt-3 flex items-center gap-1 self-start text-xs font-medium text-muted transition-colors hover:text-foreground"
          >
            Show all
            <ChevronRight size={13} />
          </button>
        )}
      </div>

      {bookingsOpen && <MyBookingsPanel onClose={() => setBookingsOpen(false)} />}
      {xpHistoryOpen && <XPHistoryPanel onClose={() => setXpHistoryOpen(false)} />}
    </aside>
  );
}
