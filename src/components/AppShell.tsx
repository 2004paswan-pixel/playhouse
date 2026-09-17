import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import CreditsBadge from "./CreditsBadge";
import Footer from "./Footer";
import { Profile } from "@/lib/types";

export default function AppShell({
  profile,
  title,
  subtitle,
  action,
  children,
}: {
  profile: Profile;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar profile={profile} />
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold">{title}</h1>
            {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-3">
            {action}
            <CreditsBadge credits={profile.credits} />
          </div>
        </header>
        <main className="flex-1 px-6 py-6">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
