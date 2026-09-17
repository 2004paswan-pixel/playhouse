"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CalendarCheck } from "lucide-react";
import MyBookingsPanel from "./MyBookingsPanel";
import ScannerButton from "./ScannerButton";
import { useBookings } from "@/lib/bookings-context";

export default function Header() {
  const [open, setOpen] = useState(false);
  const { xp } = useBookings();

  return (
    <>
      <header className="flex flex-nowrap items-center justify-between gap-2 border-b border-border px-3.5 py-2.5 sm:px-6 sm:py-3">
        <Link href="/" className="flex min-w-0 shrink items-center">
          <Image
            src="/logo.png"
            alt="Playhouse"
            width={983}
            height={240}
            priority
            className="h-7 w-auto shrink-0 sm:h-11"
          />
        </Link>

        <div className="flex shrink-0 items-center gap-2 sm:gap-5">
          <button
            onClick={() => setOpen(true)}
            aria-label="My bookings"
            className="flex shrink-0 items-center gap-1.5 rounded-md p-1.5 text-muted transition-colors hover:text-foreground sm:gap-2 sm:p-0 sm:text-base"
          >
            <CalendarCheck size={19} className="shrink-0 sm:hidden" />
            <CalendarCheck size={18} className="hidden shrink-0 sm:block" />
            <span className="hidden sm:inline">My bookings</span>
          </button>

          <div className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border border-accent/50 bg-accent/10 py-1.5 pl-1.5 pr-2.5 text-sm font-semibold text-accent sm:gap-2 sm:py-2 sm:pl-2.5 sm:pr-4 sm:text-base">
            <Image src="/xp-token.png" alt="XP" width={24} height={24} className="h-[18px] w-[18px] shrink-0 sm:h-6 sm:w-6" />
            {xp}
            <span className="text-xs font-normal text-accent/70 sm:text-sm">XP</span>
          </div>
        </div>
      </header>

      {open && <MyBookingsPanel onClose={() => setOpen(false)} />}
      <ScannerButton />
    </>
  );
}
