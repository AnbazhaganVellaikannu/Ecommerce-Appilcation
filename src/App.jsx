import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Header from './components/Header'
import { CartProvider } from './context/CartContext'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Receipt from './pages/Receipt'
import Signup from './pages/Signup'

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/receipt/:orderId" element={<Receipt />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </main>
      </BrowserRouter>
    </CartProvider>
  )
}

export default App
