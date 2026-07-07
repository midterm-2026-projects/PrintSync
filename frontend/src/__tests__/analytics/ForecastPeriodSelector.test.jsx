import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import ForecastPeriodSelector from '../../features/analytics/components/ForecastPeriodSelector';

describe('ForecastPeriodSelector (Week 3 Day 1)', () => {
  it('should render forecasting period dropdown', () => {
    render(<ForecastPeriodSelector value="30d" onChange={() => {}} />);
    expect(screen.getByLabelText(/Forecasting Period/i)).toBeInTheDocument();
  });

  it('should call onChange with new value when timeframe is selected', () => {
    const onChange = vi.fn();
    render(<ForecastPeriodSelector value="30d" onChange={onChange} />);

    fireEvent.change(screen.getByLabelText(/Forecasting Period/i), {
      target: { value: '90d' },
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('90d');
  });
});
