import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';
import { MemoryRouter } from 'react-router';
import AppHeader from '../../features/components/AppHeader';

describe('AppHeader Component', () => {
    it('should render the system name "PrintSync"', () => {
        render(
            <MemoryRouter>
                <AppHeader />
            </MemoryRouter>
        );
        expect(screen.getByTestId('system-name')).toHaveTextContent('PrintSync');
    });

    it('should render all three navigation labels (Inventory, POS, Analytics)', () => {
        render(
            <MemoryRouter>
                <AppHeader />
            </MemoryRouter>
        );
        expect(screen.getByTestId('nav-label-inventory')).toHaveTextContent('Inventory');
        expect(screen.getByTestId('nav-label-pos')).toHaveTextContent('POS');
        expect(screen.getByTestId('nav-label-analytics')).toHaveTextContent('Analytics');
    });

    it('should highlight the active tab based on the current route', () => {
        render(
            <MemoryRouter initialEntries={["/inventory"]}>
                <AppHeader />
            </MemoryRouter>
        );
        const inventoryLabel = screen.getByTestId('nav-label-inventory');
        const posLabel = screen.getByTestId('nav-label-pos');

        expect(inventoryLabel.style.color).toBe('rgb(255, 255, 255)');
        expect(posLabel.style.color).toBe('rgb(204, 204, 204)');
    });

    it('should not highlight any tab when on a non-matching route', () => {
        render(
            <MemoryRouter initialEntries={["/"]}>
                <AppHeader />
            </MemoryRouter>
        );
        const inventoryLabel = screen.getByTestId('nav-label-inventory');
        const posLabel = screen.getByTestId('nav-label-pos');
        const analyticsLabel = screen.getByTestId('nav-label-analytics');

        expect(inventoryLabel.style.color).toBe('rgb(204, 204, 204)');
        expect(posLabel.style.color).toBe('rgb(204, 204, 204)');
        expect(analyticsLabel.style.color).toBe('rgb(204, 204, 204)');
    });

    it('should render the header container', () => {
        render(
            <MemoryRouter>
                <AppHeader />
            </MemoryRouter>
        );
        expect(screen.getByTestId('app-header')).toBeInTheDocument();
    });
});

describe('AppHeader - Additional Edge Cases and Styling', () => {
    it('should display the navigation labels in the correct order (Inventory, POS, Analytics)', () => {
        render(
            <MemoryRouter>
                <AppHeader />
            </MemoryRouter>
        );
        const nav = screen.getByTestId('app-header').querySelector('nav');
        const items = nav.querySelectorAll('a');
        expect(items[0]).toHaveTextContent('Inventory');
        expect(items[1]).toHaveTextContent('POS');
        expect(items[2]).toHaveTextContent('Analytics');
    });

    it('should apply background highlight color to the active tab based on route', () => {
        render(
            <MemoryRouter initialEntries={["/analytics"]}>
                <AppHeader />
            </MemoryRouter>
        );
        const analyticsLabel = screen.getByTestId('nav-label-analytics');
        expect(analyticsLabel.style.backgroundColor).toBe('rgb(15, 52, 96)');
    });

    it('should highlight inventory tab when on /inventory route', () => {
        render(
            <MemoryRouter initialEntries={["/inventory"]}>
                <AppHeader />
            </MemoryRouter>
        );
        expect(screen.getByTestId('nav-label-inventory').style.color).toBe('rgb(255, 255, 255)');
    });

    it('should highlight POS tab when on /pos route', () => {
        render(
            <MemoryRouter initialEntries={["/pos"]}>
                <AppHeader />
            </MemoryRouter>
        );
        expect(screen.getByTestId('nav-label-pos').style.color).toBe('rgb(255, 255, 255)');
        expect(screen.getByTestId('nav-label-inventory').style.color).toBe('rgb(204, 204, 204)');
    });

    it('should highlight Analytics tab when on /analytics route', () => {
        render(
            <MemoryRouter initialEntries={["/analytics"]}>
                <AppHeader />
            </MemoryRouter>
        );
        expect(screen.getByTestId('nav-label-analytics').style.color).toBe('rgb(255, 255, 255)');
        expect(screen.getByTestId('nav-label-pos').style.color).toBe('rgb(204, 204, 204)');
    });

    it('should have the header with a dark background color (#1a1a2e)', () => {
        render(
            <MemoryRouter>
                <AppHeader />
            </MemoryRouter>
        );
        const header = screen.getByTestId('app-header');
        expect(header.style.backgroundColor).toBe('rgb(26, 26, 46)');
    });

    it('should have white text color on the system name title', () => {
        render(
            <MemoryRouter>
                <AppHeader />
            </MemoryRouter>
        );
        const title = screen.getByTestId('system-name');
        expect(title.style.color).toBe('rgb(255, 255, 255)');
    });
});
