import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
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

  it('should display future date range for the selected period (7d)', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-05T12:00:00Z'));

    render(<PredictedDemandTable period="7d" />);

    // today (Jan 05, 2026) through today+6 (Jan 11, 2026)
    expect(
      screen.getByText(/Predicted for next 7 days/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Jan 05, 2026–Jan 11, 2026/i)).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('should display future date range for the selected period (30d)', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-05T12:00:00Z'));

    render(<PredictedDemandTable period="30d" />);

    // Jan 05, 2026 through Feb 03, 2026
    expect(screen.getByText(/Jan 05, 2026–Feb 03, 2026/i)).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('should display future date range for the selected period (90d)', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-05T12:00:00Z'));

    render(<PredictedDemandTable period="90d" />);

    // Jan 05, 2026 through Apr 04, 2026 (inclusive)
    expect(screen.getByText(/Jan 05, 2026–Apr 04, 2026/i)).toBeInTheDocument();

    vi.useRealTimers();
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

  it('should default to 30d when period prop is missing', () => {
    render(<PredictedDemandTable />);

    // 30d multiplier = 1.0
    expect(screen.getByText('60')).toBeInTheDocument(); // Cotton
    expect(screen.getByText('45')).toBeInTheDocument(); // Polo
    expect(screen.getByText('30')).toBeInTheDocument(); // Hoodie

    const confidenceCells = screen.getAllByText(/Medium/i);
    expect(confidenceCells).toHaveLength(3);
  });

  it('should fall back to 30d logic for unknown period values', () => {
    render(<PredictedDemandTable period="unknown" />);

    // Unknown => multiplier defaults to 1.0, confidence defaults to Medium
    expect(screen.getByText('60')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();

    const confidenceCells = screen.getAllByText(/Medium/i);
    expect(confidenceCells).toHaveLength(3);
  });

  it('should compute predictions and confidence for each supported period (7d)', () => {
    render(<PredictedDemandTable period="7d" />);

    // 7d multiplier = 0.6; confidence = High
    // Cotton: 60*0.6 = 36
    // Polo: 45*0.6 = 27
    // Hoodie: 30*0.6 = 18
    expect(screen.getByText('36')).toBeInTheDocument();
    expect(screen.getByText('27')).toBeInTheDocument();
    expect(screen.getByText('18')).toBeInTheDocument();

    const confidenceCells = screen.getAllByText(/High/i);
    expect(confidenceCells).toHaveLength(3);
  });

  it('should compute predictions and confidence for each supported period (30d)', () => {
    render(<PredictedDemandTable period="30d" />);

    // 30d multiplier = 1.0; confidence = Medium
    expect(screen.getByText('60')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();

    const confidenceCells = screen.getAllByText(/Medium/i);
    expect(confidenceCells).toHaveLength(3);
  });

  it('should compute predictions and confidence for each supported period (90d) with rounding', () => {
    render(<PredictedDemandTable period="90d" />);

    // 90d multiplier = 1.7; confidence = Low
    // Cotton: 60*1.7 = 102
    // Polo: 45*1.7 = 76.5 => round => 77
    // Hoodie: 30*1.7 = 51
    expect(screen.getByText('102')).toBeInTheDocument();
    expect(screen.getByText('77')).toBeInTheDocument();
    expect(screen.getByText('51')).toBeInTheDocument();

    const confidenceCells = screen.getAllByText(/Low/i);
    expect(confidenceCells).toHaveLength(3);
  });

  it('should always render exactly 3 garment categories (3 rows of data)', () => {
    render(<PredictedDemandTable period="90d" />);

    const categories = [
      /Cotton T-Shirt/i,
      /Polo Shirt/i,
      /Hoodie/i,
    ];

    categories.forEach((cat) => {
      expect(screen.getByText(cat)).toBeInTheDocument();
    });
  });
});
