"use client";

import { useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import SlotCard from "@/components/SlotCard";
import { mockProfile, mockSlots } from "@/lib/mock-data";
import { Slot } from "@/lib/types";

const FILTERS = ["All slots", "Peak", "Off-peak"] as const;

export default function Home() {
  const [slots, setSlots] = useState<Slot[]>(mockSlots);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All slots");
  const [toast, setToast] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (filter === "Peak") return slots.filter((s) => s.is_peak);
    if (filter === "Off-peak") return slots.filter((s) => !s.is_peak);
    return slots;
  }, [slots, filter]);

  function handleBook(slotId: string) {
    setSlots((prev) =>
      prev.map((slot) => {
        if (slot.id !== slotId) return slot;
        if (slot.booked_count < slot.capacity) {
          setToast(`You're booked into ${slot.label}.`);
          return { ...slot, booked_count: slot.booked_count + 1 };
        }
        setToast(`Added to the waiting list for ${slot.label}.`);
        return { ...slot, waiting_count: slot.waiting_count + 1 };
      })
    );
    setTimeout(() => setToast(null), 3000);
  }

  return (
    <AppShell
      profile={mockProfile}
      title="Slots"
      subtitle="Book a peak-hour slot or check what's free right now."
    >
      <div className="mb-5 flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
              filter === f
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted hover:border-foreground/40 hover:text-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((slot) => (
          <SlotCard key={slot.id} slot={slot} onBook={handleBook} />
        ))}
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-lg border border-accent/40 bg-surface px-4 py-2 text-sm shadow-lg">
          {toast}
        </div>
      )}
    </AppShell>
  );
}
