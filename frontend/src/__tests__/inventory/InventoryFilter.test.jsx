import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import InventoryFilter from '../../features/inventory/components/InventoryFilter';

describe('Objective 1 - Day 1: Data Filtering System', () => {

    // Test Case 1: Verifies the case-insensitive real-time text search
    it('should filter the item list in real-time, showing only items that contain the search string "Cotton" regardless of letter case', async () => {
        const user = userEvent.setup();
        render(<InventoryFilter />);

        const searchInput = screen.getByPlaceholderText(/Search items by name/i);

        // Act: Type "cotton"
        await user.type(searchInput, 'cotton');

        // Assert: Cotton items should be visible
        expect(screen.getByText('Premium Cotton T-Shirt')).toBeInTheDocument();
        expect(screen.getByText('Heavy Cotton Hoodie')).toBeInTheDocument();

        // Assert: Non-matching items should be removed
        expect(screen.queryByText('Polyester Sports Jersey')).not.toBeInTheDocument();
    });

    // Test Case 2: Verifies the category filtering functionality
    it('should hide all items except those matching the "Garment" category when the corresponding filter is selected', async () => {
        const user = userEvent.setup();
        render(<InventoryFilter />);

        const garmentFilterButton = screen.getByRole('button', { name: /^Garment$/i });

        // Act: Click "Garment"
        await user.click(garmentFilterButton);

        // Assert: Garments are present
        expect(screen.getByText('Premium Cotton T-Shirt')).toBeInTheDocument();
        expect(screen.getByText('Polyester Sports Jersey')).toBeInTheDocument();

        // Assert: Materials are hidden
        expect(screen.queryByText('Sublimation Ink Set (CMYK)')).not.toBeInTheDocument();
        expect(screen.queryByText('A4 Transfer Paper (100pcs)')).not.toBeInTheDocument();
    });
});