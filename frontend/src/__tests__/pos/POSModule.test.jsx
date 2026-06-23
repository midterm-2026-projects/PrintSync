import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import POSModule from '../../features/pos/components/POSModule';

describe('POSModule Integration', () => {
  const mockInventory = [
    { id: 1, productName: 'Cap', stock: 5 }
  ];

  it('should add an item to the cart summary when button is clicked', () => {
    render(<POSModule inventory={mockInventory} />);
    
    const addButton = screen.getByRole('button', { name: /Add to Cart/i });
    fireEvent.click(addButton);

    expect(screen.getByText('Current Cart Items: 1')).toBeInTheDocument();
  });

  it('should filter items when the user types in the search box', () => {
    render(<POSModule inventory={[{id:1, productName: 'Mug'}]} />);
    
    const searchInput = screen.getByPlaceholderText(/Search inventory/i);
    fireEvent.change(searchInput, { target: { value: 'NonExistent' } });

    expect(screen.getByText(/No matching items found/i)).toBeInTheDocument();
  });
});