export default function ReviewStep({ cartDetails, subtotal, tax, total, onContinue }) {
  return (
    <div className="checkout-panel">
      <h2>Review your order</h2>
      <ul className="review-list">
        {cartDetails.map((item) => (
          <li key={item.id} className="review-item">
            <img src={item.image} alt={item.name} />
            <div className="review-item__info">
              <h3>{item.name}</h3>
              <p>Qty {item.qty}</p>
            </div>
            <span className="review-item__price">
              ${(item.price * item.qty).toFixed(2)}
            </span>
          </li>
        ))}
      </ul>

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

      <button className="btn btn--primary btn--full" onClick={onContinue}>
        Continue to shipping
      </button>
    </div>
  );
}
