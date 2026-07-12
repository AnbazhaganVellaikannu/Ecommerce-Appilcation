import pg from 'pg';

if (!process.env.DATABASE_URL) {
  console.error(
    'DATABASE_URL is not set — copy .env.example to .env and fill in your Neon connection string.'
  );
  process.exit(1);
}

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
});
