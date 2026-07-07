import { describe, it, expect } from 'vitest';
import generateTransactionId from "../../../features/pos/services/generatetransactionId";
 
describe('generateTransactionId', () => {
  it('should return a string', () => {
    expect(typeof generateTransactionId()).toBe('string');
  });
 
  it('should start with TXN-', () => {
    expect(generateTransactionId().startsWith('TXN-')).toBe(true);
  });
 
  it('should contain the current date in YYYYMMDD format', () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    expect(generateTransactionId()).toContain(`${year}${month}${day}`);
  });
 
  it('should follow the format TXN-YYYYMMDD-XXXXXX', () => {
    expect(generateTransactionId()).toMatch(/^TXN-\d{8}-[A-Z0-9]{6}$/);
  });
 
  it('should generate unique IDs on each call', () => {
    const id1 = generateTransactionId();
    const id2 = generateTransactionId();
    expect(id1).not.toBe(id2);
  });
});
 