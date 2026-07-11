import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function Cart() {
  const { cartItems, subtotal, shipping, tax, total, getAvailable, incrementQty, decrementQty, removeFromCart } =
    useCart()
  const navigate = useNavigate()

  if (cartItems.length === 0) {
    return (
      <div className="page">
        <div className="empty-state">
          <p className="empty-emoji">🛒</p>
          <h2>Your cart is empty</h2>
          <p>Add some items from the shop to get started.</p>
          <Link className="btn btn-primary" to="/">
            Browse Products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Your Cart</h1>
      </div>

      <div className="cart-layout">
        <div className="cart-list">
          {cartItems.map(({ product, quantity }) => (
            <div className="cart-row" key={product.id}>
              <div className="cart-row-image">{product.emoji}</div>
              <div className="cart-row-info">
                <h3>{product.name}</h3>
                <div className="cart-row-price">${product.price.toFixed(2)} each</div>
              </div>
              <div className="stepper">
                <button
                  className="stepper-btn"
                  onClick={() => decrementQty(product.id)}
                  aria-label={`Decrease quantity of ${product.name}`}
                >
                  −
                </button>
                <span className="stepper-qty">{quantity}</span>
                <button
                  className="stepper-btn"
                  onClick={() => incrementQty(product.id)}
                  disabled={getAvailable(product.id) <= 0}
                  aria-label={`Increase quantity of ${product.name}`}
                >
                  +
                </button>
              </div>
              <div className="cart-row-total">${(product.price * quantity).toFixed(2)}</div>
              <button
                className="btn-remove"
                onClick={() => removeFromCart(product.id)}
                aria-label={`Remove ${product.name} from cart`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
          </div>
          <div className="summary-row">
            <span>Tax</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="summary-row summary-total">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <button className="btn btn-primary btn-block" onClick={() => navigate('/checkout')}>
            Proceed to Checkout
          </button>
          <Link className="btn-link" to="/">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
