import { describe, it, expect } from 'vitest';
import generateTransactionId from '../../utils/generateTransactionId';

describe('Utility: generateTransactionId', () => {

  it('should return a string', () => {
    const id = generateTransactionId();
    expect(typeof id).toBe('string');
  });

  it('should start with the "TXN-" prefix', () => {
    const id = generateTransactionId();
    expect(id.startsWith('TXN-')).toBe(true);
  });

  /**
   * Requirement: format TXN-YYYYMMDD-XXXXXX
   * Regex breakdown:
   * ^TXN-      : Starts with TXN-
   * \d{8}      : Followed by exactly 8 digits (Date)
   * -          : Followed by a dash
   * [A-Z0-9]{6}: Followed by 6 uppercase alphanumeric characters
   * $          : End of string
   */
  it('should follow the correct pattern: TXN-YYYYMMDD-XXXXXX', () => {
    const id = generateTransactionId();
    const pattern = /^TXN-\d{8}-[A-Z0-9]{6}$/;
    expect(id).toMatch(pattern);
  });

  it('should generate a unique ID every time it is called', () => {
    const id1 = generateTransactionId();
    const id2 = generateTransactionId();
    expect(id1).not.toBe(id2);
  });

});