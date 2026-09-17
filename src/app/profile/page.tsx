"use client";

import AppShell from "@/components/AppShell";
import { mockProfile, mockTransactions } from "@/lib/mock-data";
import { Coins } from "lucide-react";

export default function ProfilePage() {
  return (
    <AppShell profile={mockProfile} title="My activity">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface p-5 lg:col-span-1">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">{mockProfile.name}</h2>
              <p className="text-sm text-muted">{mockProfile.email}</p>
              <span className="mt-2 inline-block rounded-full border border-border px-2 py-0.5 text-xs text-muted">
                {mockProfile.campus}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-4 py-3">
            <Coins size={18} className="text-accent" />
            <div>
              <p className="text-lg font-semibold text-accent">
                {mockProfile.credits}
              </p>
              <p className="text-xs text-accent/80">credits available</p>
            </div>
          </div>
          <button className="mt-3 w-full rounded-lg bg-foreground py-2 text-sm font-medium text-background hover:opacity-90">
            Top up credits
          </button>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5 lg:col-span-2">
          <h2 className="mb-3 text-base font-semibold">Transaction history</h2>
          <ul className="divide-y divide-border">
            {mockTransactions.map((t) => (
              <li key={t.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm">{t.reason}</p>
                  <p className="text-xs text-muted">
                    {new Date(t.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`text-sm font-medium ${
                    t.amount >= 0 ? "text-success" : "text-danger"
                  }`}
                >
                  {t.amount >= 0 ? "+" : ""}
                  {t.amount}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AppShell>
  );
}
