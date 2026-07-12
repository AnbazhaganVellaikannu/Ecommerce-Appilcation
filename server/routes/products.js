import { Router } from 'express';
import { pool } from '../db.js';

export const productsRouter = Router();

productsRouter.get('/', async (req, res) => {
  const { rows } = await pool.query(
    'SELECT id, name, category, price, stock, image, description FROM products ORDER BY id'
  );
  const products = rows.map((p) => ({
    ...p,
    price: Number(p.price),
    stock: Number(p.stock),
  }));
  res.json(products);
});
