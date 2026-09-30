const { Pool } = require('pg');

const connectionString = 'postgresql://neondb_owner:npg_HT1SVRLoUKq6@ep-icy-cloud-b48jsul2-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  try {
    const dbSize = await pool.query("SELECT pg_size_pretty(pg_database_size(current_database())) as size");
    console.log('DB size:', dbSize.rows[0].size);

    const tables = await pool.query(`
      SELECT tablename, pg_size_pretty(pg_total_relation_size(quote_ident(tablename))) as size
      FROM pg_tables WHERE schemaname='public'
      ORDER BY pg_total_relation_size(quote_ident(tablename)) DESC
    `);
    console.log('\nTables:');
    tables.rows.forEach(r => console.log(`  ${r.tablename}: ${r.size}`));

    const counts = await pool.query('SELECT count(*) as total FROM offers');
    console.log('\nTotal offers:', counts.rows[0].total);

    const byCountry = await pool.query('SELECT country_code, count(*) as count FROM offers GROUP BY country_code ORDER BY count DESC');
    console.log('\nOffers by country:');
    byCountry.rows.forEach(r => console.log(`  ${r.country_code}: ${r.count}`));

    const oldest = await pool.query('SELECT min(published_at) as oldest, max(published_at) as newest FROM offers');
    console.log('\nOldest offer:', oldest.rows[0].oldest);
    console.log('Newest offer:', oldest.rows[0].newest);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

main();
