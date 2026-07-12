import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

export default function Receipt() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);

    fetch(`/api/orders/${orderId}`)
      .then(async (res) => {
        if (cancelled) return;
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        if (!res.ok) throw new Error('Failed to load order');
        setOrder(await res.json());
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  if (loading) {
    return (
      <div className="page">
        <p className="empty-state">Loading your receipt…</p>
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="page">
        <h1>Order not found</h1>
        <p>
          <Link to="/">Return to shop</Link>
        </p>
      </div>
    );
  }

  const orderDate = new Date(order.createdAt);

  return (
    <div className="page">
      <div className="confirmation no-print">
        <div className="confirmation__icon">✓</div>
        <h1>Thank you, {order.shipping.name.split(' ')[0]}!</h1>
        <p>Your payment was successful and your order is confirmed.</p>
      </div>

      <div className="receipt" id="receipt">
        <div className="receipt__header">
          <div>
            <span className="receipt__brand">Grocery Department Store</span>
            <p className="receipt__tagline">Fresh groceries, everyday essentials.</p>
          </div>
          <div className="receipt__meta">
            <p>
              <strong>Order ID:</strong> {order.id}
            </p>
            <p>
              <strong>Date:</strong> {orderDate.toLocaleDateString()}{' '}
              {orderDate.toLocaleTimeString()}
            </p>
          </div>
        </div>

        <div className="receipt__section">
          <h3>Items</h3>
          <table className="receipt__table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.qty}</td>
                  <td>${item.price.toFixed(2)}</td>
                  <td>${(item.price * item.qty).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="receipt__totals">
          <div className="cart-summary__row">
            <span>Subtotal</span>
            <span>${order.subtotal.toFixed(2)}</span>
          </div>
          <div className="cart-summary__row">
            <span>Tax</span>
            <span>${order.tax.toFixed(2)}</span>
          </div>
          <div className="cart-summary__row cart-summary__row--total">
            <span>Total paid</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
        </div>

        <div className="receipt__grid">
          <div className="receipt__section">
            <h3>Payment method</h3>
            <p>Card ending in {order.payment.last4}</p>
            <p>{order.payment.cardName}</p>
          </div>
          <div className="receipt__section">
            <h3>Shipping to</h3>
            <p>{order.shipping.name}</p>
            <p>{order.shipping.address}</p>
            <p>
              {order.shipping.city}, {order.shipping.zip}
            </p>
          </div>
        </div>

        <p className="receipt__footer">
          Thank you for shopping with Grocery Department Store!
        </p>
      </div>

      <div className="confirmation-actions no-print">
        <button className="btn btn--secondary" onClick={() => window.print()}>
          Print receipt
        </button>
        <Link to="/" className="btn btn--primary">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
