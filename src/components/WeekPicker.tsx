"use client";

import { currentWeekDates, dayLabel, isPastDate, todayISO } from "@/lib/date-utils";

export default function WeekPicker({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (date: string) => void;
}) {
  const today = todayISO();
  const week = currentWeekDates();

  return (
    <div className="mb-3 grid grid-cols-7 gap-1 sm:mb-4 sm:gap-1.5">
      {week.map((iso) => {
        const { weekday, day } = dayLabel(iso);
        const past = isPastDate(iso, today);
        const isToday = iso === today;
        const active = iso === selected;

        return (
          <button
            key={iso}
            disabled={past}
            onClick={() => onSelect(iso)}
            className={`flex flex-col items-center justify-center gap-0.5 rounded-lg border py-1.5 text-center transition-all sm:py-2 ${
              active
                ? "border-accent bg-accent/15 text-accent shadow-[0_0_16px_-4px_rgba(255,214,10,0.5)]"
                : past
                  ? "cursor-not-allowed border-border/40 text-muted/40"
                  : "border-border/70 text-muted hover:-translate-y-0.5 hover:border-accent/50 hover:text-foreground active:scale-95"
            }`}
          >
            <span className="text-[9px] font-medium uppercase leading-none sm:text-[10px]">
              {weekday}
            </span>
            <span
              className={`text-sm font-semibold leading-none sm:text-base ${
                isToday && !active ? "text-accent" : ""
              }`}
            >
              {day}
            </span>
          </button>
        );
      })}
    </div>
  );
}
