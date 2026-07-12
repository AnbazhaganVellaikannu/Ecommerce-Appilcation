import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { cartDetails, subtotal, tax, total, updateQty, removeFromCart, clearCart } =
    useCart();
  const navigate = useNavigate();

  if (cartDetails.length === 0) {
    return (
      <div className="page">
        <h1>Your cart</h1>
        <p className="empty-state">
          Your cart is empty. <Link to="/">Continue shopping</Link>.
        </p>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Your cart</h1>
      <div className="cart-layout">
        <ul className="cart-list">
          {cartDetails.map((item) => (
            <li key={item.id} className="cart-item">
              <img src={item.image} alt={item.name} />
              <div className="cart-item__info">
                <h3>{item.name}</h3>
                <p className="cart-item__price">${item.price.toFixed(2)} each</p>
                {item.availableStock === 0 && (
                  <p className="cart-item__stock-hint">Max available quantity reached</p>
                )}
              </div>
              <div className="cart-item__qty">
                <button
                  onClick={() => updateQty(item.id, item.qty - 1)}
                  aria-label={`Decrease quantity of ${item.name}`}
                >
                  -
                </button>
                <input
                  type="number"
                  min="0"
                  value={item.qty}
                  onChange={(e) => updateQty(item.id, Number(e.target.value))}
                  aria-label={`Quantity of ${item.name}`}
                />
                <button
                  onClick={() => updateQty(item.id, item.qty + 1)}
                  disabled={item.availableStock === 0}
                  aria-label={`Increase quantity of ${item.name}`}
                >
                  +
                </button>
              </div>
              <div className="cart-item__total">
                ${(item.price * item.qty).toFixed(2)}
              </div>
              <button
                className="btn btn--text"
                onClick={() => removeFromCart(item.id)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>

        <div className="cart-summary">
          <h2>Order summary</h2>
          <div className="cart-summary__row">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="cart-summary__row">
            <span>Estimated tax</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="cart-summary__row cart-summary__row--total">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <button
            className="btn btn--primary btn--full"
            onClick={() => navigate('/checkout')}
          >
            Proceed to checkout
          </button>
          <button className="btn btn--text btn--full" onClick={clearCart}>
            Clear cart
          </button>
        </div>
      </div>
    </div>
  );
}
