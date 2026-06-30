import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import ItemForm from '../../features/inventory/components/ItemForm';

describe('ItemForm Validation (Week 2 Day 1)', () => {
  it('should display an error message if the Item Name field is empty on submission', () => {
    const onAddMock = vi.fn();
    render(<ItemForm onAdd={onAddMock} />);
    
    const submitBtn = screen.getByRole('button', { name: /Add Item/i });
    fireEvent.click(submitBtn);

    // Requirement: Display error message for empty name
    expect(screen.getByText(/Item name is required/i)).toBeInTheDocument();
    expect(onAddMock).not.toHaveBeenCalled();
  });

  it('should display an error message if Initial Stock is negative', () => {
    const onAddMock = vi.fn();
    render(<ItemForm onAdd={onAddMock} />);
    
    const nameInput = screen.getByLabelText(/Item Name:/i);
    const stockInput = screen.getByLabelText(/Initial Stock:/i);
    const submitBtn = screen.getByRole('button', { name: /Add Item/i });

    fireEvent.change(nameInput, { target: { value: 'Valid Item' } });
    fireEvent.change(stockInput, { target: { value: '-5' } });
    fireEvent.click(submitBtn);

    // Requirement: Reject negative numbers
    expect(screen.getByText(/Stock cannot be negative/i)).toBeInTheDocument();
    expect(onAddMock).not.toHaveBeenCalled();
  });

  it('should call onAdd with formatted data if inputs are valid', () => {
    const onAddMock = vi.fn();
    render(<ItemForm onAdd={onAddMock} />);
    
    fireEvent.change(screen.getByLabelText(/Item Name:/i), { target: { value: 'Cotton Tee' } });
    fireEvent.change(screen.getByLabelText(/Initial Stock:/i), { target: { value: '10' } });
    fireEvent.click(screen.getByRole('button', { name: /Add Item/i }));

    expect(onAddMock).toHaveBeenCalledWith(expect.objectContaining({
      productName: 'Cotton Tee',
      stock: 10
    }));
  });
});