"use client";

import { X, CalendarCheck, Clock3 } from "lucide-react";
import { useBookings } from "@/lib/bookings-context";
import { dateSuffix, isUpcoming, nowHHMM, todayISO } from "@/lib/date-utils";

export default function MyBookingsPanel({ onClose }: { onClose: () => void }) {
  const { myBookings, cancel } = useBookings();
  const today = todayISO();
  const now = nowHHMM();

  const upcoming = myBookings.filter((b) => isUpcoming(b.date, b.slot.start, today, now));
  const past = myBookings.filter((b) => !isUpcoming(b.date, b.slot.start, today, now));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 px-4 pt-20">
      <div className="scroll-list max-h-[70vh] w-full max-w-md overflow-y-auto rounded-lg border border-border bg-surface p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-base font-semibold">
            <CalendarCheck size={17} className="text-accent" />
            My bookings
          </h3>
          <button onClick={onClose} className="text-muted hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        {myBookings.length === 0 ? (
          <p className="whitespace-nowrap py-4 text-center text-sm text-muted">
            No bookings yet.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            <section>
              <p className="mb-1.5 text-xs font-medium uppercase text-muted">
                Upcoming
              </p>
              {upcoming.length === 0 ? (
                <p className="text-sm text-muted">Nothing upcoming.</p>
              ) : (
                <ul className="scroll-list flex max-h-56 flex-col gap-2 pr-1">
                  {upcoming.map((b) => (
                    <li
                      key={b.slot.id + b.amenityId}
                      className="flex items-center justify-between rounded-md border border-border bg-surface-2 px-3 py-2"
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
            </section>

            {past.length > 0 && (
              <section>
                <p className="mb-1.5 text-xs font-medium uppercase text-muted">
                  Past
                </p>
                <ul className="scroll-list flex max-h-40 flex-col gap-2 pr-1">
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
                      <span className="text-xs text-muted">Completed</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
