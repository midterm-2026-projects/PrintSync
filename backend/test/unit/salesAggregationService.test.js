import { describe, it, expect, vi } from "vitest";
import {
  aggregateSalesByDate,
  aggregateSalesByDateFromDb,
} from "../../services/salesAggregationService";

vi.mock("../../models/salesAggregationModel.js", () => {
  const queryOrdersByDate = vi.fn();
  globalThis.__queryOrdersByDateSpy = queryOrdersByDate;

  return {
    default: {
      queryOrdersByDate,
    },
  };
});

describe("aggregateSalesByDate (pure aggregation from provided orders)", () => {
  it("sums totals for orders matching the target local calendar day", () => {
    const orders = [
      { createdAt: "2026-07-01T09:00:00", total: 100 },
      { createdAt: "2026-07-01T13:15:00", total: "50" },
      { createdAt: "2026-07-02T01:00:00", total: 999 },
    ];

    const total = aggregateSalesByDate(orders, "2026-07-01T00:00:00");
    expect(total).toBe(150);
  });

  it("returns 0 when orders array is empty (still validates targetDate)", () => {
    const total = aggregateSalesByDate([], "2026-07-01T00:00:00");
    expect(total).toBe(0);
  });

  it("ignores orders that do not match the target day", () => {
    const orders = [
      { createdAt: "2026-06-30T23:59:00", total: 10 },
      { createdAt: "2026-07-02T00:00:00", total: 20 },
    ];

    const total = aggregateSalesByDate(orders, "2026-07-01T00:00:00");
    expect(total).toBe(0);
  });

  it("throws on invalid targetDate", () => {
    expect(() => aggregateSalesByDate([], "not-a-date")).toThrow(TypeError);
  });

  it("throws on invalid orders input type", () => {
    expect(() => aggregateSalesByDate(null, "2026-07-01T00:00:00")).toThrow(TypeError);
  });

  it("works with Date instances", () => {
    const orders = [
      { createdAt: new Date("2026-07-01T10:00:00"), total: 10 },
      { createdAt: new Date("2026-07-01T11:00:00"), total: 5 },
    ];

    const total = aggregateSalesByDate(orders, new Date("2026-07-01T00:00:00"));
    expect(total).toBe(15);
  });
});

describe("aggregateSalesByDateFromDb (model query is mocked; service owns logic)", () => {
  const getSpy = () => globalThis.__queryOrdersByDateSpy;

  it("returns the aggregated sum for the queried target day", () => {
    const spy = getSpy();
    spy.mockClear();

    spy.mockReturnValue([
      { createdAt: "2026-07-01T09:00:00", total: 100 },
      { createdAt: "2026-07-01T13:15:00", total: "50" },
      { createdAt: "2026-07-02T01:00:00", total: 999 },
    ]);

    const total = aggregateSalesByDateFromDb("2026-07-01T00:00:00");
    expect(total).toBe(150);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("returns 0 when the model returns an empty array", () => {
    const spy = getSpy();
    spy.mockClear();

    spy.mockReturnValue([]);

    const total = aggregateSalesByDateFromDb("2026-07-01T00:00:00");
    expect(total).toBe(0);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("throws when model returns a non-array", () => {
    const spy = getSpy();
    spy.mockClear();

    spy.mockReturnValue(null);

    expect(() => aggregateSalesByDateFromDb("2026-07-01T00:00:00")).toThrow(TypeError);
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
