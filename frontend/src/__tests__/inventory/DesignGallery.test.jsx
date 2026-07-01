import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';
import DesignGallery from '../../features/inventory/components/DesignGallery';

describe('DesignGallery Grid Layout', () => {
  const mockDesigns = [
    { id: 1, title: 'Logo A', url: 'https://i.pinimg.com/736x/04/da/28/04da281aaac9d8b290a2535508f594d1.jpg' }
  ];

  it('should render thumbnails in a consistent 150x150px aspect ratio grid', () => {
    render(<DesignGallery designs={mockDesigns} />);
    const img = screen.getByRole('img');

    // Acceptance Criteria: 150x150px
    expect(img.style.width).toBe('150px');
    expect(img.style.height).toBe('150px');
    expect(img.style.objectFit).toBe('cover');
  });

  it('should display a message when the gallery is empty', () => {
    render(<DesignGallery designs={[]} />);
    expect(screen.getByText(/No designs found in repository/i)).toBeInTheDocument();
  });
});