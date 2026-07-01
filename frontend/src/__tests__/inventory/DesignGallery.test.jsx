import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';
import DesignGallery from '../../features/inventory/components/DesignGallery';

describe('Design Gallery UI (Week 2 Day 2)', () => {
  const mockDesigns = [
    { id: 1, title: 'Logo A', url: 'https://via.placeholder.com/150' },
    { id: 2, title: 'Logo B', url: 'https://via.placeholder.com/150' }
  ];

  it('should render thumbnails in a consistent 150x150px size', () => {
    render(<DesignGallery designs={mockDesigns} />);
    const images = screen.getAllByRole('img');
    
    // Requirement: Check for 150x150px dimensions
    images.forEach(img => {
      expect(img.style.width).toBe('150px');
      expect(img.style.height).toBe('150px');
      expect(img.style.objectFit).toBe('cover');
    });
  });

  it('should open a modal when a thumbnail is clicked', () => {
    render(<DesignGallery designs={mockDesigns} />);
    
    const firstThumb = screen.getAllByRole('img')[0];
    fireEvent.click(firstThumb);

    // Requirement: Modal should open containing full-res version
    const modal = screen.getByTestId('image-modal');
    expect(modal).toBeInTheDocument();
    expect(screen.getByText(/Full Resolution Preview/i)).toBeInTheDocument();
  });

  it('should close the modal when the close button is clicked', () => {
    render(<DesignGallery designs={mockDesigns} />);
    
    fireEvent.click(screen.getAllByRole('img')[0]);
    const closeBtn = screen.getByText(/Close/i);
    fireEvent.click(closeBtn);

    expect(screen.queryByTestId('image-modal')).not.toBeInTheDocument();
  });

  it('should display a message when the gallery is empty', () => {
    render(<DesignGallery designs={[]} />);
    expect(screen.getByText(/No designs found in repository/i)).toBeInTheDocument();
  });
});