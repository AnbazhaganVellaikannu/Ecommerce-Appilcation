import { useMemo, useState } from 'react';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const { products, productsLoading, productsError, refetchProducts } = useCart();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const categories = useMemo(
    () => ['All', ...new Set(products.map((p) => p.category))],
    [products]
  );

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = category === 'All' || p.category === category;
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, search, category]);

  return (
    <div className="page">
      <div className="page__hero">
        <h1>Shop our inventory</h1>
        <p>Browse products, add them to your cart, and check out — all in one place.</p>
      </div>

      <div className="toolbar">
        <input
          type="search"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <div className="category-filters">
          {categories.map((c) => (
            <button
              key={c}
              className={`chip ${category === c ? 'chip--active' : ''}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {productsLoading ? (
        <p className="empty-state">Loading products…</p>
      ) : productsError ? (
        <div className="empty-state">
          <p>Couldn't load products: {productsError}</p>
          <button className="btn btn--secondary" onClick={refetchProducts}>
            Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <p className="empty-state">No products match your search.</p>
      ) : (
        <div className="product-grid">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
