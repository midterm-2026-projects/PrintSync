import { describe, it, expect, beforeAll, afterAll } from 'vitest';

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Integration tests for the actual DB connection pool configuration.
// These tests require real DB credentials in backend/.env.

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load backend/.env explicitly (cwd-independent)
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

describe('DB pool integration (backend/db/pool.js)', () => {
  let poolModule;

  const hasSupabase = !!process.env.SUPABASE_DB_URL;
  const hasPgHost = !!process.env.PGHOST;

  beforeAll(async () => {
    // Import after dotenv so pool gets the final env
    poolModule = await import('../../db/pool.js');
  });

  afterAll(async () => {
    // Ensure we close the pool if the module exported it.
    try {
      if (poolModule?.pool) await poolModule.pool.end();
    } catch {}
  });

  it('should expose a pg Pool instance', () => {
    expect(poolModule?.pool).toBeTruthy();
    expect(typeof poolModule.pool.query).toBe('function');
  });

  it('should connect to DB and run a simple query: select 1', async () => {
    if (!hasSupabase && !hasPgHost) {
      // If no creds, skip rather than failing the whole CI run.
      return;
    }


    const res = await poolModule.pool.query('select 1 as ok');
    expect(res).toBeTruthy();
    expect(res.rows).toBeTruthy();
    expect(res.rows?.[0]?.ok).toBe(1);
  });

  it('should respect SSL default for SUPABASE_DB_URL (unless explicitly disabled)', async () => {
    // Configuration/behavior test: ensure a query succeeds under the currently loaded env.
    // (We avoid introspecting pg internals; we validate via successful connection.)

    if (!process.env.SUPABASE_DB_URL) {
      // If we are using only PG_* vars, SSLMODE may be different; skip here.
      return;
    }

    const res = await poolModule.pool.query('select 1 as ok');
    expect(res.rows?.[0]?.ok).toBe(1);
  });

  it('should handle concurrent simple queries', async () => {
    if (!hasSupabase && !hasPgHost) {
      // Skip in CI when DB credentials are not provided.
      return;
    }


    const results = await Promise.all([
      poolModule.pool.query('select 1 as ok'),
      poolModule.pool.query('select 2 as ok'),
      poolModule.pool.query('select 3 as ok'),
    ]);

    expect(results[0].rows?.[0]?.ok).toBe(1);
    expect(results[1].rows?.[0]?.ok).toBe(2);
    expect(results[2].rows?.[0]?.ok).toBe(3);
  });
});


