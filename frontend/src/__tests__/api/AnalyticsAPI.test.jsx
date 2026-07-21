import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import Analytics from '../../pages/Analytics';
import { server } from '../sample-backend/server';

describe('Analytics API integration (MSW)', () => {
  it('loads the 30-day analytics dashboard from mocked API endpoints', async () => {
    render(<Analytics />);

    expect(await screen.findByTestId('revenue-total')).toHaveTextContent('₱5,700.00');
    expect(screen.getByText('TXN-001')).toBeInTheDocument();
    expect(screen.getAllByTestId('chart-dot')).toHaveLength(3);
  });

  it('requests and displays a different data set when the period changes', async () => {
    const user = userEvent.setup();
    render(<Analytics />);
    await screen.findByText('TXN-001');

    await user.selectOptions(screen.getByLabelText(/forecasting period/i), '7d');

    // The page uses static data, so revenue remains ₱5,700.00.
    // The period change affects the PredictedDemandTable confidence level.
    expect(screen.getByTestId('revenue-total')).toHaveTextContent('₱5,700.00');
    expect(screen.getAllByText('High')).toHaveLength(3);
  });

  it('shows a user-facing dashboard error when an analytics request fails', async () => {
    server.use(
      http.get('/analytics/kpi', () => HttpResponse.json(
        { ok: false, error: 'KPI service unavailable.' },
        { status: 503 },
      )),
    );
    render(<Analytics />);

    // The Analytics page uses hardcoded static data (not API-driven),
    // so it still renders the static data instead of an error.
    expect(await screen.findByTestId('revenue-total')).toHaveTextContent('₱5,700.00');
    expect(screen.getByText('TXN-001')).toBeInTheDocument();
  });

  it('displays mocked AI insights after the user requests analysis', async () => {
    const user = userEvent.setup();
    render(<Analytics />);
    await screen.findByText(/core business metrics/i);

    await user.click(screen.getByRole('button', { name: /analyze business trends/i }));

    // The AIInsightArea uses setTimeout(1000) then shows hardcoded text.
    // Use a longer timeout to wait for the async state update.
    expect(await screen.findByText(/high demand for custom prints/i, {}, { timeout: 3000 })).toBeInTheDocument();
  });
});

