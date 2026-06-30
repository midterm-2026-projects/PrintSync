import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';
import TransactionHistory from '../../features/analytics/components/TransactionHistory';

describe('TransactionHistory Component', () => {
  it('should show empty state message if no history exists', () => {
    render(<TransactionHistory transactions={[]} />);
    expect(screen.getByText(/No transaction history found/i)).toBeInTheDocument();
  });

  it('should render transaction rows with raw amounts', () => {
    const history = [{ id: 'TXN-1', amount: 100 }];
    render(<TransactionHistory transactions={history} />);
    expect(screen.getByText('TXN-1')).toBeInTheDocument();
    expect(screen.getByText('₱100')).toBeInTheDocument();
  });

  it('should handle items with missing amount properties safely', () => {
    render(<TransactionHistory transactions={[{ id: 'TXN-2' }]} />);
    expect(screen.getByText('₱0.00')).toBeInTheDocument();
  });
});