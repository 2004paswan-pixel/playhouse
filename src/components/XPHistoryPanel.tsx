"use client";

import Image from "next/image";
import { X, History, Plus, Minus } from "lucide-react";
import { useBookings } from "@/lib/bookings-context";
import { formatTransactionTime } from "@/lib/date-utils";

export default function XPHistoryPanel({ onClose }: { onClose: () => void }) {
  const { xp, xpHistory } = useBookings();

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 px-4 pt-20">
      <div className="scroll-list max-h-[70vh] w-full max-w-md overflow-y-auto rounded-lg border border-border bg-surface p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-base font-semibold">
            <History size={17} className="text-accent" />
            XP history
          </h3>
          <button onClick={onClose} aria-label="Close" className="text-muted hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        <div className="mb-4 flex items-center gap-2.5 rounded-md border border-accent/40 bg-accent/10 px-3.5 py-3">
          <Image src="/xp-token.png" alt="XP" width={28} height={28} className="h-6 w-6 shrink-0" />
          <div>
            <p className="text-xs text-muted">Current balance</p>
            <p className="text-lg font-bold text-accent">{xp} XP</p>
          </div>
        </div>

        {xpHistory.length === 0 ? (
          <p className="whitespace-nowrap py-4 text-center text-sm text-muted">
            No XP activity yet.
          </p>
        ) : (
          <ul className="scroll-list flex max-h-80 flex-col gap-2 pr-1">
            {xpHistory.map((tx) => (
              <li
                key={tx.id}
                className="flex items-center justify-between rounded-md border border-border bg-surface-2 px-3 py-2"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                      tx.delta > 0 ? "bg-emerald-400/15 text-emerald-400" : "bg-danger/15 text-danger"
                    }`}
                  >
                    {tx.delta > 0 ? <Plus size={13} /> : <Minus size={13} />}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {tx.reason === "booked" ? `Booked ${tx.amenityName}` : `Cancelled ${tx.amenityName}`}
                    </p>
                    <p className="text-xs text-muted">
                      {tx.start} &middot; {formatTransactionTime(tx.at)}
                    </p>
                  </div>
                </div>
                <span
                  className={`shrink-0 text-sm font-semibold ${
                    tx.delta > 0 ? "text-emerald-400" : "text-danger"
                  }`}
                >
                  {tx.delta > 0 ? "+" : ""}
                  {tx.delta} XP
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
