import dns from 'dns/promises';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

function extractHostFromPgConnectionString(dbUrl) {
  if (!dbUrl) return undefined;
  const m = dbUrl.match(/@([^:/?]+)(?::\d+)?/);
  return m?.[1];
}

const usedSupabaseUrl = process.env.SUPABASE_DB_URL;
const host = usedSupabaseUrl ? extractHostFromPgConnectionString(usedSupabaseUrl) : process.env.PGHOST;

console.log('debugDns host:', { host, hasSUPABASE_DB_URL: !!usedSupabaseUrl });

if (!host) {
  console.error('No host found (SUPABASE_DB_URL or PGHOST missing).');
  process.exit(1);
}

try {
  const res4 = await dns.resolve4(host);
  console.log('A records:', res4);
} catch (e) {
  console.error('A resolve failed:', e);
}

try {
  const res6 = await dns.resolve6(host);
  console.log('AAAA records:', res6);
} catch (e) {
  console.error('AAAA resolve failed:', e);
}

try {
  const resAll = await dns.lookup(host);
  console.log('lookup:', resAll);
} catch (e) {
  console.error('lookup failed:', e);
}

