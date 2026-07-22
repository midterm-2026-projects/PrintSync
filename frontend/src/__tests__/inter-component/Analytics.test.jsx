import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';

import Analytics from '../../pages/Analytics';
import { predictYFromLinearRegression } from '../../features/analytics/services/linearRegressionService';

describe('Analytics Page (inter-component)', () => {
    it('renders AnalyticsHeader with page title', () => {
        render(<Analytics />);
        expect(screen.getByText(/AI-Assisted Business Analytics/i)).toBeInTheDocument();
    });

    it('renders ForecastPeriodSelector dropdown', () => {
        render(<Analytics />);
        expect(screen.getByLabelText(/Forecasting Period/i)).toBeInTheDocument();
    });

    it('renders KPIDisplay with total revenue from API', async () => {
        render(<Analytics />);
        expect(screen.getByText(/Core Business Metrics/i)).toBeInTheDocument();
        // Revenue data is fetched asynchronously from the MSW-handled API
        await waitFor(() => {
            expect(screen.getByTestId('revenue-total')).toHaveTextContent('₱5,700.00');
        }, { timeout: 5000 });
    });

    it('renders SalesTrendChart with SVG chart', async () => {
        render(<Analytics />);
        await waitFor(() => {
            expect(screen.getByTestId('sales-line-chart')).toBeInTheDocument();
        }, { timeout: 5000 });
    });

    it('renders TransactionHistory with raw transaction log from API', async () => {
        render(<Analytics />);
        await waitFor(() => {
            expect(screen.getByText(/Raw Transaction Log/i)).toBeInTheDocument();
            expect(screen.getByText('TXN-001')).toBeInTheDocument();
            expect(screen.getByText('TXN-002')).toBeInTheDocument();
            expect(screen.getByText('TXN-003')).toBeInTheDocument();
        }, { timeout: 5000 });
    });

    it('renders PredictedDemandTable with categories', () => {
        render(<Analytics />);
        expect(screen.getByText(/Predicted Demand/i)).toBeInTheDocument();
        expect(screen.getByText(/Cotton T-Shirt/i)).toBeInTheDocument();
        expect(screen.getByText(/Polo Shirt/i)).toBeInTheDocument();
        expect(screen.getByText(/Hoodie/i)).toBeInTheDocument();
    });

    it('renders AIInsightArea with analyze button', () => {
        render(<Analytics />);
        expect(screen.getByRole('button', { name: /Analyze Business/i })).toBeInTheDocument();
    });
});

describe('Analytics Page - renders all analytics components and services', () => {
    it('renders AnalyticsHeader, ForecastPeriodSelector, KPIDisplay, SalesTrendChart, TransactionHistory, PredictedDemandTable, and AIInsightArea', async () => {
        render(<Analytics />);

        // AnalyticsHeader
        expect(screen.getByText(/AI-Assisted Business Analytics/i)).toBeInTheDocument();

        // ForecastPeriodSelector
        expect(screen.getByLabelText(/Forecasting Period/i)).toBeInTheDocument();

        // KPIDisplay
        expect(screen.getByText(/Core Business Metrics/i)).toBeInTheDocument();

        // SalesTrendChart (SVG) — async load
        await waitFor(() => {
            expect(screen.getByTestId('sales-line-chart')).toBeInTheDocument();
        }, { timeout: 5000 });

        // TransactionHistory — async load
        await waitFor(() => {
            expect(screen.getByText(/Raw Transaction Log/i)).toBeInTheDocument();
        }, { timeout: 5000 });

        // PredictedDemandTable
        expect(screen.getByText(/Predicted Demand/i)).toBeInTheDocument();

        // AIInsightArea
        expect(screen.getByRole('button', { name: /Analyze Business/i })).toBeInTheDocument();
    });

    it('linearRegressionService is importable and callable', () => {
        const points = [
            { x: 0, y: 5 },
            { x: 1, y: 7 },
            { x: 2, y: 9 },
        ];
        const result = predictYFromLinearRegression(points, 3);
        expect(result).toBeCloseTo(11, 10);
    });
});

