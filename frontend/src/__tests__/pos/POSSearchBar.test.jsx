import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import POSSearchBar from '../../features/pos/components/POSSearchBar';

describe('POSSearchBar Component', () => {
  it('should handle null value prop gracefully', () => {
    render(<POSSearchBar value={null} onChange={() => {}} />);
    const input = screen.getByPlaceholderText(/Search by name.../i);
    expect(input.value).toBe("");
  });

  it('should trigger onChange when user types', () => {
    const callback = vi.fn();
    render(<POSSearchBar value="" onChange={callback} />);
    fireEvent.change(screen.getByPlaceholderText(/Search by name.../i), { target: { value: 'A' } });
    expect(callback).toHaveBeenCalledWith('A');
  });
});