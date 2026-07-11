import { Router } from 'express'
import { query } from '../db.js'

const router = Router()

router.get('/', async (_req, res) => {
  const { rows } = await query(
    'SELECT id, name, price, emoji, category, description, stock FROM products ORDER BY id'
  )
  res.json(
    rows.map((p) => ({ ...p, price: Number(p.price), stock: Number(p.stock) }))
  )
})

export default router
