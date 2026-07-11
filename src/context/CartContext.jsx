import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { loadJSON, saveJSON } from '../utils/storage'

const CART_KEY = 'ecom_cart_v1'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => loadJSON(CART_KEY, {}))
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products')
      if (!res.ok) throw new Error('Failed to load products')
      setProducts(await res.json())
      setLoadError(null)
    } catch (err) {
      setLoadError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    saveJSON(CART_KEY, cart)
  }, [cart])

  const getStock = (id) => products.find((p) => p.id === id)?.stock ?? 0
  const getAvailable = (id) => getStock(id) - (cart[id] || 0)

  const addToCart = (id) => {
    if (getAvailable(id) <= 0) return
    setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }))
  }

  const incrementQty = (id) => addToCart(id)

  const decrementQty = (id) => {
    setCart((c) => {
      const nextQty = (c[id] || 0) - 1
      if (nextQty <= 0) {
        const { [id]: _removed, ...rest } = c
        return rest
      }
      return { ...c, [id]: nextQty }
    })
  }

  const removeFromCart = (id) => {
    setCart((c) => {
      const { [id]: _removed, ...rest } = c
      return rest
    })
  }

  const clearCart = () => setCart({})

  const cartItems = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, quantity]) => {
          const product = products.find((p) => p.id === id)
          return product ? { product, quantity } : null
        })
        .filter(Boolean),
    [cart, products]
  )

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = cartItems.reduce((sum, i) => sum + i.quantity * i.product.price, 0)
  const shipping = cartItems.length === 0 || subtotal >= 50 ? 0 : 4.99
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  const completeOrder = async ({ paymentInfo, shippingInfo }) => {
    if (cartItems.length === 0) return null

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cartItems.map(({ product, quantity }) => ({ productId: product.id, quantity })),
        shippingInfo,
        paymentInfo,
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.error || 'Failed to place order.')
    }

    clearCart()
    await fetchProducts()
    return data
  }

  const value = {
    products,
    loading,
    loadError,
    cart,
    cartItems,
    cartCount,
    subtotal,
    shipping,
    tax,
    total,
    getStock,
    getAvailable,
    addToCart,
    incrementQty,
    decrementQty,
    removeFromCart,
    clearCart,
    completeOrder,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}

export async function getOrder(orderId) {
  const res = await fetch(`/api/orders/${orderId}`)
  if (!res.ok) return null
  return res.json()
}
