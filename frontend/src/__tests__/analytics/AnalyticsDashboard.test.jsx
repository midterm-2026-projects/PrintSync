import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AnalyticsDashboard from '../../features/analytics/components/AnalyticsDashboard';

describe('AnalyticsDashboard Integration', () => {
  it('should calculate and display initial revenue from mock data', () => {
    render(<AnalyticsDashboard />);
    
    // Initial state has two transactions: 500 + 1500 = 2000
    // The KPIStats component should show this
    const revenueDisplay = screen.getByText(/₱2,000.00/i);
    expect(revenueDisplay).toBeInTheDocument();
  });

  it('should increment order count but maintain revenue when an empty transaction is added', () => {
    render(<AnalyticsDashboard />);
    
    // Find and click the "Add Empty Transaction" button
    const addButton = screen.getByText(/Add Empty Transaction/i);
    fireEvent.click(addButton);

    // Order count should go from 2 to 3
    const orderCount = screen.getByText(/3/i);
    expect(orderCount).toBeInTheDocument();

    // Revenue should still be ₱2,000.00 because the new item has a null amount
    // This verifies our "empty field" logic in analyticsLogic.js
    expect(screen.getByText(/₱2,000.00/i)).toBeInTheDocument();
  });
});