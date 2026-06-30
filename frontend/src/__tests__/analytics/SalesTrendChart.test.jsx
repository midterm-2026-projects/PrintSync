import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';
import SalesTrendChart from '../../features/analytics/components/SalesTrendChart';

describe('SalesTrendChart Visualization (Project Plan Verification)', () => {
  const mockHistory = [
    { date: '2023-10-25', amount: 1500 },
    { date: '2023-10-26', amount: 3000 },
    { date: '2023-10-27', amount: 1200 }
  ];

  it('should render an SVG element representing the chart', () => {
    render(<SalesTrendChart data={mockHistory} />);
    expect(screen.getByTestId('sales-line-chart')).toBeInTheDocument();
  });

  // Requirement: Render a line chart displaying total sales amount on the Y-axis
  it('should explicitly display the Y-Axis amount label', () => {
    render(<SalesTrendChart data={mockHistory} />);
    // Looking for the "Y: Amount" text from our visualization update
    expect(screen.getByText(/Y: Amount/i)).toBeInTheDocument();
  });

  // Requirement: Render a line chart displaying dates on the X-axis
  it('should display the correct dates on the X-axis', () => {
    render(<SalesTrendChart data={mockHistory} />);
    expect(screen.getByText('2023-10-25')).toBeInTheDocument();
    expect(screen.getByText('2023-10-26')).toBeInTheDocument();
    expect(screen.getByText('2023-10-27')).toBeInTheDocument();
  });

  // Requirement: Correctly plot multiple data points from a mock array
  it('should plot the exact number of data points (dots) as items in the array', () => {
    render(<SalesTrendChart data={mockHistory} />);
    const dots = screen.getAllByTestId('chart-dot');
    
    // Verifies that multiple points (3 in this case) are rendered
    expect(dots).toHaveLength(mockHistory.length);
    expect(dots.length).toBeGreaterThan(1);
  });

  it('should render a polyline path connecting the multiple points', () => {
    render(<SalesTrendChart data={mockHistory} />);
    const polyline = screen.getByTestId('chart-polyline');
    expect(polyline).toHaveAttribute('points');
    // Ensure it contains coordinates for multiple points
    expect(polyline.getAttribute('points').split(' ').length).toBe(mockHistory.length);
  });

  it('should handle empty data gracefully', () => {
    render(<SalesTrendChart data={[]} />);
    expect(screen.getByText(/No data available for chart/i)).toBeInTheDocument();
  });
});