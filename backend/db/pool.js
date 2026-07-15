import pg from 'pg';

const { Pool } = pg;

function hasDbEnv() {
  return !!process.env.SUPABASE_DB_URL || !!process.env.PGHOST;
}

function buildConnectionConfig() {
  // Preferred: Supabase connection string
  if (process.env.SUPABASE_DB_URL) {
    return {
      connectionString: process.env.SUPABASE_DB_URL,
      ssl:
        process.env.SUPABASE_DB_SSLMODE === 'disable'
          ? undefined
          : {
              rejectUnauthorized: false,
            },
    };
  }

  // Fallback: split PG_* vars
  const {
    PGHOST,
    PGPORT,
    PGDATABASE,
    PGUSER,
    PGPASSWORD,
    SUPABASE_DB_SSLMODE,
  } = process.env;

  if (!PGHOST || !PGDATABASE || !PGUSER || !PGPASSWORD) {
    // Do NOT throw during module import. This is handled by getRealPool.
    return null;
  }

  return {
    host: PGHOST,
    port: PGPORT ? Number(PGPORT) : 5432,
    database: PGDATABASE,
    user: PGUSER,
    password: PGPASSWORD,
    ssl:
      SUPABASE_DB_SSLMODE === 'disable'
        ? undefined
        : {
            rejectUnauthorized: false,
          },
  };
}

let realPool = null;

function getRealPool() {
  if (realPool) return realPool;

  if (!hasDbEnv()) {
    throw new Error(
      'DB credentials missing for tests. Provide SUPABASE_DB_URL or PGHOST+PGDATABASE+PGUSER+PGPASSWORD.'
    );
  }

  const config = buildConnectionConfig();
  if (!config) {
    throw new Error(
      'DB credentials incomplete for tests. Provide SUPABASE_DB_URL or PGHOST+PGDATABASE+PGUSER+PGPASSWORD.'
    );
  }

  realPool = new Pool({
    ...config,
    max: process.env.PG_POOL_MAX ? Number(process.env.PG_POOL_MAX) : 10,
    idleTimeoutMillis: 30_000,
    // Keep this comfortably below Vitest's default 5s per-test timeout
    connectionTimeoutMillis: process.env.PG_CONNECTION_TIMEOUT_MS
      ? Number(process.env.PG_CONNECTION_TIMEOUT_MS)
      : 3_000,
    // Prevent long-running/blocked queries from hanging tests.
    // Note: applies to each new connection/session created by the Pool.
    options: (() => {
      const base = '-c statement_timeout=4000';
      const extra = process.env.PG_STATEMENT_TIMEOUT_OPTIONS || '';
      return extra ? `${base} ${extra}` : base;
    })(),
  });

  return realPool;
}

// Create a safe proxy so imports never explode.
// Actual DB work will throw when query() is called.
const pool = {
  query: async (...args) => {
    return getRealPool().query(...args);
  },
  end: async (...args) => {
    if (!realPool) return;
    return realPool.end(...args);
  },
};

export { pool };

