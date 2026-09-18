"use client";

import { useState } from "react";
import Image from "next/image";
import { CalendarCheck, Clock3, ChevronDown } from "lucide-react";
import { useBookings } from "@/lib/bookings-context";
import { dateSuffix, isUpcoming, nowHHMM, todayISO } from "@/lib/date-utils";

// Desktop-only dashboard shown to the right of the amenities grid: XP balance
// at a glance, plus upcoming bookings with past bookings tucked behind a
// toggle so the card doesn't grow unbounded. Hidden below the `lg` breakpoint
// — mobile keeps using the profile menu's "My bookings" panel instead.
export default function DashboardSidebar() {
  const { xp, myBookings, cancel } = useBookings();
  const [showPast, setShowPast] = useState(false);

  const today = todayISO();
  const now = nowHHMM();
  const upcoming = myBookings.filter((b) => isUpcoming(b.date, b.slot.start, today, now));
  const past = myBookings.filter((b) => !isUpcoming(b.date, b.slot.start, today, now));

  return (
    <aside className="hidden lg:flex lg:w-[19rem] lg:shrink-0 lg:flex-col lg:gap-4">
      <div className="flex shrink-0 items-center gap-3 rounded-lg border border-accent/40 bg-accent/10 px-4 py-3.5">
        <Image src="/xp-token.png" alt="XP" width={36} height={36} className="h-9 w-9 shrink-0" />
        <div className="min-w-0">
          <p className="text-xs text-muted">Your balance</p>
          <p className="text-2xl font-bold leading-tight text-accent">
            {xp} <span className="text-sm font-normal text-accent/70">XP</span>
          </p>
        </div>
      </div>

      <div className="scroll-list flex min-h-0 flex-1 flex-col overflow-y-auto rounded-lg border border-border bg-surface p-4">
        <h3 className="mb-3 flex shrink-0 items-center gap-2 text-sm font-semibold">
          <CalendarCheck size={16} className="text-accent" />
          My bookings
        </h3>

        {myBookings.length === 0 ? (
          <p className="text-sm text-muted">No bookings yet.</p>
        ) : (
          <>
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted">Nothing upcoming.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {upcoming.map((b) => (
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

            {past.length > 0 && (
              <>
                <button
                  onClick={() => setShowPast((v) => !v)}
                  className="mt-3 flex shrink-0 items-center gap-1 text-xs font-medium text-muted transition-colors hover:text-foreground"
                >
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${showPast ? "rotate-180" : ""}`}
                  />
                  {showPast ? "Hide" : "Show"} past bookings ({past.length})
                </button>
                {showPast && (
                  <ul className="mt-2 flex flex-col gap-2">
                    {past.map((b) => (
                      <li
                        key={b.slot.id + b.amenityId}
                        className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2 opacity-60"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{b.amenityName}</p>
                          <p className="text-xs text-muted">
                            {b.slot.start}–{b.slot.end}
                            {dateSuffix(b.date, today)}
                          </p>
                        </div>
                        <span className="shrink-0 text-xs text-muted">Completed</span>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
