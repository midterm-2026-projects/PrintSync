import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Ensure the correct .env is loaded regardless of where the script is launched from.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '..', '.env');
const loaded = dotenv.config({ path: envPath });
if (loaded.error) {
  console.error('dotenv failed to load:', loaded.error);
} else {
  console.log('dotenv loaded:', { envPath, keys: loaded.parsed ? Object.keys(loaded.parsed) : undefined });
}

// import pool via dynamic import to ensure dotenv has executed
const { pool } = await import('../db/pool.js');




function safeMaskDbUrl(dbUrl) {

  if (!dbUrl) return dbUrl;
  try {
    // Example: postgres://user:pass@host:5432/db?params
    return dbUrl.replace(/^(postgres(?:ql)?:\/\/)([^:@/]+)(?::([^@/]*))?(@)/, (_m, proto, user, _pass, at) => {
      return `${proto}${user}:****${at}`;
    });
  } catch {
    return '[unparseable SUPABASE_DB_URL]';
  }
}

function extractHostFromPgConnectionString(dbUrl) {
  if (!dbUrl) return undefined;
  // Best-effort: pull host part after @ and before : or / or ?
  const m = dbUrl.match(/@([^:/?]+)(?::\d+)?/);
  return m?.[1];
}

async function main() {
  const usedSupabaseUrl = process.env.SUPABASE_DB_URL;
  const usedHost = usedSupabaseUrl
    ? extractHostFromPgConnectionString(usedSupabaseUrl)
    : process.env.PGHOST;

  console.log('DB env check:', {
    hasSUPABASE_DB_URL: !!usedSupabaseUrl,
    SUPABASE_DB_URL: safeMaskDbUrl(usedSupabaseUrl),
    PGHOST: process.env.PGHOST,
    PGDATABASE: process.env.PGDATABASE ? '[set]' : undefined,
    resolvedHostHint: usedHost,
  });

  // Simple connectivity + query test (no app logic changes)
  const res = await pool.query('select 1 as ok');
  console.log('DB check OK:', res.rows?.[0]);

  // Gracefully end the pool so the script exits
  await pool.end();
}

main()
  .then(() => process.exit(0))
  .catch(async (err) => {
    console.error('DB check FAILED:', err);
    try {
      await pool.end();
    } catch {}
    process.exit(1);
  });
