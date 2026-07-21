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
});
