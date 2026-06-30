import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';
import KPIDisplay from '../../features/analytics/components/KPIDisplay';

describe('KPIDisplay & Calculation Logic', () => {
  const mockData = [{ amount: 500.50 }, { amount: 499.50 }];

  it('should calculate mathematically accurate total revenue', () => {
    render(<KPIDisplay transactions={mockData} />);
    // 500.50 + 499.50 = 1000.00
    expect(screen.getByTestId('revenue-total')).toHaveTextContent('₱1,000.00');
  });

  it('should handle localized currency formatting correctly (₱ symbol)', () => {
    render(<KPIDisplay transactions={[{ amount: 1250 }]} />);
    expect(screen.getByTestId('revenue-total')).toHaveTextContent('₱1,250.00');
  });

  it('should handle null/empty transactions by returning ₱0.00', () => {
    // Acceptance Criteria: Check what function does when fields are empty
    render(<KPIDisplay transactions={null} />);
    expect(screen.getByTestId('revenue-total')).toHaveTextContent('₱0.00');
  });
});