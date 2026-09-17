"use client";

import AppShell from "@/components/AppShell";
import { mockBookings, mockProfile, mockSlots } from "@/lib/mock-data";

const STATUS_STYLES: Record<string, string> = {
  confirmed: "bg-success/15 text-success border-success/30",
  waiting: "bg-accent/15 text-accent border-accent/30",
  cancelled: "bg-danger/15 text-danger border-danger/30",
};

export default function QueuePage() {
  return (
    <AppShell
      profile={mockProfile}
      title="Queue"
      subtitle="Live bookings and waiting lists across all slots."
    >
      <div className="flex flex-col gap-6">
        {mockSlots.map((slot) => {
          const bookings = mockBookings.filter((b) => b.slot_id === slot.id);
          return (
            <div key={slot.id} className="rounded-xl border border-border bg-surface">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div>
                  <h3 className="text-sm font-semibold">{slot.label}</h3>
                  <p className="text-xs text-muted">
                    {slot.start_time} – {slot.end_time}
                  </p>
                </div>
                <span className="text-xs text-muted">
                  {slot.booked_count}/{slot.capacity} booked
                  {slot.waiting_count > 0 && ` · ${slot.waiting_count} waiting`}
                </span>
              </div>
              {bookings.length === 0 ? (
                <p className="px-4 py-4 text-sm text-muted">No bookings yet.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {bookings.map((b) => (
                    <li key={b.id} className="flex items-center justify-between px-4 py-3">
                      <span className="text-sm">{b.user_name}</span>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[b.status]}`}
                      >
                        {b.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
