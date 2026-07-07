import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import ImageModal from '../../features/inventory/components/ImageModal';
import DesignGallery from '../../features/inventory/components/DesignGallery';

describe('ImageModal Preview & Interaction Logic', () => {
  const mockImage = { title: 'Test Design', url: 'https://via.placeholder.com/600' };
  const mockDesigns = [
    { id: 1, title: 'Logo A', url: 'https://via.placeholder.com/150' }
  ];

  // Logic Test: Internal Render
  it('should not render anything if no image is provided', () => {
    const { container } = render(<ImageModal image={null} onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  // Logic Test: Content Display
  it('should render the full resolution image and title when an image prop is present', () => {
    render(<ImageModal image={mockImage} onClose={() => {}} />);
    expect(screen.getByTestId('image-modal')).toBeInTheDocument();
    expect(screen.getByText(/Full Resolution Preview: Test Design/i)).toBeInTheDocument();
  });

  // Requirement: Integration Interaction Test
  it('should open a modal containing the full-resolution version when a thumbnail is clicked', () => {
    // We render the Gallery which contains the Modal logic
    render(<DesignGallery designs={mockDesigns} />);
    
    // Find the thumbnail and click it
    const thumbnail = screen.getByRole('img');
    fireEvent.click(thumbnail);

    // Verify the modal appears
    const modal = screen.getByTestId('image-modal');
    expect(modal).toBeInTheDocument();
    
    // Verify it contains the correct image context
    expect(screen.getByText(/Full Resolution Preview: Logo A/i)).toBeInTheDocument();
  });

  // Logic Test: Exit Point
  it('should call onClose when the Close button is clicked', () => {
    const onCloseMock = vi.fn();
    render(<ImageModal image={mockImage} onClose={onCloseMock} />);
    
    fireEvent.click(screen.getByText(/Close/i));
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});