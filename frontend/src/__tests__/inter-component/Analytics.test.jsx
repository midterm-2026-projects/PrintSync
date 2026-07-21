import { render, screen, fireEvent, act } from '@testing-library/react';
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

    it('renders KPIDisplay with total revenue', () => {
        render(<Analytics />);
        expect(screen.getByText(/Core Business Metrics/i)).toBeInTheDocument();
        // Sum of sample transactions: 1500 + 3000 + 1200 = 5700
        expect(screen.getByTestId('revenue-total')).toHaveTextContent('₱5,700.00');
    });

    it('renders SalesTrendChart with SVG chart', () => {
        render(<Analytics />);
        expect(screen.getByTestId('sales-line-chart')).toBeInTheDocument();
    });

    it('renders TransactionHistory with raw transaction log', () => {
        render(<Analytics />);
        expect(screen.getByText(/Raw Transaction Log/i)).toBeInTheDocument();
        expect(screen.getByText('TXN-001')).toBeInTheDocument();
        expect(screen.getByText('TXN-002')).toBeInTheDocument();
        expect(screen.getByText('TXN-003')).toBeInTheDocument();
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
    it('renders AnalyticsHeader, ForecastPeriodSelector, KPIDisplay, SalesTrendChart, TransactionHistory, PredictedDemandTable, and AIInsightArea', () => {
        render(<Analytics />);

        // AnalyticsHeader
        expect(screen.getByText(/AI-Assisted Business Analytics/i)).toBeInTheDocument();

        // ForecastPeriodSelector
        expect(screen.getByLabelText(/Forecasting Period/i)).toBeInTheDocument();

        // KPIDisplay
        expect(screen.getByText(/Core Business Metrics/i)).toBeInTheDocument();

        // SalesTrendChart (SVG)
        expect(screen.getByTestId('sales-line-chart')).toBeInTheDocument();

        // TransactionHistory
        expect(screen.getByText(/Raw Transaction Log/i)).toBeInTheDocument();

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
    it('renders default 30d period with Medium confidence and default quantities (60, 45, 30)', () => {
        render(<Analytics />);
        expect(screen.getByText('60')).toBeInTheDocument();
        expect(screen.getByText('45')).toBeInTheDocument();
        expect(screen.getByText('30')).toBeInTheDocument();
        const confidenceCells = screen.getAllByText(/Medium/i);
        expect(confidenceCells.length).toBeGreaterThanOrEqual(3);
    });

    it('switching to 7d updates predictions to 36, 27, 18 with High confidence', () => {
        render(<Analytics />);

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

    it('switching to 90d updates predictions to 102, 77, 51 with Low confidence', () => {
        render(<Analytics />);

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

    it('switching back to 30d reverts to Medium confidence with quantities 60, 45, 30', () => {
        render(<Analytics />);

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

    it('selecting 7d displays "High" confidence label for all three categories', () => {
        render(<Analytics />);

        fireEvent.change(screen.getByLabelText(/Forecasting Period/i), {
            target: { value: '7d' },
        });

        const highLabels = screen.getAllByText('High');
        expect(highLabels).toHaveLength(3);
    });

    it('selecting 90d displays "Low" confidence label for all three categories', () => {
        render(<Analytics />);

        fireEvent.change(screen.getByLabelText(/Forecasting Period/i), {
            target: { value: '90d' },
        });

        const lowLabels = screen.getAllByText('Low');
        expect(lowLabels).toHaveLength(3);
    });
});

describe('Analytics Page - AIInsightArea interactions', () => {
    it('shows initial prompt text before any action is taken', () => {
        render(<Analytics />);
        expect(screen.getByText(/Click analyze to generate AI suggestions/i)).toBeInTheDocument();
    });

    it('clicking "Analyze Business Trends" shows loading state with "Generating insights..."', () => {
        vi.useFakeTimers();
        render(<Analytics />);

        fireEvent.click(screen.getByRole('button', { name: /Analyze Business/i }));
        expect(screen.getByText(/Generating insights.../i)).toBeInTheDocument();

        vi.useRealTimers();
    });

    it('both buttons are disabled during loading state', () => {
        vi.useFakeTimers();
        render(<Analytics />);

        fireEvent.click(screen.getByRole('button', { name: /Analyze Business/i }));

        // After click, the first button shows "Processing..." (disabled)
        const processingBtn = screen.getByRole('button', { name: /Processing/i });
        const simulateBtn = screen.getByRole('button', { name: /Simulate AI Failure/i });

        expect(processingBtn).toBeDisabled();
        expect(simulateBtn).toBeDisabled();

        vi.useRealTimers();
    });

    it('after simulated delay, displays AI insight text and hides loading message', () => {
        vi.useFakeTimers();
        render(<Analytics />);

        fireEvent.click(screen.getByRole('button', { name: /Analyze Business/i }));

        act(() => {
            vi.advanceTimersByTime(2000);
        });

        expect(screen.getByText(/Based on your sales data/i)).toBeInTheDocument();
        expect(screen.queryByText(/Generating insights.../i)).not.toBeInTheDocument();

        vi.useRealTimers();
    });

    it('clicking "Simulate AI Failure" displays red error message', () => {
        vi.useFakeTimers();
        render(<Analytics />);

        fireEvent.click(screen.getByRole('button', { name: /Simulate AI Failure/i }));

        act(() => {
            vi.advanceTimersByTime(1000);
        });

        const errorMsg = screen.getByText(/AI Service is currently unavailable/i);
        expect(errorMsg).toBeInTheDocument();
        expect(errorMsg.parentElement.style.color).toBe('red');

        vi.useRealTimers();
    });

    it('error text replaces loading state and "Generating insights..." disappears', () => {
        vi.useFakeTimers();
        render(<Analytics />);

        fireEvent.click(screen.getByRole('button', { name: /Simulate AI Failure/i }));
        expect(screen.getByText(/Generating insights.../i)).toBeInTheDocument();

        act(() => {
            vi.advanceTimersByTime(1000);
        });

        expect(screen.getByText(/AI Service is currently unavailable/i)).toBeInTheDocument();
        expect(screen.queryByText(/Generating insights.../i)).not.toBeInTheDocument();

        vi.useRealTimers();
    });

    it('analyze button becomes re-enabled after simulated failure completes', () => {
        vi.useFakeTimers();
        render(<Analytics />);

        const analyzeBtn = screen.getByRole('button', { name: /Analyze Business/i });

        fireEvent.click(screen.getByRole('button', { name: /Simulate AI Failure/i }));

        act(() => {
            vi.advanceTimersByTime(1000);
        });

        expect(analyzeBtn).not.toBeDisabled();

        vi.useRealTimers();
    });

    it('insight box has overflow-y: auto and word-wrap: break-word styles for long text', () => {
        render(<Analytics />);

        const insightBox = screen.getByTestId('insight-box');
        expect(insightBox.style.overflowY).toBe('auto');
        expect(insightBox.style.wordWrap).toBe('break-word');
    });
});

