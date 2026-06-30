import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';
import AnalyticsHeader from '../../features/analytics/components/AnalyticsHeader';

describe('AnalyticsHeader Component', () => {
  it('should display the correct update timestamp', () => {
    render(<AnalyticsHeader lastUpdated="2023-10-27" />);
    expect(screen.getByText(/2023-10-27/i)).toBeInTheDocument();
  });

  it('should show "No Data Available" if the field is empty', () => {
    render(<AnalyticsHeader lastUpdated={null} />);
    expect(screen.getByText(/No Data Available/i)).toBeInTheDocument();
  });
});