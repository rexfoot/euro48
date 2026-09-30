const { Pool } = require('pg');

const connectionString = 'postgresql://postgres.uualvghtkhaaeubrooji:Agadirmaroc72%40@aws-1-eu-west-1.pooler.supabase.com:6543/postgres';

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  try {
    await pool.query("ALTER TABLE offers ADD COLUMN IF NOT EXISTS eligibility TEXT DEFAULT 'C'");
    await pool.query("ALTER TABLE offers ADD COLUMN IF NOT EXISTS profession_id TEXT");
    await pool.query("ALTER TABLE offers ADD COLUMN IF NOT EXISTS exclude_reasons TEXT[] DEFAULT '{}'::text[]");
    await pool.query("ALTER TABLE offers ADD COLUMN IF NOT EXISTS positive_signals TEXT[] DEFAULT '{}'::text[]");
    console.log('Columns added successfully');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

main();
