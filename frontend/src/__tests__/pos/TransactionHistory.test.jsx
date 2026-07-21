import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';
import TransactionHistory from '../../features/pos/components/TransactionHistory';

describe('POS TransactionHistory Component', () => {
  it('should show empty state message if no history exists', () => {
    render(<TransactionHistory transactions={[]} />);
    expect(screen.getByText(/No transaction history found/i)).toBeInTheDocument();
  });

  it('should render transaction rows', () => {
    const history = [
      {
        id: 'TXN-1',
        timestamp: '2026-07-15T14:30:00',
        totalAmount: 700,
        status: 'Completed',
        itemsCount: 2,
      },
    ];

    render(<TransactionHistory transactions={history} />);

    expect(screen.getByText('TXN-1')).toBeInTheDocument();
    expect(screen.getByText('₱700.00')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should handle missing fields safely (fallbacks)', () => {

    render(<TransactionHistory transactions={[{ id: 'TXN-2' }]} />);

    expect(screen.getByText('TXN-2')).toBeInTheDocument();
    expect(screen.getByText('₱0.00')).toBeInTheDocument();
    expect(screen.getAllByText('N/A').length).toBeGreaterThan(0);
  });

  it('should fallback to N/A when timestamp is invalid', () => {
    render(<TransactionHistory transactions={[{ id: 'TXN-3', timestamp: 'not-a-date', totalAmount: 10 }]} />);

    expect(screen.getByText('TXN-3')).toBeInTheDocument();
    expect(screen.getAllByText('N/A').length).toBeGreaterThan(0);
  });

  it('should render multiple transactions', () => {
    const history = [
      { id: 'TXN-A', timestamp: '2026-07-15T10:45:00', totalAmount: 350, status: 'Pending', itemsCount: 1 },
      { id: 'TXN-B', timestamp: '2026-07-15T12:15:00', totalAmount: 1050.5, status: 'Completed', itemsCount: 3 },
    ];

    render(<TransactionHistory transactions={history} />);

    expect(screen.getByText('TXN-A')).toBeInTheDocument();
    expect(screen.getByText('TXN-B')).toBeInTheDocument();

    expect(screen.getByText('₱350.00')).toBeInTheDocument();
    expect(screen.getByText('₱1,050.50')).toBeInTheDocument();
  });
});





