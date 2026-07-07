import { describe, it, expect, vi } from "vitest";
import { formatAiReadySalesData } from "../../services/aiReadySalesDataService";

vi.mock("../../models/aiReadySalesDataModel.js", () => {
  const validateDate = vi.fn((date) => {
    if (!date) throw new TypeError("date is required");
    return date;
  });

  const validateTotalSales = vi.fn((totalSales) => {
    if (!Number.isFinite(totalSales)) {
      throw new TypeError("totalSales must be a finite number");
    }
    return totalSales;
  });

  return {
    default: {
      validateDate,
      validateTotalSales,
    },
  };
});

describe("formatAiReadySalesData (with mocked model)", () => {
  it("returns a flat JSON object compatible with the Gemini prompt payload", () => {
    const payload = formatAiReadySalesData({ date: "2026-07-01", totalSales: 5000 });

    expect(payload).toEqual({ date: "2026-07-01", totalSales: 5000 });
  });

  it("throws when date is missing", () => {
    expect(() => formatAiReadySalesData({ totalSales: 10 })).toThrow(TypeError);
  });

  it("throws when totalSales is not a finite number", () => {
    expect(() => formatAiReadySalesData({ date: "2026-07-01", totalSales: NaN })).toThrow(TypeError);
    expect(() => formatAiReadySalesData({ date: "2026-07-01", totalSales: Infinity })).toThrow(TypeError);
    expect(() =>
      formatAiReadySalesData({ date: "2026-07-01", totalSales: "10" })
    ).toThrow(TypeError);
    expect(() => formatAiReadySalesData({ date: "2026-07-01", totalSales: undefined })).toThrow(TypeError);
    expect(() => formatAiReadySalesData({ date: "2026-07-01", totalSales: null })).toThrow(TypeError);
  });

  it("throws when the whole input object is missing", () => {
    expect(() => formatAiReadySalesData()).toThrow(TypeError);
    // also explicit undefined
    expect(() => formatAiReadySalesData(undefined)).toThrow(TypeError);
  });
});
