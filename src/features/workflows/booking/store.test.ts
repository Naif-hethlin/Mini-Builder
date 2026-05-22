import { describe, expect, it } from "vitest";
import { useBookings } from "./store";

const PROJECT = "project-1";

type AddInput = Parameters<
  ReturnType<typeof useBookings.getState>["add"]
>[0];

const sample = (overrides: Partial<AddInput> = {}): AddInput => ({
  projectId: PROJECT,
  name: "نورة",
  phone: "0500000000",
  date: "2026-05-21",
  time: "10:00",
  staffName: undefined,
  ...overrides,
});

describe("useBookings", () => {
  it("adds a booking with sensible defaults", () => {
    const booking = useBookings.getState().add(sample());
    expect(booking.status).toBe("pending");
    expect(booking.id).toBeTruthy();
    expect(useBookings.getState().list(PROJECT)).toHaveLength(1);
  });

  it("isolates bookings per project", () => {
    useBookings.getState().add(sample());
    useBookings.getState().add(sample({ projectId: "project-2" }));
    expect(useBookings.getState().list(PROJECT)).toHaveLength(1);
    expect(useBookings.getState().list("project-2")).toHaveLength(1);
  });

  it("setStatus updates the booking in place", () => {
    const booking = useBookings.getState().add(sample());
    useBookings.getState().setStatus(PROJECT, booking.id, "done");
    expect(useBookings.getState().list(PROJECT)[0].status).toBe("done");
  });

  it("remove deletes a booking", () => {
    const booking = useBookings.getState().add(sample());
    useBookings.getState().remove(PROJECT, booking.id);
    expect(useBookings.getState().list(PROJECT)).toHaveLength(0);
  });

  it("list() returns empty array for an unknown project", () => {
    expect(useBookings.getState().list("nope")).toEqual([]);
  });
});
