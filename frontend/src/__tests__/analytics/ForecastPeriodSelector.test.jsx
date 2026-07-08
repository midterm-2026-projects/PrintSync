import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ForecastPeriodSelector from '../../features/analytics/components/ForecastPeriodSelector';

describe('ForecastPeriodSelector (Week 3 Day 1)', () => {
  it('should render forecasting period dropdown', () => {
    render(<ForecastPeriodSelector value="30d" onChange={() => {}} />);
    expect(screen.getByLabelText(/Forecasting Period/i)).toBeInTheDocument();
  });

  it('should call onChange with new value when timeframe is selected', () =>{
    const onChange = vi.fn();
    render(<ForecastPeriodSelector value="30d" onChange={onChange} />);

    fireEvent.change(screen.getByLabelText(/Forecasting Period/i), {
      target: { value: '90d' },
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('90d');
  });

  it('should not crash when onChange prop is missing', () => {
    render(<ForecastPeriodSelector value="30d" />);

    expect(() => {
      fireEvent.change(screen.getByLabelText(/Forecasting Period/i), {
        target: { value: '90d' },
      });
    }).not.toThrow();
  });

  it('should reflect controlled value in the select', () => {
    render(<ForecastPeriodSelector value="7d" onChange={() => {}} />);

    const select = screen.getByLabelText(/Forecasting Period/i);
    expect(select.value).toBe('7d');
  });

  it('should call onChange with new value for all valid options', () => {
    const onChange = vi.fn();
    render(<ForecastPeriodSelector value="30d" onChange={onChange} />);

    const select = screen.getByLabelText(/Forecasting Period/i);

    fireEvent.change(select, { target: { value: '7d' } });
    fireEvent.change(select, { target: { value: '30d' } });
    fireEvent.change(select, { target: { value: '90d' } });

    expect(onChange).toHaveBeenCalledTimes(3);
    expect(onChange).toHaveBeenNthCalledWith(1, '7d');
    expect(onChange).toHaveBeenNthCalledWith(2, '30d');
    expect(onChange).toHaveBeenNthCalledWith(3, '90d');
  });
});
