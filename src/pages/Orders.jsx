import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch('/api/orders')
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load orders');
        const data = await res.json();
        if (!cancelled) setOrders(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="page">
        <h1>Your orders</h1>
        <p className="empty-state">Loading your orders…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <h1>Your orders</h1>
        <p className="empty-state">Couldn't load orders: {error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="page">
        <h1>Your orders</h1>
        <p className="empty-state">
          You haven't placed any orders yet. <Link to="/">Start shopping</Link>.
        </p>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Your orders</h1>
      <ul className="order-list">
        {orders.map((order) => (
          <li key={order.id} className="order-card">
            <div className="order-card__header">
              <div>
                <strong>{order.id}</strong>
                <span className="order-card__date">
                  {new Date(order.createdAt).toLocaleString()}
                </span>
              </div>
              <span className="order-card__total">${order.total.toFixed(2)}</span>
            </div>
            <ul className="summary-items">
              {order.items.map((item) => (
                <li key={item.id}>
                  <span>
                    {item.name} × {item.qty}
                  </span>
                  <span>${(item.price * item.qty).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
