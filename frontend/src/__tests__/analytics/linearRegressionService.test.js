import { describe, it, expect } from 'vitest';
import { predictYFromLinearRegression } from '../../features/analytics/services/linearRegressionService';

describe('linearRegressionService (Week 3 Day 2)', () => {
  it('should return predicted value of 15 for trend line y = 2x + 5 when x = 5', () => {
    // Use points that perfectly follow y = 2x + 5
    const points = [
      { x: 0, y: 5 },
      { x: 1, y: 7 },
      { x: 2, y: 9 },
      { x: 3, y: 11 },
      { x: 4, y: 13 },
      { x: 6, y: 17 },
    ];

    const predicted = predictYFromLinearRegression(points, 5);
    expect(predicted).toBeCloseTo(15, 10);
  });

  it('should return null (not crash) when provided an empty data array', () => {
    const predicted = predictYFromLinearRegression([], 5);
    expect(predicted).toBeNull();
  });

  it('should return null when given invalid xToPredict', () => {
    const points = [
      { x: 1, y: 7 },
      { x: 2, y: 9 },
    ];

    const predicted = predictYFromLinearRegression(points, 'not-a-number');
    expect(predicted).toBeNull();
  });

  it('should predict correctly with negative x/y values', () => {
    // y = 2x + 5
    const points = [
      { x: -2, y: 1 },
      { x: -1, y: 3 },
      { x: 0, y: 5 },
      { x: 1, y: 7 },
    ];

    // For x = -1.5 => y = 2(-1.5)+5 = 2
    const predicted = predictYFromLinearRegression(points, -1.5);
    expect(predicted).toBeCloseTo(2, 10);
  });

  it('should handle identical x values by falling back to mean(y)', () => {
    // Denominator becomes 0 => meanY fallback
    const points = [
      { x: 1, y: 10 },
      { x: 1, y: 14 },
      { x: 1, y: 16 },
    ];

    // meanY = (10+14+16)/3 = 40/3 = 13.333...
    const predicted = predictYFromLinearRegression(points, 999);
    expect(predicted).toBeCloseTo(40 / 3, 10);
  });

  it('should handle single data point by returning that point y (mean(y) fallback)', () => {
    const points = [{ x: 2, y: 42 }];
    const predicted = predictYFromLinearRegression(points, 100);
    expect(predicted).toBeCloseTo(42, 10);
  });

  it('should return null if any point has non-finite x/y', () => {
    const points = [
      { x: 1, y: 7 },
      { x: 2, y: Infinity },
    ];

    const predicted = predictYFromLinearRegression(points, 5);
    expect(predicted).toBeNull();
  });

  it('should also support tuple points like [x, y]', () => {
    // y = 2x + 5
    const points = [
      [0, 5],
      [1, 7],
      [2, 9],
      [3, 11],
    ];

    const predicted = predictYFromLinearRegression(points, 4);
    expect(predicted).toBeCloseTo(13, 10);
  });
});
