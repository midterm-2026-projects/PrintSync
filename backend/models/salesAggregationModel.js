
export default {
  /**
   * Query-only stub: should return raw order rows for the provided target date.
   * Unit tests should mock this to return an array of rows shaped like:
   *   { createdAt: Date|string, total: number|string }
   */
  queryOrdersByDate: () => {
    throw new Error("Not implemented: model query stub");
  },
};
