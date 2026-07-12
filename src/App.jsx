import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import RequireAuth from './components/RequireAuth';
import Home from './pages/Home';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Receipt from './pages/Receipt';
import Orders from './pages/Orders';
import Login from './pages/Login';
import Signup from './pages/Signup';

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/checkout"
            element={
              <RequireAuth>
                <Checkout />
              </RequireAuth>
            }
          />
          <Route path="/receipt/:orderId" element={<Receipt />} />
          <Route
            path="/orders"
            element={
              <RequireAuth>
                <Orders />
              </RequireAuth>
            }
          />
        </Routes>
      </main>
    </>
  );
}
