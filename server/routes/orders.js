import { randomUUID } from 'node:crypto'
import { Router } from 'express'
import { query, withTransaction } from '../db.js'
import { requireAuth } from '../middleware/requireAuth.js'

const router = Router()

const TAX_RATE = 0.08
const FREE_SHIPPING_THRESHOLD = 50
const SHIPPING_FEE = 4.99

router.post('/', requireAuth, async (req, res) => {
  const { items, shippingInfo, paymentInfo } = req.body ?? {}

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Order must include at least one item.' })
  }
  for (const item of items) {
    if (!item?.productId || !Number.isInteger(item.quantity) || item.quantity <= 0) {
      return res.status(400).json({ error: 'Each item needs a productId and a positive integer quantity.' })
    }
  }

  try {
    const order = await withTransaction(async (client) => {
      const productIds = items.map((i) => i.productId)
      const { rows: products } = await client.query(
        'SELECT id, name, emoji, price, stock FROM products WHERE id = ANY($1) FOR UPDATE',
        [productIds]
      )
      const productById = new Map(products.map((p) => [p.id, p]))

      const orderItems = []
      for (const { productId, quantity } of items) {
        const product = productById.get(productId)
        if (!product) {
          throw Object.assign(new Error(`Unknown product: ${productId}`), { status: 400 })
        }
        if (product.stock < quantity) {
          throw Object.assign(
            new Error(`Not enough stock for "${product.name}" (${product.stock} available).`),
            { status: 409 }
          )
        }
        orderItems.push({ product, quantity })
      }

      const round2 = (n) => Math.round(n * 100) / 100
      const subtotal = round2(orderItems.reduce((sum, i) => sum + i.quantity * Number(i.product.price), 0))
      const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
      const tax = round2(subtotal * TAX_RATE)
      const total = round2(subtotal + shipping + tax)
      const orderId = `ORD-${randomUUID().split('-')[0].toUpperCase()}`
      const cardLast4 = (paymentInfo?.cardNumber ?? '').replace(/\s/g, '').slice(-4)

      await client.query(
        `INSERT INTO orders (id, user_id, subtotal, shipping, tax, total, shipping_name, shipping_address, shipping_city, shipping_zip, card_last4)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          orderId,
          req.user.id,
          subtotal,
          shipping,
          tax,
          total,
          shippingInfo?.fullName ?? null,
          shippingInfo?.address ?? null,
          shippingInfo?.city ?? null,
          shippingInfo?.zip ?? null,
          cardLast4,
        ]
      )

      for (const { product, quantity } of orderItems) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, name, emoji, price, quantity)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [orderId, product.id, product.name, product.emoji, product.price, quantity]
        )
        await client.query('UPDATE products SET stock = stock - $1 WHERE id = $2', [quantity, product.id])
      }

      return {
        id: orderId,
        date: new Date().toISOString(),
        items: orderItems.map(({ product, quantity }) => ({
          id: product.id,
          name: product.name,
          emoji: product.emoji,
          price: Number(product.price),
          quantity,
        })),
        subtotal,
        shipping,
        tax,
        total,
        shippingInfo,
        cardLast4,
      }
    })

    res.status(201).json(order)
  } catch (err) {
    const status = err.status ?? 500
    if (status === 500) console.error(err)
    res.status(status).json({ error: err.message ?? 'Failed to place order.' })
  }
})

router.get('/:id', requireAuth, async (req, res) => {
  const { rows: orderRows } = await query('SELECT * FROM orders WHERE id = $1', [req.params.id])
  const order = orderRows[0]
  if (!order) return res.status(404).json({ error: 'Order not found.' })
  if (order.user_id !== req.user.id) return res.status(403).json({ error: 'Not your order.' })

  const { rows: items } = await query(
    'SELECT product_id AS id, name, emoji, price, quantity FROM order_items WHERE order_id = $1 ORDER BY id',
    [req.params.id]
  )

  res.json({
    id: order.id,
    date: order.created_at,
    items: items.map((i) => ({ ...i, price: Number(i.price) })),
    subtotal: Number(order.subtotal),
    shipping: Number(order.shipping),
    tax: Number(order.tax),
    total: Number(order.total),
    shippingInfo: {
      fullName: order.shipping_name,
      address: order.shipping_address,
      city: order.shipping_city,
      zip: order.shipping_zip,
    },
    cardLast4: order.card_last4,
  })
})

export default router
