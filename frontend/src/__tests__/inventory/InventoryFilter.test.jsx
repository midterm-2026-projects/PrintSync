import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import InventoryFilter from '../../features/inventory/components/InventoryFilter';

describe('Objective 1 - Day 1: Data Filtering System', () => {
  const mockInventory = [
    { id: '1', productName: 'Premium Cotton T-Shirt', category: 'Garment', stock: 45, price: 12.99 },
    { id: '2', productName: 'Polyester Sports Jersey', category: 'Garment', stock: 8, price: 15.5 },
    { id: '3', productName: 'Sublimation Ink Set (CMYK)', category: 'Material', stock: 12, price: 45.0 },
    { id: '4', productName: 'Heavy Cotton Hoodie', category: 'Garment', stock: 20, price: 28.0 },
    { id: '5', productName: 'A4 Transfer Paper (100pcs)', category: 'Material', stock: 0, price: 18.75 },
  ];

  it('should filter items in real-time (case-insensitive search)', async () => {
    const user = userEvent.setup();
    const onFilteredItems = vi.fn();

    render(<InventoryFilter items={mockInventory} onFilteredItems={onFilteredItems} />);

    const searchInput = screen.getByPlaceholderText(/Search items by name/i);

    await user.type(searchInput, 'cotton');

    const lastCall = onFilteredItems.mock.calls[onFilteredItems.mock.calls.length - 1]?.[0] || [];
    const names = lastCall.map((i) => i.productName);

    expect(names).toContain('Premium Cotton T-Shirt');
    expect(names).toContain('Heavy Cotton Hoodie');
    expect(names).not.toContain('Polyester Sports Jersey');
  });

  it('should filter by category when the category button is selected', async () => {
    const user = userEvent.setup();
    const onFilteredItems = vi.fn();

    render(<InventoryFilter items={mockInventory} onFilteredItems={onFilteredItems} />);

    const garmentFilterButton = screen.getByRole('button', { name: /^Garment$/i });
    await user.click(garmentFilterButton);

    const lastCall = onFilteredItems.mock.calls[onFilteredItems.mock.calls.length - 1]?.[0] || [];
    const names = lastCall.map((i) => i.productName);

    expect(names).toContain('Premium Cotton T-Shirt');
    expect(names).toContain('Polyester Sports Jersey');
    expect(names).not.toContain('Sublimation Ink Set (CMYK)');
    expect(names).not.toContain('A4 Transfer Paper (100pcs)');
  });
});
