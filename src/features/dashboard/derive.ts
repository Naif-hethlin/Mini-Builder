// =============================================================================
// Dashboard derive — turns the raw bookings store into the higher-level
// shapes the dashboard sub-pages need (customer rollups, monthly counts,
// activity feed). Pure functions; safe to call from any component.
// =============================================================================

import type { Booking } from "@/features/workflows/booking/store";

export type Customer = {
  /** Stable across renders — derived from a hash of the customer's phone. */
  id: string;
  name: string;
  phone: string;
  firstBookingAt: number; // unix ms
  lastBookingAt: number;
  totalBookings: number;
  /** "نشط" if any booking is pending or done in the last 30 days. */
  status: "نشط" | "غير نشط";
};

const NORMALIZE_PHONE = /[^\d+]/g;

function normalizePhone(raw: string): string {
  return raw.replace(NORMALIZE_PHONE, "");
}

/**
 * Roll up the booking list into one row per customer, keyed by the
 * (normalized) phone number — the closest thing we have to a stable
 * identity for now.
 */
export function customersFromBookings(bookings: Booking[]): Customer[] {
  const byPhone = new Map<string, Customer>();
  const now = Date.now();
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

  for (const b of bookings) {
    const phoneKey = normalizePhone(b.phone);
    if (!phoneKey) continue;

    const existing = byPhone.get(phoneKey);
    const recent =
      b.status !== "canceled" && now - b.createdAt < THIRTY_DAYS;

    if (existing) {
      existing.totalBookings += 1;
      if (b.createdAt > existing.lastBookingAt) {
        existing.lastBookingAt = b.createdAt;
        // Use the most recent name on file in case of typos / renames.
        existing.name = b.name;
      }
      if (b.createdAt < existing.firstBookingAt) {
        existing.firstBookingAt = b.createdAt;
      }
      if (recent) existing.status = "نشط";
    } else {
      byPhone.set(phoneKey, {
        id: `cust-${phoneKey.replace(/[^a-zA-Z0-9]/g, "")}`,
        name: b.name,
        phone: b.phone,
        firstBookingAt: b.createdAt,
        lastBookingAt: b.createdAt,
        totalBookings: 1,
        status: recent ? "نشط" : "غير نشط",
      });
    }
  }

  return Array.from(byPhone.values()).sort(
    (a, b) => b.lastBookingAt - a.lastBookingAt,
  );
}

export type DashboardMetrics = {
  totalBookings: number;
  pendingBookings: number;
  doneBookings: number;
  canceledBookings: number;
  totalCustomers: number;
  newCustomersThisMonth: number;
  bookingsThisMonth: number;
  bookingsLastMonth: number;
  trendPercent: number;
  spark: number[]; // bookings per day for the last 14 days
};

/** Derive every dashboard headline number from the bookings list. */
export function metricsFromBookings(bookings: Booking[]): DashboardMetrics {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const startOfLastMonth = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    1,
  ).getTime();
  const endOfLastMonth = startOfMonth - 1;

  let pending = 0;
  let done = 0;
  let canceled = 0;
  let thisMonth = 0;
  let lastMonth = 0;

  for (const b of bookings) {
    if (b.status === "pending") pending += 1;
    else if (b.status === "done") done += 1;
    else if (b.status === "canceled") canceled += 1;
    if (b.createdAt >= startOfMonth) thisMonth += 1;
    else if (b.createdAt >= startOfLastMonth && b.createdAt <= endOfLastMonth) {
      lastMonth += 1;
    }
  }

  const customers = customersFromBookings(bookings);
  const newCustomers = customers.filter(
    (c) => c.firstBookingAt >= startOfMonth,
  ).length;

  const trendPercent =
    lastMonth === 0 && thisMonth === 0
      ? 0
      : lastMonth === 0
        ? 100
        : Math.round(((thisMonth - lastMonth) / lastMonth) * 100);

  // Sparkline: bookings per day for the last 14 days.
  const DAY_MS = 24 * 60 * 60 * 1000;
  const spark = new Array(14).fill(0) as number[];
  for (const b of bookings) {
    const daysAgo = Math.floor((Date.now() - b.createdAt) / DAY_MS);
    if (daysAgo >= 0 && daysAgo < 14) {
      spark[13 - daysAgo] += 1;
    }
  }

  return {
    totalBookings: bookings.length,
    pendingBookings: pending,
    doneBookings: done,
    canceledBookings: canceled,
    totalCustomers: customers.length,
    newCustomersThisMonth: newCustomers,
    bookingsThisMonth: thisMonth,
    bookingsLastMonth: lastMonth,
    trendPercent,
    spark,
  };
}

/** Most-recent N bookings, newest first — for the activity feed. */
export function recentBookings(bookings: Booking[], n = 5): Booking[] {
  return [...bookings]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, n);
}

// =============================================================================
// CSV export — small helper used by the Customers table.
// =============================================================================

function escapeCsv(s: string): string {
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function customersToCsv(customers: Customer[]): string {
  const header = [
    "id",
    "name",
    "phone",
    "first_booking",
    "last_booking",
    "total_bookings",
    "status",
  ].join(",");
  const rows = customers.map((c) =>
    [
      c.id,
      escapeCsv(c.name),
      escapeCsv(c.phone),
      new Date(c.firstBookingAt).toISOString(),
      new Date(c.lastBookingAt).toISOString(),
      String(c.totalBookings),
      c.status,
    ].join(","),
  );
  return [header, ...rows].join("\n");
}

export function downloadCsv(filename: string, content: string): void {
  const blob = new Blob([`﻿${content}`], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
