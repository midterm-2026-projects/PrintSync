import { describe, it, expect } from "vitest";
import { screen, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { AppRoutes } from "../../App";

describe('Application Navigation from AppHeader', () => {
    it('should navigate from POS page to inventory page when inventory label is clicked', async () => {
        const user = userEvent.setup();

        render(
            <MemoryRouter initialEntries={["/pos"]}>
                <AppRoutes />
            </MemoryRouter>
        );

        expect(screen.getByRole('heading', { name: /Point of Sale/i })).toBeInTheDocument();

        const inventoryLink = screen.getByTestId('nav-label-inventory');
        await user.click(inventoryLink);

        const inventoryHeader = screen.getByRole('heading', { name: /Inventory Management/i });
        expect(inventoryHeader).toBeInTheDocument();
    });

    it('should navigate from Analytics page to inventory page when inventory label is clicked', async () => {
        const user = userEvent.setup();

        render(
            <MemoryRouter initialEntries={["/analytics"]}>
                <AppRoutes />
            </MemoryRouter>
        );

        expect(screen.getByText(/last updated/i)).toBeInTheDocument();

        const inventoryLink = screen.getByTestId('nav-label-inventory');
        await user.click(inventoryLink);

        const inventoryHeader = screen.getByRole('heading', { name: /Inventory Management/i });
        expect(inventoryHeader).toBeInTheDocument();
    });

    it('should navigate from Inventory page to analytics page when analytics label is clicked', async () => {
        const user = userEvent.setup();

        render(
            <MemoryRouter initialEntries={["/inventory"]}>
                <AppRoutes />
            </MemoryRouter>
        );

        expect(screen.getByRole('heading', { name: /Inventory Management/i })).toBeInTheDocument();

        const analyticsLink = screen.getByTestId('nav-label-analytics');
        await user.click(analyticsLink);

        const analyticsText = screen.getByText(/last updated/i);
        expect(analyticsText).toBeInTheDocument();
    });

    it('should navigate from POS page to analytics page when analytics label is clicked', async () => {
        const user = userEvent.setup();

        render(
            <MemoryRouter initialEntries={["/pos"]}>
                <AppRoutes />
            </MemoryRouter>
        );

        expect(screen.getByRole('heading', { name: /Point of Sale/i })).toBeInTheDocument();

        const analyticsLink = screen.getByTestId('nav-label-analytics');
        await user.click(analyticsLink);

        const analyticsText = screen.getByText(/last updated/i);
        expect(analyticsText).toBeInTheDocument();
    });

    it('should navigate from Inventory page to POS page when POS label is clicked', async () => {
        const user = userEvent.setup();

        render(
            <MemoryRouter initialEntries={["/inventory"]}>
                <AppRoutes />
            </MemoryRouter>
        );

        expect(screen.getByRole('heading', { name: /Inventory Management/i })).toBeInTheDocument();

        const posLink = screen.getByTestId('nav-label-pos');
        await user.click(posLink);

        const posHeader = screen.getByRole('heading', { name: /Point of Sale/i });
        expect(posHeader).toBeInTheDocument();
    });

    it('should navigate from Analytics page to POS page when POS label is clicked', async () => {
        const user = userEvent.setup();

        render(
            <MemoryRouter initialEntries={["/analytics"]}>
                <AppRoutes />
            </MemoryRouter>
        );

        expect(screen.getByText(/last updated/i)).toBeInTheDocument();

        const posLink = screen.getByTestId('nav-label-pos');
        await user.click(posLink);

        const posHeader = screen.getByRole('heading', { name: /Point of Sale/i });
        expect(posHeader).toBeInTheDocument();
    });
});
