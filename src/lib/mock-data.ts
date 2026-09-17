import { Booking, CreditTransaction, Profile, Slot } from "./types";

export const mockProfile: Profile = {
  id: "demo-user",
  name: "Pranav Joshi",
  email: "pranav.joshi@mastersunion.org",
  campus: "Masters' Union",
  credits: 13,
};

export const mockSlots: Slot[] = [
  {
    id: "morning",
    label: "Morning peak",
    start_time: "06:00",
    end_time: "09:00",
    is_peak: true,
    capacity: 40,
    booked_count: 40,
    waiting_count: 6,
  },
  {
    id: "afternoon",
    label: "Afternoon peak",
    start_time: "12:30",
    end_time: "14:00",
    is_peak: true,
    capacity: 50,
    booked_count: 32,
    waiting_count: 0,
  },
  {
    id: "evening",
    label: "Evening peak",
    start_time: "17:00",
    end_time: "22:00",
    is_peak: true,
    capacity: 60,
    booked_count: 60,
    waiting_count: 2,
  },
  {
    id: "off-peak",
    label: "Off-peak",
    start_time: "09:00",
    end_time: "12:30",
    is_peak: false,
    capacity: 30,
    booked_count: 4,
    waiting_count: 0,
  },
];

export const mockBookings: Booking[] = [
  {
    id: "b1",
    slot_id: "morning",
    slot_label: "Morning peak · 06:00–09:00",
    user_id: "u1",
    user_name: "Ananya Rao",
    status: "confirmed",
    created_at: new Date().toISOString(),
  },
  {
    id: "b2",
    slot_id: "morning",
    slot_label: "Morning peak · 06:00–09:00",
    user_id: "u2",
    user_name: "Kabir Sen",
    status: "waiting",
    created_at: new Date().toISOString(),
  },
  {
    id: "b3",
    slot_id: "evening",
    slot_label: "Evening peak · 17:00–22:00",
    user_id: "u3",
    user_name: "Meher Iyer",
    status: "waiting",
    created_at: new Date().toISOString(),
  },
];

export const mockTransactions: CreditTransaction[] = [
  { id: "t1", amount: 10, reason: "Referral bonus", created_at: new Date().toISOString() },
  { id: "t2", amount: -2, reason: "Booked Morning peak slot", created_at: new Date().toISOString() },
  { id: "t3", amount: 5, reason: "Top up", created_at: new Date().toISOString() },
];
