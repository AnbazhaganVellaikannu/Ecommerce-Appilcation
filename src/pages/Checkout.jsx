import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useSession } from '../lib/auth-client'

const initialShipping = { fullName: '', address: '', city: '', zip: '' }
const initialPayment = { cardName: '', cardNumber: '', expiry: '', cvv: '' }

function formatCardNumber(value) {
  return value
    .replace(/[^0-9]/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim()
}

function formatExpiry(value) {
  const digits = value.replace(/[^0-9]/g, '').slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

export default function Checkout() {
  const { cartItems, subtotal, shipping, tax, total, completeOrder } = useCart()
  const { data: session, isPending: sessionPending } = useSession()
  const navigate = useNavigate()

  const [shippingInfo, setShippingInfo] = useState(initialShipping)
  const [paymentInfo, setPaymentInfo] = useState(initialPayment)
  const [errors, setErrors] = useState({})
  const [processing, setProcessing] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  if (sessionPending) {
    return (
      <div className="page">
        <p>Loading…</p>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: '/checkout' }} />
  }

  if (cartItems.length === 0 && !processing) {
    return <Navigate to="/cart" replace />
  }

  const updateShipping = (field) => (e) =>
    setShippingInfo((s) => ({ ...s, [field]: e.target.value }))

  const updatePayment = (field, formatter) => (e) => {
    const raw = e.target.value
    setPaymentInfo((p) => ({ ...p, [field]: formatter ? formatter(raw) : raw }))
  }

  const validate = () => {
    const nextErrors = {}
    if (!shippingInfo.fullName.trim()) nextErrors.fullName = 'Required'
    if (!shippingInfo.address.trim()) nextErrors.address = 'Required'
    if (!shippingInfo.city.trim()) nextErrors.city = 'Required'
    if (!/^\d{5}(-\d{4})?$/.test(shippingInfo.zip.trim())) nextErrors.zip = 'Invalid ZIP code'

    if (!paymentInfo.cardName.trim()) nextErrors.cardName = 'Required'
    if (paymentInfo.cardNumber.replace(/\s/g, '').length !== 16)
      nextErrors.cardNumber = 'Enter a 16-digit card number'
    if (!/^\d{2}\/\d{2}$/.test(paymentInfo.expiry)) nextErrors.expiry = 'Use MM/YY format'
    if (!/^\d{3,4}$/.test(paymentInfo.cvv)) nextErrors.cvv = 'Invalid CVV'

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setProcessing(true)
    setSubmitError(null)
    try {
      const order = await completeOrder({ paymentInfo, shippingInfo })
      navigate(`/receipt/${order.id}`, { replace: true })
    } catch (err) {
      setSubmitError(err.message)
      setProcessing(false)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Checkout</h1>
      </div>

      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <section>
            <h2>🚚 Shipping Information</h2>
            <div className="form-field">
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                value={shippingInfo.fullName}
                onChange={updateShipping('fullName')}
                placeholder="Jane Doe"
              />
              {errors.fullName && <span className="field-error">{errors.fullName}</span>}
            </div>
            <div className="form-field">
              <label htmlFor="address">Address</label>
              <input
                id="address"
                value={shippingInfo.address}
                onChange={updateShipping('address')}
                placeholder="123 Main St"
              />
              {errors.address && <span className="field-error">{errors.address}</span>}
            </div>
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="city">City</label>
                <input id="city" value={shippingInfo.city} onChange={updateShipping('city')} placeholder="Springfield" />
                {errors.city && <span className="field-error">{errors.city}</span>}
              </div>
              <div className="form-field">
                <label htmlFor="zip">ZIP Code</label>
                <input id="zip" value={shippingInfo.zip} onChange={updateShipping('zip')} placeholder="12345" />
                {errors.zip && <span className="field-error">{errors.zip}</span>}
              </div>
            </div>
          </section>

          <section>
            <h2>💳 Payment Details</h2>
            <p className="dummy-note">This is a mock payment form — no real card is charged.</p>
            <div className="form-field">
              <label htmlFor="cardName">Name on Card</label>
              <input
                id="cardName"
                value={paymentInfo.cardName}
                onChange={updatePayment('cardName')}
                placeholder="Jane Doe"
              />
              {errors.cardName && <span className="field-error">{errors.cardName}</span>}
            </div>
            <div className="form-field">
              <label htmlFor="cardNumber">Card Number</label>
              <input
                id="cardNumber"
                value={paymentInfo.cardNumber}
                onChange={updatePayment('cardNumber', formatCardNumber)}
                placeholder="4242 4242 4242 4242"
                inputMode="numeric"
              />
              {errors.cardNumber && <span className="field-error">{errors.cardNumber}</span>}
            </div>
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="expiry">Expiry (MM/YY)</label>
                <input
                  id="expiry"
                  value={paymentInfo.expiry}
                  onChange={updatePayment('expiry', formatExpiry)}
                  placeholder="12/28"
                  inputMode="numeric"
                />
                {errors.expiry && <span className="field-error">{errors.expiry}</span>}
              </div>
              <div className="form-field">
                <label htmlFor="cvv">CVV</label>
                <input
                  id="cvv"
                  value={paymentInfo.cvv}
                  onChange={updatePayment('cvv', (v) => v.replace(/[^0-9]/g, '').slice(0, 4))}
                  placeholder="123"
                  inputMode="numeric"
                />
                {errors.cvv && <span className="field-error">{errors.cvv}</span>}
              </div>
            </div>
          </section>

          {submitError && <p className="field-error">{submitError}</p>}
          <button className="btn btn-primary btn-block" type="submit" disabled={processing}>
            {processing ? 'Processing Payment…' : `Pay $${total.toFixed(2)}`}
          </button>
        </form>

        <div className="cart-summary">
          <h2>Order Summary</h2>
          {cartItems.map(({ product, quantity }) => (
            <div className="summary-row" key={product.id}>
              <span>
                {product.emoji} {product.name} × {quantity}
              </span>
              <span>${(product.price * quantity).toFixed(2)}</span>
            </div>
          ))}
          <hr />
          <div className="summary-row">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
          </div>
          <div className="summary-row">
            <span>Tax</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="summary-row summary-total">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
