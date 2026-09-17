"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CalendarCheck } from "lucide-react";
import MyBookingsPanel from "./MyBookingsPanel";

export default function Header({ xp = 100 }: { xp?: number }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="flex items-center justify-between border-b border-border px-6 py-3">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="Playhouse"
            width={983}
            height={240}
            priority
            className="h-11 w-auto shrink-0"
          />
        </Link>

        <div className="flex items-center gap-5">
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 text-base text-muted transition-colors hover:text-foreground"
          >
            <CalendarCheck size={18} />
            My bookings
          </button>

          <div className="flex items-center gap-2 rounded-md border border-accent/50 bg-accent/10 py-2 pl-2.5 pr-4 text-base font-semibold text-accent">
            <Image src="/xp-token.png" alt="XP" width={24} height={24} className="shrink-0" />
            {xp}
            <span className="text-sm font-normal text-accent/70">XP</span>
          </div>
        </div>
      </header>

      {open && <MyBookingsPanel onClose={() => setOpen(false)} />}
    </>
  );
}
