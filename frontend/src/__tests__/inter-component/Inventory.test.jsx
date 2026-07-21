import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import React from 'react';

import Inventory from '../../pages/Inventory';

describe('Inventory Page (inter-component)', () => {
    it('renders the header with default item count 0', () => {
        render(<Inventory />);
        expect(screen.getByTestId('item-count')).toHaveTextContent('0');
    });

    it('shows validation error when submitting empty form', async () => {
        const user = userEvent.setup();
        render(<Inventory />);

        const addButton = screen.getByRole('button', { name: /add to inventory/i });
        await user.click(addButton);

        expect(screen.getByText(/error: item name is required/i)).toBeInTheDocument();
    });

    it('renders empty table initialized state when no items match', () => {
        render(<Inventory />);
        expect(
            screen.getByText(/inventory is currently empty \(initialized state\)/i)
        ).toBeInTheDocument();
    });

    it('updates item count and table after adding a valid inventory item', async () => {
        const user = userEvent.setup();
        render(<Inventory />);

        await user.type(screen.getByLabelText(/item name/i), 'Cotton');
        await user.type(screen.getByLabelText(/initial stock/i), '10');
        await user.type(screen.getByLabelText(/unit price/i), '25');

        await user.click(screen.getByRole('button', { name: /add to inventory/i }));

        // item count should increment
        expect(screen.getByTestId('item-count')).toHaveTextContent('1');

        // table should show the added item
        expect(screen.getByText(/cotton/i)).toBeInTheDocument();
        expect(screen.getByText(/10 units/i)).toBeInTheDocument();
    });

    it('filters table results using the search input', async () => {
        const user = userEvent.setup();
        render(<Inventory />);

        // Add two items
        await user.type(screen.getByLabelText(/item name/i), 'Cotton');
        await user.type(screen.getByLabelText(/initial stock/i), '5');
        await user.type(screen.getByLabelText(/unit price/i), '10');
        await user.click(screen.getByRole('button', { name: /add to inventory/i }));

        await user.type(screen.getByLabelText(/item name/i), 'Polyester');
        await user.type(screen.getByLabelText(/initial stock/i), '7');
        await user.type(screen.getByLabelText(/unit price/i), '20');
        await user.click(screen.getByRole('button', { name: /add to inventory/i }));

        // Search for "cotton" -> only cotton row should render
        const searchInput = screen.getByPlaceholderText(/search items by name/i);
        await user.clear(searchInput);
        await user.type(searchInput, 'cotton');

        expect(screen.getByText(/cotton/i)).toBeInTheDocument();
        expect(screen.queryByText(/polyester/i)).not.toBeInTheDocument();
    });
});

describe('Inventory Page - renders all inventory components', () => {
    it('renders InventoryHeader, ItemForm, InventoryFilter, InventoryTable, and DesignGallery', () => {
        render(<Inventory />);

        // InventoryHeader
        expect(screen.getByText(/inventory management/i)).toBeInTheDocument();

        // ItemForm
        expect(screen.getByRole('heading', { name: /add new inventory item/i })).toBeInTheDocument();

        // InventoryFilter
        expect(screen.getByText(/printsync inventory/i)).toBeInTheDocument();

        // InventoryTable empty state
        expect(
            screen.getByText(/inventory is currently empty \(initialized state\)/i)
        ).toBeInTheDocument();

        // DesignGallery (empty state)
        expect(screen.getByText(/no designs found in repository/i)).toBeInTheDocument();
    });
});
