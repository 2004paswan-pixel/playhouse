import { Slot, slotStatus } from "@/lib/types";

const STATUS_STYLES: Record<string, string> = {
  free: "bg-success/15 text-success border-success/30",
  waiting: "bg-accent/15 text-accent border-accent/30",
  full: "bg-danger/15 text-danger border-danger/30",
};

const STATUS_LABEL: Record<string, string> = {
  free: "Free",
  waiting: "Waiting list",
  full: "Full",
};

export default function SlotCard({
  slot,
  onBook,
}: {
  slot: Slot;
  onBook?: (slotId: string) => void;
}) {
  const status = slotStatus(slot);
  const spotsLeft = Math.max(slot.capacity - slot.booked_count, 0);

  return (
    <div className="flex flex-col justify-between rounded-xl border border-border bg-surface p-4">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-muted">
            {slot.is_peak ? "Peak slot" : "Off-peak"}
          </span>
          <span
            className={`rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
          >
            {STATUS_LABEL[status]}
          </span>
        </div>
        <h3 className="text-base font-semibold">{slot.label}</h3>
        <p className="text-sm text-muted">
          {slot.start_time} – {slot.end_time}
        </p>
        <p className="mt-2 text-xs text-muted">
          {status === "free"
            ? `${spotsLeft} of ${slot.capacity} spots left`
            : `${slot.booked_count}/${slot.capacity} booked · ${slot.waiting_count} waiting`}
        </p>
      </div>
      <button
        onClick={() => onBook?.(slot.id)}
        className={`mt-4 w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          status === "free"
            ? "bg-foreground text-background hover:opacity-90"
            : status === "waiting"
              ? "border border-accent/40 text-accent hover:bg-accent/10"
              : "cursor-not-allowed border border-border text-muted"
        }`}
        disabled={status === "full"}
      >
        {status === "free"
          ? "Book slot"
          : status === "waiting"
            ? "Join waiting list"
            : "Full"}
      </button>
    </div>
  );
}
