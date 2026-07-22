import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { resetInventoryFixtures } from './__tests__/sample-backend/handler';

afterEach(() => {
  resetInventoryFixtures();
});
