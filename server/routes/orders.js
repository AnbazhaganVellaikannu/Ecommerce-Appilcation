import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/requireAuth.js';

export const ordersRouter = Router();

const TAX_RATE = 0.07;

function round2(n) {
  return Math.round(n * 100) / 100;
}

function serializeOrder(row) {
  return {
    id: row.id,
    createdAt: row.created_at,
    items: row.items,
    subtotal: Number(row.subtotal),
    tax: Number(row.tax),
    total: Number(row.total),
    shipping: row.shipping,
    payment: row.payment,
  };
}

ordersRouter.post('/', requireAuth, async (req, res) => {
  const { items, shipping, payment } = req.body ?? {};
  if (!Array.isArray(items) || items.length === 0 || !shipping || !payment) {
    return res.status(400).json({ error: 'Malformed order payload' });
  }
  for (const item of items) {
    if (!item || typeof item.productId !== 'string' || !(Number(item.qty) > 0)) {
      return res.status(400).json({ error: 'Malformed order item' });
    }
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const lineItems = [];
    const shortfalls = [];

    for (const { productId, qty } of items) {
      const { rows } = await client.query(
        'SELECT id, name, price, stock FROM products WHERE id = $1 FOR UPDATE',
        [productId]
      );
      if (rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: `Product not found: ${productId}` });
      }
      const product = rows[0];
      const stock = Number(product.stock);
      if (qty > stock) {
        shortfalls.push({ productId, requested: qty, available: stock });
        continue;
      }
      lineItems.push({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        qty: Number(qty),
      });
    }

    if (shortfalls.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Insufficient stock', shortfalls });
    }

    for (const item of lineItems) {
      await client.query('UPDATE products SET stock = stock - $1 WHERE id = $2', [
        item.qty,
        item.id,
      ]);
    }

    const subtotal = round2(lineItems.reduce((sum, i) => sum + i.price * i.qty, 0));
    const tax = round2(subtotal * TAX_RATE);
    const total = round2(subtotal + tax);
    const orderId = `ORD-${Date.now()}`;

    const { rows: orderRows } = await client.query(
      `INSERT INTO orders (id, user_id, items, subtotal, tax, total, shipping, payment)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        orderId,
        req.user.id,
        JSON.stringify(lineItems),
        subtotal,
        tax,
        total,
        JSON.stringify(shipping),
        JSON.stringify(payment),
      ]
    );

    await client.query('COMMIT');
    res.status(201).json(serializeOrder(orderRows[0]));
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Failed to create order:', err);
    res.status(500).json({ error: 'Failed to create order' });
  } finally {
    client.release();
  }
});

ordersRouter.get('/', requireAuth, async (req, res) => {
  const { rows } = await pool.query(
    'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
    [req.user.id]
  );
  res.json(rows.map(serializeOrder));
});

ordersRouter.get('/:id', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
  if (rows.length === 0) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json(serializeOrder(rows[0]));
});
