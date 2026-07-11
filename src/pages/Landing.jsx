import { useCart } from '../context/CartContext'

function ProductCard({ product }) {
  const { cart, getAvailable, addToCart, incrementQty, decrementQty } = useCart()
  const qtyInCart = cart[product.id] || 0
  const available = getAvailable(product.id)
  const outOfStock = available <= 0 && qtyInCart === 0

  return (
    <div className={`product-card${outOfStock ? ' out-of-stock' : ''}`}>
      <div className="product-image">{product.emoji}</div>
      <div className="product-info">
        <span className="product-category">{product.category}</span>
        <h3>{product.name}</h3>
        <p className="product-description">{product.description}</p>
        <div className="product-price">${product.price.toFixed(2)}</div>
        <div className="product-stock">
          {outOfStock ? 'Out of stock' : `${available} in stock`}
        </div>
      </div>
      <div className="product-actions">
        {qtyInCart === 0 ? (
          <button
            className="btn btn-primary"
            onClick={() => addToCart(product.id)}
            disabled={outOfStock}
          >
            Add to Cart
          </button>
        ) : (
          <div className="stepper">
            <button
              className="stepper-btn"
              onClick={() => decrementQty(product.id)}
              aria-label={`Decrease quantity of ${product.name}`}
            >
              −
            </button>
            <span className="stepper-qty">{qtyInCart}</span>
            <button
              className="stepper-btn"
              onClick={() => incrementQty(product.id)}
              disabled={available <= 0}
              aria-label={`Increase quantity of ${product.name}`}
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Landing() {
  const { products, loading, loadError } = useCart()

  return (
    <div className="page">
      <div className="page-header">
        <h1>Shop Inventory</h1>
        <p>Browse items and add them to your cart.</p>
      </div>
      {loading && <p>Loading products…</p>}
      {loadError && <p className="field-error">Couldn't load products: {loadError}</p>}
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
