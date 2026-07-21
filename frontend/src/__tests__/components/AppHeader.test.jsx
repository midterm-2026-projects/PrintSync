import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';
import AppHeader from '../../features/components/AppHeader';

describe('AppHeader Component', () => {
    it('should render the system name "PrintSync"', () => {
        render(<AppHeader />);
        expect(screen.getByTestId('system-name')).toHaveTextContent('PrintSync');
    });

    it('should render all three navigation labels (Inventory, POS, Analytics)', () => {
        render(<AppHeader />);
        expect(screen.getByTestId('nav-label-inventory')).toHaveTextContent('Inventory');
        expect(screen.getByTestId('nav-label-pos')).toHaveTextContent('POS');
        expect(screen.getByTestId('nav-label-analytics')).toHaveTextContent('Analytics');
    });

    it('should highlight the active tab when activeTab prop is provided', () => {
        render(<AppHeader activeTab="Inventory" />);
        const inventoryLabel = screen.getByTestId('nav-label-inventory');
        const posLabel = screen.getByTestId('nav-label-pos');

        expect(inventoryLabel.style.color).toBe('rgb(255, 255, 255)');
        expect(posLabel.style.color).toBe('rgb(204, 204, 204)');
    });

    it('should not highlight any tab when activeTab is not provided or does not match', () => {
        render(<AppHeader />);
        const inventoryLabel = screen.getByTestId('nav-label-inventory');
        const posLabel = screen.getByTestId('nav-label-pos');
        const analyticsLabel = screen.getByTestId('nav-label-analytics');

        expect(inventoryLabel.style.color).toBe('rgb(204, 204, 204)');
        expect(posLabel.style.color).toBe('rgb(204, 204, 204)');
        expect(analyticsLabel.style.color).toBe('rgb(204, 204, 204)');
    });

    it('should render the header container', () => {
        render(<AppHeader />);
        expect(screen.getByTestId('app-header')).toBeInTheDocument();
    });
});

describe('AppHeader - Additional Edge Cases and Styling', () => {
    it('should display the navigation labels in the correct order (Inventory, POS, Analytics)', () => {
        render(<AppHeader />);
        const nav = screen.getByTestId('app-header').querySelector('nav');
        const items = nav.querySelectorAll('span');
        expect(items[0]).toHaveTextContent('Inventory');
        expect(items[1]).toHaveTextContent('POS');
        expect(items[2]).toHaveTextContent('Analytics');
    });

    it('should apply background highlight color to the active tab', () => {
        render(<AppHeader activeTab="Analytics" />);
        const analyticsLabel = screen.getByTestId('nav-label-analytics');
        expect(analyticsLabel.style.backgroundColor).toBe('rgb(15, 52, 96)');
    });

    it('should highlight any of the three tabs when passed as activeTab', () => {
        const { rerender } = render(<AppHeader activeTab="Inventory" />);
        expect(screen.getByTestId('nav-label-inventory').style.color).toBe('rgb(255, 255, 255)');

        rerender(<AppHeader activeTab="POS" />);
        expect(screen.getByTestId('nav-label-pos').style.color).toBe('rgb(255, 255, 255)');
        expect(screen.getByTestId('nav-label-inventory').style.color).toBe('rgb(204, 204, 204)');

        rerender(<AppHeader activeTab="Analytics" />);
        expect(screen.getByTestId('nav-label-analytics').style.color).toBe('rgb(255, 255, 255)');
        expect(screen.getByTestId('nav-label-pos').style.color).toBe('rgb(204, 204, 204)');
    });

    it('should have the header with a dark background color (#1a1a2e)', () => {
        render(<AppHeader />);
        const header = screen.getByTestId('app-header');
        expect(header.style.backgroundColor).toBe('rgb(26, 26, 46)');
    });

    it('should have white text color on the system name title', () => {
        render(<AppHeader />);
        const title = screen.getByTestId('system-name');
        expect(title.style.color).toBe('rgb(255, 255, 255)');
    });
});
