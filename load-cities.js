const { Pool } = require('pg');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const COUNTRIES = ['DE', 'NL', 'CH', 'LU', 'BE', 'AT', 'IE', 'FR', 'ES', 'IT', 'NO', 'DK', 'SE', 'FI', 'IS', 'PT', 'PL', 'GB'];

const connectionString = 'postgresql://postgres.uualvghtkhaaeubrooji:Agadirmaroc72%40@aws-1-eu-west-1.pooler.supabase.com:6543/postgres';

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function main() {
  const zipPath = path.join(__dirname, 'cities1000.zip');
  const txtPath = path.join(__dirname, 'cities1000.txt');

  console.log('Downloading cities1000.zip...');
  await downloadFile('https://download.geonames.org/export/dump/cities1000.zip', zipPath);
  console.log('Downloaded. Extracting...');

  execSync(`powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${__dirname}' -Force"`);
  console.log('Extracted.');

  const content = fs.readFileSync(txtPath, 'utf-8');
  const lines = content.split('\n').filter(l => l.trim());

  const cities = [];
  let skipped = 0;
  for (const line of lines) {
    const parts = line.split('\t');
    if (parts.length < 15) { skipped++; continue; }
    const countryCode = parts[8]?.trim();
    if (!countryCode || !COUNTRIES.includes(countryCode)) { skipped++; continue; }

    const geonameId = parseInt(parts[0]);
    const name = parts[1];
    const asciiName = parts[2];
    const altNames = parts[3] || null;
    const population = parseInt(parts[14]) || 0;
    const lat = parseFloat(parts[4]);
    const lng = parseFloat(parts[5]);

    if (!geonameId || !name || !asciiName || isNaN(lat) || isNaN(lng)) { skipped++; continue; }

    cities.push({ geonameId, name, asciiName, altNames, countryCode, population, lat, lng });
  }
  console.log(`Skipped ${skipped} lines`);
  console.log(`First 3 cities:`, cities.slice(0, 3));

  console.log(`Found ${cities.length} cities in ${COUNTRIES.length} countries`);

  const batchSize = 500;
  let inserted = 0;

  for (let i = 0; i < cities.length; i += batchSize) {
    const batch = cities.slice(i, i + batchSize);
    const values = [];
    const params = [];

    for (const city of batch) {
      const offset = params.length;
      params.push(city.geonameId, city.name, city.asciiName, city.altNames, city.countryCode, city.population, city.lat, city.lng);
      values.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8})`);
    }

    const sql = `INSERT INTO cities (geoname_id, name, ascii_name, alt_names, country_code, population, lat, lng) VALUES ${values.join(', ')} ON CONFLICT (geoname_id) DO NOTHING`;
    await pool.query(sql, params);
    inserted += batch.length;
    console.log(`Inserted ${inserted}/${cities.length}`);
  }

  const byCountry = await pool.query(`
    SELECT country_code, count(*) as count FROM cities GROUP BY country_code ORDER BY count DESC
  `);

  console.log('\nCities loaded per country:');
  for (const row of byCountry.rows) {
    console.log(`  ${row.country_code}: ${row.count}`);
  }

  fs.unlinkSync(zipPath);
  fs.unlinkSync(txtPath);

  await pool.end();
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
