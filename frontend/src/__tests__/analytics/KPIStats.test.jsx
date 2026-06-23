import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import KPIStats from '../../features/analytics/components/KPIStats';

describe('KPIStats Component', () => {
  it('should render the formatted revenue and order count correctly', () => {
    render(<KPIStats revenue="₱5,000.00" count={10} />);
    
    // Check if the revenue string is displayed
    expect(screen.getByText(/₱5,000.00/i)).toBeInTheDocument();
    
    // Check if the count is displayed
    expect(screen.getByText(/10/i)).toBeInTheDocument();
  });

  it('should handle zero values gracefully', () => {
    render(<KPIStats revenue="₱0.00" count={0} />);
    
    expect(screen.getByText('₱0.00')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});
