import { useState } from 'react';
import { useCart } from '../context/CartContext';

const LOW_STOCK_THRESHOLD = 5;

export default function ProductCard({ product }) {
  const { addToCart, getAvailableStock } = useCart();
  const [added, setAdded] = useState(false);
  const available = getAvailableStock(product.id);

  const handleAdd = () => {
    const didAdd = addToCart(product.id, 1);
    if (!didAdd) return;
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="product-card">
      <div className="product-card__media">
        <img src={product.image} alt={product.name} loading="lazy" />
        {available === 0 && (
          <span className="badge badge--out">Out of stock</span>
        )}
        {available > 0 && available <= LOW_STOCK_THRESHOLD && (
          <span className="badge badge--low">Only {available} left</span>
        )}
      </div>
      <div className="product-card__body">
        <span className="product-card__category">{product.category}</span>
        <h3>{product.name}</h3>
        <p className="product-card__description">{product.description}</p>
        <div className="product-card__footer">
          <span className="product-card__price">${product.price.toFixed(2)}</span>
          <button
            className="btn btn--primary"
            onClick={handleAdd}
            disabled={available === 0}
          >
            {available === 0 ? 'Out of stock' : added ? 'Added ✓' : 'Add to cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
