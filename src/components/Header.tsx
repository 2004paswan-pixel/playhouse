"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import MyBookingsPanel from "./MyBookingsPanel";
import XPHistoryPanel from "./XPHistoryPanel";
import ScannerButton from "./ScannerButton";
import ProfileMenu from "./ProfileMenu";
import { useBookings } from "@/lib/bookings-context";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [xpHistoryOpen, setXpHistoryOpen] = useState(false);
  const { xp } = useBookings();

  return (
    <>
      <header className="flex flex-nowrap items-center justify-between gap-2 border-b border-border px-3.5 py-2.5 sm:px-6 sm:py-3">
        <Link href="/" className="flex min-w-0 shrink items-center">
          <Image
            src="/logo.png"
            alt="Players' Union"
            width={1324}
            height={304}
            priority
            className="h-7 w-auto shrink-0 sm:h-11"
          />
        </Link>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            onClick={() => setXpHistoryOpen(true)}
            aria-label="View XP history"
            className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border border-accent/50 bg-accent/10 py-1.5 pl-1.5 pr-2.5 text-sm font-semibold text-accent transition-all active:scale-95 hover:bg-accent/20 sm:gap-2 sm:py-2 sm:pl-2.5 sm:pr-4 sm:text-base"
          >
            <Image src="/xp-token.png" alt="XP" width={24} height={24} className="h-[18px] w-[18px] shrink-0 sm:h-6 sm:w-6" />
            {xp}
            <span className="text-xs font-normal text-accent/70 sm:text-sm">XP</span>
          </button>

          <ProfileMenu onOpenBookings={() => setOpen(true)} />
        </div>
      </header>

      {open && <MyBookingsPanel onClose={() => setOpen(false)} />}
      {xpHistoryOpen && <XPHistoryPanel onClose={() => setXpHistoryOpen(false)} />}
      <ScannerButton />
    </>
  );
}
