import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { signOut, useSession } from '../lib/auth-client'

export default function Header() {
  const { cartCount } = useCart()
  const { data: session } = useSession()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <header className="site-header">
      <Link to="/" className="brand">
        <span className="brand-icon">🛍️</span> ShopSimple
      </Link>
      <div className="header-actions">
        {session ? (
          <>
            <span className="header-user">{session.user.name || session.user.email}</span>
            <button className="btn-link-inline" onClick={handleSignOut}>
              Sign Out
            </button>
          </>
        ) : (
          <Link to="/login" className="header-user">
            Sign In
          </Link>
        )}
        <Link to="/cart" className="cart-link">
          🛒 Cart
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </Link>
      </div>
    </header>
  )
}
