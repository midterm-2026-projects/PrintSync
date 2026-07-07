import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import ItemForm from '../../features/inventory/components/ItemForm';

describe('ItemForm Validation (Week 2 Day 1)', () => {
  it('should display an error message if the Item Name field is empty on submission', () => {
    const onAddMock = vi.fn();
    render(<ItemForm onAdd={onAddMock} />);
    
    const submitBtn = screen.getByRole('button', { name: /Add to Inventory/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Item name is required/i)).toBeInTheDocument();
  });

  it('should display an error message if Initial Stock is negative', () => {
    const onAddMock = vi.fn();
    render(<ItemForm onAdd={onAddMock} />);
    
    const submitBtn = screen.getByRole('button', { name: /Add to Inventory/i });

    fireEvent.change(screen.getByLabelText(/Item Name:/i), { target: { value: 'Valid' } });
    fireEvent.change(screen.getByLabelText(/Initial Stock:/i), { target: { value: '-5' } });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Stock and Price cannot be negative/i)).toBeInTheDocument();
  });

  it('should call onAdd with correct price when valid inputs are provided', () => {
    const onAddMock = vi.fn();
    render(<ItemForm onAdd={onAddMock} />);
    
    fireEvent.change(screen.getByLabelText(/Item Name:/i), { target: { value: 'Custom Mug' } });
    fireEvent.change(screen.getByLabelText(/Initial Stock:/i), { target: { value: '20' } });
    fireEvent.change(screen.getByLabelText(/Unit Price/i), { target: { value: '150' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Add to Inventory/i }));

    expect(onAddMock).toHaveBeenCalledWith(expect.objectContaining({
      productName: 'Custom Mug',
      stock: 20,
      price: 150
    }));
  });
});