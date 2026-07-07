import { describe, it, expect, vi } from "vitest";
import { formatAiReadySalesData } from "../../services/aiReadySalesDataService";

vi.mock("../../models/aiReadySalesDataModel.js", () => {
  const buildAiReadySalesDataPayload = vi.fn(({ date, totalSales }) => ({
    date,
    totalSales,
  }));

  
  // Make the spy accessible to assertions without referencing hoisted locals.
  globalThis.__buildAiReadySalesDataPayload = buildAiReadySalesDataPayload;

  return {
    default: {
      buildAiReadySalesDataPayload,
    },
  };
});

describe("formatAiReadySalesData (service validates; model is mocked query-only)", () => {
  const getSpy = () => globalThis.__buildAiReadySalesDataPayload;

  it("returns a flat JSON object compatible with the Gemini prompt payload", () => {
    const spy = getSpy();
    spy.mockClear();

    const payload = formatAiReadySalesData({ date: "2026-07-01", totalSales: 5000 });

    expect(payload).toEqual({ date: "2026-07-01", totalSales: 5000 });
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith({
      date: "2026-07-01",
      totalSales: 5000,
    });
  });

  it("throws when date is missing (and does not call the model)", () => {
    const spy = getSpy();
    spy.mockClear();

    expect(() => formatAiReadySalesData({ totalSales: 10 })).toThrow(TypeError);
    expect(spy).toHaveBeenCalledTimes(0);
  });

  it("throws when totalSales is not a finite number (and does not call the model)", () => {
    const spy = getSpy();
    spy.mockClear();

    expect(() => formatAiReadySalesData({ date: "2026-07-01", totalSales: NaN })).toThrow(TypeError);
    expect(spy).toHaveBeenCalledTimes(0);

    expect(() => formatAiReadySalesData({ date: "2026-07-01", totalSales: Infinity })).toThrow(TypeError);
    expect(spy).toHaveBeenCalledTimes(0);

    expect(() =>
      formatAiReadySalesData({ date: "2026-07-01", totalSales: "10" })
    ).toThrow(TypeError);
    expect(spy).toHaveBeenCalledTimes(0);

    expect(() => formatAiReadySalesData({ date: "2026-07-01", totalSales: undefined })).toThrow(TypeError);
    expect(spy).toHaveBeenCalledTimes(0);

    expect(() => formatAiReadySalesData({ date: "2026-07-01", totalSales: null })).toThrow(TypeError);
    expect(spy).toHaveBeenCalledTimes(0);
  });

  it("throws when the whole input object is missing (and does not call the model)", () => {
    const spy = getSpy();
    spy.mockClear();

    expect(() => formatAiReadySalesData()).toThrow(TypeError);
    expect(spy).toHaveBeenCalledTimes(0);

    expect(() => formatAiReadySalesData(undefined)).toThrow(TypeError);
    expect(spy).toHaveBeenCalledTimes(0);
  });

  it("throws when input is not an object (and does not call the model)", () => {
    const spy = getSpy();
    spy.mockClear();

    expect(() => formatAiReadySalesData(null)).toThrow(TypeError);
    expect(spy).toHaveBeenCalledTimes(0);

    expect(() => formatAiReadySalesData(123)).toThrow(TypeError);
    expect(spy).toHaveBeenCalledTimes(0);
  });
});

