import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import AIInsightArea from '../../features/analytics/components/AIInsightArea';

describe('AI Interaction Interface', () => {
  it('should display the trigger button initially', () => {
    render(<AIInsightArea />);
    expect(screen.getByRole('button', { name: /Analyze Business/i })).toBeInTheDocument();
  });

  it('should display "Generating insights..." when the button is clicked', async () => {
    vi.useFakeTimers();
    render(<AIInsightArea />);
    
    const triggerBtn = screen.getByRole('button', { name: /Analyze Business/i });
    fireEvent.click(triggerBtn);

    // Requirement: Show loading state
    expect(screen.getByText(/Generating insights.../i)).toBeInTheDocument();
    
    vi.useRealTimers();
  });

  it('should display the simulated insight text after loading', async () => {
    vi.useFakeTimers();
    render(<AIInsightArea />);
    
    fireEvent.click(screen.getByRole('button', { name: /Analyze Business/i }));
    
    // Fast-forward the simulated delay
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Check if the mock insight appears
    expect(screen.getByText(/Based on your sales data/i)).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('should have a container that supports scrolling for long text', () => {
    render(<AIInsightArea />);
    // Click to show text
    fireEvent.click(screen.getByRole('button', { name: /Analyze Business/i }));
    
    const insightBox = screen.getByTestId('insight-box');
    // Requirement: Check for overflow/scroll properties in the style
    expect(insightBox.style.overflowY).toBe('auto');
    expect(insightBox.style.wordWrap).toBe('break-word');
  });

  it('should display a red error message if the AI service call is unsuccessful', async () => {
    vi.useFakeTimers();
    render(<AIInsightArea />);
    
    // Trigger the simulated failure
    const failBtn = screen.getByText(/Simulate AI Failure/i);
    fireEvent.click(failBtn);

    // Advance time to pass the loading state
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Requirement Check: UI should display an error message
    const errorMsg = screen.getByText(/AI Service is currently unavailable/i);
    expect(errorMsg).toBeInTheDocument();
    
    // Ensure the text is highlighted as an error (Red)
    expect(errorMsg.parentElement.style.color).toBe('red');
    
    // Ensure "Generating insights..." is gone
    expect(screen.queryByText(/Generating insights.../i)).not.toBeInTheDocument();

    vi.useRealTimers();
  });
});