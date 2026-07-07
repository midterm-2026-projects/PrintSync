import { describe, it, expect, vi } from "vitest";
import {
  aggregateSalesByDate,
  aggregateSalesByDateFromDb,
  formatAiReadySalesData,
} from "../../services/salesAnalyticsService";

vi.mock("../../models/salesAnalyticsModel.js", () => {
  const queryOrdersByDate = vi.fn();
  const buildAiReadySalesDataPayload = vi.fn();

  globalThis.__queryOrdersByDateSpy = queryOrdersByDate;
  globalThis.__buildAiReadySalesDataPayloadSpy = buildAiReadySalesDataPayload;

  return {
    default: {
      queryOrdersByDate,
      buildAiReadySalesDataPayload,
    },
  };
});

describe("Sales aggregation (salesAnalyticsService)", () => {
  const getQuerySpy = () => globalThis.__queryOrdersByDateSpy;

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

  it("throws on invalid targetDate", () => {
    expect(() => aggregateSalesByDate([], "not-a-date")).toThrow(TypeError);
  });

  it("throws on invalid orders input type", () => {
    expect(() => aggregateSalesByDate(null, "2026-07-01T00:00:00")).toThrow(
      TypeError
    );
  });

  it("works with Date instances", () => {
    const orders = [
      { createdAt: new Date("2026-07-01T10:00:00"), total: 10 },
      { createdAt: new Date("2026-07-01T11:00:00"), total: 5 },
    ];

    const total = aggregateSalesByDate(orders, new Date("2026-07-01T00:00:00"));
    expect(total).toBe(15);
  });

  it("aggregateSalesByDateFromDb sums mocked model rows", () => {
    const spy = getQuerySpy();
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

  it("aggregateSalesByDateFromDb returns 0 when model returns empty array", () => {
    const spy = getQuerySpy();
    spy.mockClear();

    spy.mockReturnValue([]);

    const total = aggregateSalesByDateFromDb("2026-07-01T00:00:00");
    expect(total).toBe(0);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("aggregateSalesByDateFromDb throws when model returns non-array", () => {
    const spy = getQuerySpy();
    spy.mockClear();

    spy.mockReturnValue(null);

    expect(() => aggregateSalesByDateFromDb("2026-07-01T00:00:00")).toThrow(
      TypeError
    );
    expect(spy).toHaveBeenCalledTimes(1);
  });
});

describe("AI-ready sales data (salesAnalyticsService)", () => {
  const getBuildSpy = () => globalThis.__buildAiReadySalesDataPayloadSpy;

  it("returns a flat Gemini-compatible JSON object (model is mocked)", () => {
    const spy = getBuildSpy();
    spy.mockClear();

    spy.mockReturnValue({ date: "2026-07-01", totalSales: 150 });

    const out = formatAiReadySalesData({ date: "2026-07-01", totalSales: 150 });

    expect(out).toEqual({ date: "2026-07-01", totalSales: 150 });
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("throws when date is missing (and does not call the model)", () => {
    const spy = getBuildSpy();
    spy.mockClear();

    expect(() => formatAiReadySalesData({ totalSales: 10 })).toThrow(TypeError);
    expect(spy).not.toHaveBeenCalled();
  });

  it("throws when totalSales is not a finite number (and does not call the model)", () => {
    const spy = getBuildSpy();
    spy.mockClear();

    expect(() => formatAiReadySalesData({ date: "2026-07-01", totalSales: NaN })).toThrow(
      TypeError
    );
    expect(spy).not.toHaveBeenCalled();
  });

  it("throws when input is missing (and does not call the model)", () => {
    const spy = getBuildSpy();
    spy.mockClear();

    // input default is {}, so to hit the "missing whole input" behavior,
    // we explicitly pass null.
    expect(() => formatAiReadySalesData(null)).toThrow(TypeError);
    expect(spy).not.toHaveBeenCalled();
  });

  it("throws when input is not an object", () => {
    const spy = getBuildSpy();
    spy.mockClear();

    expect(() => formatAiReadySalesData(123)).toThrow(TypeError);
    expect(spy).not.toHaveBeenCalled();
  });
});
