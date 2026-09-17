"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarClock,
  ListOrdered,
  Activity,
  UserRound,
  LogOut,
} from "lucide-react";
import { Profile } from "@/lib/types";

const NAV_ITEMS = [
  { href: "/", label: "Slots", icon: CalendarClock },
  { href: "/queue", label: "Queue", icon: ListOrdered },
  { href: "/profile", label: "My activity", icon: Activity },
];

export default function Sidebar({ profile }: { profile: Profile }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col justify-between border-r border-border bg-background px-3 py-4">
      <div>
        <div className="mb-6 flex items-center gap-2 px-2">
          <Image src="/logo.svg" alt="Unions'Q" width={28} height={28} />
          <span className="text-sm font-semibold leading-tight">
            Unions&apos;Q
          </span>
        </div>

        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-accent/15 text-accent"
                    : "text-muted hover:bg-surface hover:text-foreground"
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-border pt-3">
        <Link
          href="/profile"
          className="flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-surface"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-xs">
            <UserRound size={16} className="text-muted" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{profile.name}</p>
            <p className="truncate text-xs text-muted">{profile.email}</p>
          </div>
        </Link>
        <button className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted hover:bg-surface hover:text-foreground">
          <LogOut size={16} />
          Log out
        </button>
      </div>
    </aside>
  );
}
