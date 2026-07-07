/**
 * Generates a unique transaction ID in the format:
 * TXN-<YYYYMMDD>-<random 6-char alphanumeric>
 * Example: TXN-20231027-A3F9K2
 */

const generateTransactionId = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const datePart = `${year}${month}${day}`;
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TXN-${datePart}-${randomPart}`;
};

export default generateTransactionId;