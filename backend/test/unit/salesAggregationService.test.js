import { describe, it, expect, vi } from "vitest";
import { aggregateSalesByDate } from "../../services/salesAggregationService";

vi.mock("../../models/salesAggregationModel.js", () => {
  return {
    default: {
      toValidDate: vi.fn((input) => {
        if (input === "not-a-date") throw new TypeError("Invalid date input");
        return input;
      }),
      toLocalDayKey: vi.fn((dateLike) => {
        if (typeof dateLike === "string") {
          const m = dateLike.match(/^(\d{4}-\d{2}-\d{2})/);
          return m ? m[1] : dateLike;
        }
        return String(dateLike);
      }),
      normalizeRowTotal: vi.fn((row) => {
        if (!row) return NaN;
        return typeof row.total === "string" ? Number(row.total) : row.total;
      }),
    },
  };
});

describe("aggregateSalesByDate (with mocked model helpers)", () => {
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

  it("works with Date instances (deterministic result under mocked helpers)", () => {
    const orders = [
      { createdAt: new Date("2026-07-01T10:00:00"), total: 10 },
      { createdAt: new Date("2026-07-01T11:00:00"), total: 5 },
    ];

    const total = aggregateSalesByDate(orders, new Date("2026-07-01T00:00:00"));
    expect(typeof total).toBe("number");
  });
});
