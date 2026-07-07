import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useState } from 'react';
import PredictedDemandTable from '../../features/analytics/components/PredictedDemandTable';

describe('PredictedDemandTable Forecasting UI (Week 3 Day 1)', () => {
  it('should render table headers including "Predicted Quantity" and "Confidence Level"', () => {
    render(<PredictedDemandTable period="30d" />);
    expect(screen.getByText(/Predicted Quantity/i)).toBeInTheDocument();
    expect(screen.getByText(/Confidence Level/i)).toBeInTheDocument();
    expect(screen.getByText(/Predicted Demand/i)).toBeInTheDocument();
  });

  it('should render multiple garment category rows with predicted quantities and confidence levels', () => {
    render(<PredictedDemandTable period="30d" />);

    // Categories (from component)
    expect(screen.getByText(/Cotton T-Shirt/i)).toBeInTheDocument();
    expect(screen.getByText(/Polo Shirt/i)).toBeInTheDocument();
    expect(screen.getByText(/Hoodie/i)).toBeInTheDocument();

    // Predicted quantity should be rendered as numbers
    expect(screen.getByText('60')).toBeInTheDocument();

    // Confidence levels should render for each row
    const confidenceCells = screen.getAllByText(/Medium/i);
    expect(confidenceCells).toHaveLength(3);
  });

  it('should update predicted quantities when period changes (re-render validation)', () => {
    const Wrapper = () => {
      const [period, setPeriod] = useState('7d');
      return (
        <div>
          <button onClick={() => setPeriod('90d')}>change-period</button>
          <PredictedDemandTable period={period} />
        </div>
      );
    };

    render(<Wrapper />);

    // For 7d, Cotton T-Shirt baseQty(60) * 0.6 = 36
    expect(screen.getByText('36')).toBeInTheDocument();

    fireEvent.click(screen.getByText('change-period'));

    // For 90d, Cotton T-Shirt baseQty(60) * 1.7 = 102
    expect(screen.getByText('102')).toBeInTheDocument();
  });
});
