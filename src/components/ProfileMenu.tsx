"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarCheck } from "lucide-react";

// Small circular profile button in the header. Opens a dropdown with
// account-style actions — just "My bookings" for now, but built as a menu
// so more options (settings, sign out, ...) can slot in later.
export default function ProfileMenu({ onOpenBookings }: { onOpenBookings: () => void }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Profile menu"
        aria-expanded={open}
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent transition-all active:scale-95 sm:h-10 sm:w-10 ${
          open ? "ring-2 ring-accent/60" : "hover:bg-accent/30"
        }`}
      >
        <span className="text-xs font-bold sm:text-sm">Y</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-lg border border-border bg-surface shadow-[0_16px_40px_-12px_rgba(0,0,0,0.6)]">
          <div className="flex items-center gap-2.5 border-b border-border/60 px-3.5 py-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/20 text-xs font-bold text-accent">
              Y
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">You</p>
              <p className="truncate text-xs text-muted">Players&apos; Union member</p>
            </div>
          </div>

          <button
            onClick={() => {
              setOpen(false);
              onOpenBookings();
            }}
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-surface-2"
          >
            <CalendarCheck size={16} className="text-accent" />
            My bookings
          </button>
        </div>
      )}
    </div>
  );
}
