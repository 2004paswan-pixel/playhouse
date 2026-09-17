export type SlotStatus = "free" | "waiting" | "full";

export interface Slot {
  id: string;
  label: string;
  start_time: string; // "06:00"
  end_time: string; // "09:00"
  is_peak: boolean;
  capacity: number;
  booked_count: number;
  waiting_count: number;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  campus: string;
  avatar_url?: string;
  credits: number;
}

export type BookingStatus = "confirmed" | "waiting" | "cancelled";

export interface Booking {
  id: string;
  slot_id: string;
  slot_label: string;
  user_id: string;
  user_name: string;
  status: BookingStatus;
  created_at: string;
}

export interface CreditTransaction {
  id: string;
  amount: number;
  reason: string;
  created_at: string;
}

export function slotStatus(slot: Slot): SlotStatus {
  if (slot.booked_count < slot.capacity) return "free";
  if (slot.waiting_count > 0) return "waiting";
  return "full";
}
