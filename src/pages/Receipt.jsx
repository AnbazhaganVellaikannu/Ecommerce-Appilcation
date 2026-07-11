import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getOrder } from '../context/CartContext'

export default function Receipt() {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getOrder(orderId).then((data) => {
      if (!cancelled) {
        setOrder(data)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [orderId])

  if (loading) {
    return (
      <div className="page">
        <p>Loading receipt…</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="page">
        <div className="empty-state">
          <p className="empty-emoji">🧾</p>
          <h2>Receipt not found</h2>
          <p>We couldn't find an order with that ID.</p>
          <Link className="btn btn-primary" to="/">
            Back to Shop
          </Link>
        </div>
      </div>
    )
  }

  const orderDate = new Date(order.date)

  return (
    <div className="page">
      <div className="receipt">
        <div className="receipt-header">
          <p className="receipt-check">✅</p>
          <h1>Payment Successful</h1>
          <p>Thanks for your order! Here's your receipt.</p>
        </div>

        <div className="receipt-meta">
          <div>
            <span className="receipt-label">Order ID</span>
            <span>{order.id}</span>
          </div>
          <div>
            <span className="receipt-label">Date</span>
            <span>{orderDate.toLocaleString()}</span>
          </div>
          <div>
            <span className="receipt-label">Card</span>
            <span>•••• {order.cardLast4}</span>
          </div>
        </div>

        {order.shippingInfo && (
          <div className="receipt-shipping">
            <span className="receipt-label">Shipping to</span>
            <p>
              {order.shippingInfo.fullName}
              <br />
              {order.shippingInfo.address}, {order.shippingInfo.city} {order.shippingInfo.zip}
            </p>
          </div>
        )}

        <div className="receipt-items">
          {order.items.map((item) => (
            <div className="summary-row" key={item.id}>
              <span>
                {item.emoji} {item.name} × {item.quantity}
              </span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <hr />

        <div className="summary-row">
          <span>Subtotal</span>
          <span>${order.subtotal.toFixed(2)}</span>
        </div>
        <div className="summary-row">
          <span>Shipping</span>
          <span>{order.shipping === 0 ? 'Free' : `$${order.shipping.toFixed(2)}`}</span>
        </div>
        <div className="summary-row">
          <span>Tax</span>
          <span>${order.tax.toFixed(2)}</span>
        </div>
        <div className="summary-row summary-total">
          <span>Total Paid</span>
          <span>${order.total.toFixed(2)}</span>
        </div>

        <Link className="btn btn-primary btn-block" to="/">
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}
