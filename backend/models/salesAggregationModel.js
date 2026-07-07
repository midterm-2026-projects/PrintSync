/**
 * Sales aggregation model:
 * Pure helpers used by the aggregation service.
 */

function toLocalDayKey(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toValidDate(input) {
  const d = input instanceof Date ? input : new Date(input);
  if (!Number.isFinite(d.getTime())) {
    throw new TypeError("Invalid date input");
  }
  return d;
}

function normalizeRowTotal(row) {
  const value = typeof row.total === "string" ? Number(row.total) : row.total;
  return value;
}

export default {
  toLocalDayKey,
  toValidDate,
  normalizeRowTotal,
};
