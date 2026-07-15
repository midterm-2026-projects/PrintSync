import { defineConfig } from "vitest/config";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load backend/.env before Vitest collects/executes tests.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',

    // Integration tests hit a real DB via pg Pool.
    // Vitest default per-test timeout (5000ms) is too small under slow network/SSL/connection acquisition.
    testTimeout: 20000,
  },
});




