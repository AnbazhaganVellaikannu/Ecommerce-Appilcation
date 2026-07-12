import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useSession, signOut } from '../lib/authClient';

export default function Header() {
  const { itemCount } = useCart();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const closeMenu = () => setMenuOpen(false);

  const handleSignOut = async () => {
    closeMenu();
    await signOut();
    navigate('/');
  };

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link to="/" className="brand" onClick={closeMenu}>
          <span className="brand__mark">*</span>
          Grocery Department Store
        </Link>

        <button
          className="nav-toggle"
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`main-nav ${menuOpen ? 'main-nav--open' : ''}`}>
          <NavLink to="/" end onClick={closeMenu}>
            Shop
          </NavLink>
          <NavLink to="/orders" onClick={closeMenu}>
            Orders
          </NavLink>
          <NavLink to="/cart" className="cart-link" onClick={closeMenu}>
            Cart
            {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
          </NavLink>
          {session ? (
            <>
              <span className="nav-user">Hi, {session.user.name.split(' ')[0]}</span>
              <button className="btn btn--text nav-signout" onClick={handleSignOut}>
                Sign out
              </button>
            </>
          ) : (
            <NavLink to="/login" onClick={closeMenu}>
              Sign in
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}
