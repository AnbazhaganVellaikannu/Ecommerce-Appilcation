import 'dotenv/config'
import { pool } from './db.js'
import products from './seed-data.js'

async function seed() {
  for (const p of products) {
    await pool.query(
      `INSERT INTO products (id, name, price, emoji, category, description, stock)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO NOTHING`,
      [p.id, p.name, p.price, p.emoji, p.category, p.description, p.stock]
    )
  }
  console.log(`Seeded ${products.length} products (existing rows left untouched).`)
  await pool.end()
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
