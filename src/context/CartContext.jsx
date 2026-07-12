import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const TAX_RATE = 0.07;

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useLocalStorage('ecom_cart', []);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(null);

  const fetchProducts = useCallback(async () => {
    setProductsLoading(true);
    setProductsError(null);

    const maxAttempts = 4;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error('Failed to load products');
        setProducts(await res.json());
        setProductsLoading(false);
        return;
      } catch (err) {
        if (attempt === maxAttempts) {
          setProductsError(err.message);
          setProductsLoading(false);
          return;
        }
        // The API server (Express/Neon) can take a moment to finish booting
        // after the dev server starts — back off and retry before giving up.
        await new Promise((resolve) => setTimeout(resolve, attempt * 700));
      }
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const qtyInCart = (productId) =>
    items.find((i) => i.productId === productId)?.qty ?? 0;

  const getAvailableStock = (productId) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return 0;
    return Math.max(product.stock - qtyInCart(productId), 0);
  };

  const addToCart = (productId, qty = 1) => {
    const available = getAvailableStock(productId);
    if (available <= 0) return false;
    const addQty = Math.min(qty, available);

    setItems((prev) => {
      const existing = prev.find((i) => i.productId === productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === productId ? { ...i, qty: i.qty + addQty } : i
        );
      }
      return [...prev, { productId, qty: addQty }];
    });
    return true;
  };

  const updateQty = (productId, qty) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    const product = products.find((p) => p.id === productId);
    const clamped = Math.min(qty, product?.stock ?? 0);
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, qty: clamped } : i))
    );
  };

  const removeFromCart = (productId) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const clearCart = () => setItems([]);

  const cartDetails = useMemo(() => {
    return items
      .map((i) => {
        const product = products.find((p) => p.id === i.productId);
        if (!product) return null;
        return {
          ...product,
          qty: i.qty,
          availableStock: Math.max(product.stock - i.qty, 0),
        };
      })
      .filter(Boolean);
  }, [items, products]);

  const subtotal = useMemo(
    () => cartDetails.reduce((sum, item) => sum + item.price * item.qty, 0),
    [cartDetails]
  );

  const tax = useMemo(() => subtotal * TAX_RATE, [subtotal]);
  const total = subtotal + tax;

  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.qty, 0),
    [items]
  );

  const completeOrder = async ({ shipping, payment }) => {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: items.map((i) => ({ productId: i.productId, qty: i.qty })),
        shipping,
        payment,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      const error = new Error(data.error || 'Failed to place order');
      error.status = res.status;
      error.shortfalls = data.shortfalls;
      throw error;
    }

    clearCart();
    fetchProducts();
    return data;
  };

  const value = {
    items,
    products,
    productsLoading,
    productsError,
    refetchProducts: fetchProducts,
    cartDetails,
    subtotal,
    tax,
    total,
    itemCount,
    addToCart,
    updateQty,
    removeFromCart,
    clearCart,
    getAvailableStock,
    completeOrder,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
