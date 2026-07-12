import { products } from './products.js';

export async function seedIfEmpty(pool) {
  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM products');
  if (rows[0].count > 0) {
    console.log('Products already seeded, skipping.');
    return;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const p of products) {
      await client.query(
        `INSERT INTO products (id, name, category, price, stock, image, description)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO NOTHING`,
        [p.id, p.name, p.category, p.price, p.stock, p.image, p.description]
      );
    }
    await client.query('COMMIT');
    console.log(`Seeded ${products.length} products.`);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