describe('Analytics Page - ForecastPeriodSelector drives PredictedDemandTable updates', () => {
    it('renders default 30d period with Medium confidence and default quantities (60, 45, 30)', async () => {
        render(<Analytics />);
        // Wait for initial data load
        await waitFor(() => {
            expect(screen.getByTestId('revenue-total')).toBeInTheDocument();
        }, { timeout: 5000 });
        expect(screen.getByText('60')).toBeInTheDocument();
        expect(screen.getByText('45')).toBeInTheDocument();
        expect(screen.getByText('30')).toBeInTheDocument();
        const confidenceCells = screen.getAllByText(/Medium/i);
        expect(confidenceCells.length).toBeGreaterThanOrEqual(3);
    });

    it('switching to 7d updates predictions to 36, 27, 18 with High confidence', async () => {
        render(<Analytics />);
        await waitFor(() => {
            expect(screen.getByTestId('revenue-total')).toBeInTheDocument();
        }, { timeout: 5000 });

        fireEvent.change(screen.getByLabelText(/Forecasting Period/i), {
            target: { value: '7d' },
        });

        // 7d multiplier = 0.6: Cotton 60*0.6=36, Polo 45*0.6=27, Hoodie 30*0.6=18
        expect(screen.getByText('36')).toBeInTheDocument();
        expect(screen.getByText('27')).toBeInTheDocument();
        expect(screen.getByText('18')).toBeInTheDocument();

        const highCells = screen.getAllByText(/High/i);
        expect(highCells.length).toBeGreaterThanOrEqual(3);
    });

    it('switching to 90d updates predictions to 102, 77, 51 with Low confidence', async () => {
        render(<Analytics />);
        await waitFor(() => {
            expect(screen.getByTestId('revenue-total')).toBeInTheDocument();
        }, { timeout: 5000 });

        fireEvent.change(screen.getByLabelText(/Forecasting Period/i), {
            target: { value: '90d' },
        });

        // 90d multiplier = 1.7: Cotton 60*1.7=102, Polo 45*1.7=76.5→77, Hoodie 30*1.7=51
        expect(screen.getByText('102')).toBeInTheDocument();
        expect(screen.getByText('77')).toBeInTheDocument();
        expect(screen.getByText('51')).toBeInTheDocument();

        const lowCells = screen.getAllByText(/Low/i);
        expect(lowCells.length).toBeGreaterThanOrEqual(3);
    });

    it('switching back to 30d reverts to Medium confidence with quantities 60, 45, 30', async () => {
        render(<Analytics />);
        await waitFor(() => {
            expect(screen.getByTestId('revenue-total')).toBeInTheDocument();
        }, { timeout: 5000 });

        const select = screen.getByLabelText(/Forecasting Period/i);

        // Switch to 7d first
        fireEvent.change(select, { target: { value: '7d' } });
        expect(screen.getByText('36')).toBeInTheDocument();

        // Switch back to 30d
        fireEvent.change(select, { target: { value: '30d' } });
        expect(screen.getByText('60')).toBeInTheDocument();
        expect(screen.getByText('45')).toBeInTheDocument();
        expect(screen.getByText('30')).toBeInTheDocument();

        const mediumCells = screen.getAllByText(/Medium/i);
        expect(mediumCells.length).toBeGreaterThanOrEqual(3);
    });

    it('selecting 7d displays "High" confidence label for all three categories', async () => {
        render(<Analytics />);
        await waitFor(() => {
            expect(screen.getByTestId('revenue-total')).toBeInTheDocument();
        }, { timeout: 5000 });

        fireEvent.change(screen.getByLabelText(/Forecasting Period/i), {
            target: { value: '7d' },
        });

        const highLabels = screen.getAllByText('High');
        expect(highLabels).toHaveLength(3);
    });

    it('selecting 90d displays "Low" confidence label for all three categories', async () => {
        render(<Analytics />);
        await waitFor(() => {
            expect(screen.getByTestId('revenue-total')).toBeInTheDocument();
        }, { timeout: 5000 });

        fireEvent.change(screen.getByLabelText(/Forecasting Period/i), {
            target: { value: '90d' },
        });

        const lowLabels = screen.getAllByText('Low');
        expect(lowLabels).toHaveLength(3);
    });
});

describe('Analytics Page - AIInsightArea interactions', () => {
    it('shows initial prompt text before any action is taken', async () => {
        render(<Analytics />);
        await waitFor(() => {
            expect(screen.getByTestId('revenue-total')).toBeInTheDocument();
        }, { timeout: 5000 });
        expect(screen.getByText(/Click analyze to generate AI suggestions/i)).toBeInTheDocument();
    });

    it('clicking "Analyze Business Trends" shows loading state with "Generating insights..."', async () => {
        render(<Analytics />);
        await waitFor(() => {
            expect(screen.getByTestId('revenue-total')).toBeInTheDocument();
        }, { timeout: 5000 });

        fireEvent.click(screen.getByRole('button', { name: /Analyze Business/i }));
        expect(screen.getByText(/Generating insights.../i)).toBeInTheDocument();
    });

    it('both buttons are disabled during loading state', async () => {
        render(<Analytics />);
        await waitFor(() => {
            expect(screen.getByTestId('revenue-total')).toBeInTheDocument();
        }, { timeout: 5000 });

        fireEvent.click(screen.getByRole('button', { name: /Analyze Business/i }));

        // After click, the first button shows "Processing..." (disabled)
        const processingBtn = screen.getByRole('button', { name: /Processing/i });
        const simulateBtn = screen.getByRole('button', { name: /Simulate AI Failure/i });

        expect(processingBtn).toBeDisabled();
        expect(simulateBtn).toBeDisabled();
    });

    it('after API call resolves, displays AI insight text and hides loading message', async () => {
        render(<Analytics />);
        await waitFor(() => {
            expect(screen.getByTestId('revenue-total')).toBeInTheDocument();
        }, { timeout: 5000 });

        fireEvent.click(screen.getByRole('button', { name: /Analyze Business/i }));

        // Wait for the API call (intercepted by MSW) to resolve
        await waitFor(() => {
            expect(screen.getByText(/Based on your sales data/i)).toBeInTheDocument();
        }, { timeout: 5000 });
        expect(screen.queryByText(/Generating insights.../i)).not.toBeInTheDocument();
    });
});

