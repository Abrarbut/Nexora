const EmbeddedPostgres = require('embedded-postgres').default;
const fs = require('fs');
const path = require('path');

async function start() {
  const pg = new EmbeddedPostgres({
    databaseDir: './pg-data',
    user: 'postgres',
    password: 'NexoraPass786007',
    port: 5432,
    persistent: true,
  });

  console.log('Starting PostgreSQL...');
  
  // Only initialise if not already done
  const dataFlag = path.join('./pg-data', 'PG_VERSION');
  if (!fs.existsSync(dataFlag)) {
    console.log('First run — initializing database cluster...');
    await pg.initialise();
  }

  await pg.start();
  console.log('PostgreSQL is running on port 5432!');

  // Create the nexora database if it doesn't exist
  try {
    await pg.createDatabase('nexora');
    console.log('Database "nexora" created!');
  } catch {
    console.log('Database "nexora" already exists.');
  }

  // Test connection
  const { Client } = require('pg');
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'NexoraPass786007',
    database: 'nexora',
  });
  await client.connect();
  const res = await client.query('SELECT 1 as test');
  console.log('Connection test:', res.rows);
  await client.end();

  console.log('\nPostgreSQL is ready! Keep this terminal open.');
  console.log('DATABASE_URL: postgresql://postgres:NexoraPass786007@localhost:5432/nexora');
  console.log('\nPress Ctrl+C to stop.');

  process.on('SIGINT', async () => {
    console.log('\nStopping PostgreSQL...');
    await pg.stop();
    process.exit(0);
  });
}

start().catch(async (err) => {
  console.error('Error:', err?.message || err);
  process.exit(1);
});
