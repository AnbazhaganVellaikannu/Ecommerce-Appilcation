export async function ensureSchema(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      category    TEXT NOT NULL,
      price       NUMERIC(10,2) NOT NULL CHECK (price >= 0),
      stock       INTEGER NOT NULL CHECK (stock >= 0),
      image       TEXT,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS orders (
      id          TEXT PRIMARY KEY,
      user_id     TEXT NOT NULL,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
      items       JSONB NOT NULL,
      subtotal    NUMERIC(10,2) NOT NULL,
      tax         NUMERIC(10,2) NOT NULL,
      total       NUMERIC(10,2) NOT NULL,
      shipping    JSONB NOT NULL,
      payment     JSONB NOT NULL
    );

    -- Migrates orders tables created before accounts existed (guest_id -> user_id).
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id TEXT;
    ALTER TABLE orders DROP COLUMN IF EXISTS guest_id;

    DROP INDEX IF EXISTS orders_guest_id_idx;
    CREATE INDEX IF NOT EXISTS orders_user_id_idx ON orders (user_id, created_at DESC);
  `);
}
