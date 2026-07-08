export function predictYFromLinearRegression(points, xToPredict) {
  if (!Array.isArray(points) || points.length === 0) return null;

  // Build sums for least-squares linear regression:
  // y = a + b*x
  // b = (n*Σ(xy) - Σx*Σy) / (n*Σ(x^2) - (Σx)^2)
  // a = (Σy - b*Σx) / n
  const n = points.length;

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  for (const p of points) {
    const x = Array.isArray(p) ? p[0] : p?.x;
    const y = Array.isArray(p) ? p[1] : p?.y;

    const xNum = Number(x);
    const yNum = Number(y);

    if (!Number.isFinite(xNum) || !Number.isFinite(yNum)) return null;

    sumX += xNum;
    sumY += yNum;
    sumXY += xNum * yNum;
    sumX2 += xNum * xNum;
  }

  const xToPredictNum = Number(xToPredict);
  if (!Number.isFinite(xToPredictNum)) return null;

  const denominator = n * sumX2 - sumX * sumX;
  if (denominator === 0) {
    // All x are identical; regression slope undefined.
    // Fall back to predicting using the mean of y.
    const meanY = sumY / n;
    return meanY;
  }

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  return intercept + slope * xToPredictNum;
}
