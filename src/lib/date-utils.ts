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

/** `iso` shifted by `days` (negative goes backward). */
export function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

export function formatFullDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
}

/** True if a booking for `date`/`start` is still ahead of (or at) `now`. */
export function isUpcoming(date: string, start: string, today: string = todayISO(), now: string = nowHHMM()): boolean {
  if (date > today) return true;
  if (date < today) return false;
  return start >= now;
}

/** " · Fri 18" suffix for a booking on a day other than today; "" for today. */
export function dateSuffix(date: string, today: string = todayISO()): string {
  if (date === today) return "";
  const { weekday, day } = dayLabel(date);
  return ` · ${weekday} ${day}`;
}

/** Compact timestamp for the XP history list: "Today, 6:42 PM" / "Fri 18 Sep, 6:42 PM". */
export function formatTransactionTime(at: number): string {
  const d = new Date(at);
  const iso = toISODate(d);
  const today = todayISO();
  const time = d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
  if (iso === today) return `Today, ${time}`;
  const { weekday, day } = dayLabel(iso);
  return `${weekday} ${day}, ${time}`;
}
