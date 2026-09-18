// Small date helpers for the weekly picker. Dates are represented as plain
// "YYYY-MM-DD" strings (zero-padded, so lexicographic compare == chronological
// compare) rather than Date objects, to keep them trivial to use as object
// keys and to persist in localStorage.

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function nowHHMM(): string {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Monday-start week containing `ref` (defaults to today), as 7 ISO date strings. */
export function currentWeekDates(ref: Date = new Date()): string[] {
  const day = ref.getDay(); // 0 = Sun, 1 = Mon, ... 6 = Sat
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(ref);
  monday.setDate(ref.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);

  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(toISODate(d));
  }
  return dates;
}

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function dayLabel(iso: string): { weekday: string; day: number } {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return { weekday: WEEKDAY_LABELS[date.getDay()], day: d };
}

export function isPastDate(iso: string, todayIso: string = todayISO()): boolean {
  return iso < todayIso;
}

export function formatFullDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
}
