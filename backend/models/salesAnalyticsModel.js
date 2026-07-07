/*
 * - Since we cannot communicate with the DB yet, these query functions are
 *   intentionally non-functional and are meant to be mocked in unit tests.
*/

export default {
  /**
   * Query-only stub: should return raw order rows for the provided target date.
   * Unit tests should mock this to return an array of rows shaped like:
   *   { createdAt: Date|string, total: number|string }
   */
  queryOrdersByDate: () => {
    throw new Error("Not implemented: model query stub");
  },

  /**
   * Query/prep-only stub for Gemini-compatible payload.
   * Unit tests should mock this to return:
   *   { date, totalSales }
   */
  buildAiReadySalesDataPayload: () => {
    throw new Error("Not implemented: model query stub");
  },
};
