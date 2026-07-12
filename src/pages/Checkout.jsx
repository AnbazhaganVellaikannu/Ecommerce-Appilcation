import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useSession } from '../lib/authClient';
import Stepper from '../components/Stepper';
import ReviewStep from '../components/checkout/ReviewStep';
import ShippingStep from '../components/checkout/ShippingStep';
import PaymentStep from '../components/checkout/PaymentStep';

const STEPS = ['Review', 'Shipping', 'Payment'];

const initialShipping = { name: '', email: '', address: '', city: '', zip: '' };
const initialPayment = { cardName: '', cardNumber: '', expiry: '', cvc: '' };

function validateShipping(form) {
  const errs = {};
  if (!form.name.trim()) errs.name = 'Name is required';
  if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Valid email is required';
  if (!form.address.trim()) errs.address = 'Address is required';
  if (!form.city.trim()) errs.city = 'City is required';
  if (!/^\d{5}(-\d{4})?$/.test(form.zip)) errs.zip = 'Valid ZIP code is required';
  return errs;
}

function validatePayment(form) {
  const errs = {};
  if (!form.cardName.trim()) errs.cardName = 'Name on card is required';
  if (!/^\d{13,19}$/.test(form.cardNumber.replace(/\s/g, '')))
    errs.cardNumber = 'Valid card number is required';
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(form.expiry.trim()))
    errs.expiry = 'Use MM/YY format';
  if (!/^\d{3,4}$/.test(form.cvc.trim())) errs.cvc = 'Valid CVC is required';
  return errs;
}

export default function Checkout() {
  const { cartDetails, subtotal, tax, total, completeOrder } = useCart();
  const { data: session } = useSession();
  const [step, setStep] = useState(1);
  const [shippingForm, setShippingForm] = useState(initialShipping);
  const [shippingErrors, setShippingErrors] = useState({});
  const [paymentForm, setPaymentForm] = useState(initialPayment);
  const [paymentErrors, setPaymentErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!session) return;
    setShippingForm((prev) => ({
      ...prev,
      name: prev.name || session.user.name || '',
      email: prev.email || session.user.email || '',
    }));
  }, [session]);

  if (cartDetails.length === 0 && !isProcessing) {
    return (
      <div className="page">
        <h1>Checkout</h1>
        <p className="empty-state">
          Your cart is empty. <Link to="/">Continue shopping</Link>.
        </p>
      </div>
    );
  }

  const handleShippingChange = (e) => {
    setShippingForm({ ...shippingForm, [e.target.name]: e.target.value });
  };

  const handlePaymentChange = (e) => {
    setPaymentForm({ ...paymentForm, [e.target.name]: e.target.value });
  };

  const handleShippingContinue = () => {
    const errs = validateShipping(shippingForm);
    setShippingErrors(errs);
    if (Object.keys(errs).length === 0) setStep(3);
  };

  const handlePay = async () => {
    const errs = validatePayment(paymentForm);
    setPaymentErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitError(null);
    setIsProcessing(true);
    try {
      const order = await completeOrder({
        shipping: { ...shippingForm },
        payment: {
          method: 'card',
          cardName: paymentForm.cardName,
          last4: paymentForm.cardNumber.replace(/\s/g, '').slice(-4),
        },
      });
      navigate(`/receipt/${order.id}`);
    } catch (err) {
      if (err.status === 401) {
        navigate('/login?redirect=%2Fcheckout');
        return;
      }
      if (err.status === 409 && err.shortfalls) {
        const details = err.shortfalls
          .map((s) => `${s.productId} (only ${s.available} left)`)
          .join(', ');
        setSubmitError(`Some items sold out while you were checking out: ${details}.`);
      } else {
        setSubmitError(err.message || 'Something went wrong placing your order.');
      }
      setIsProcessing(false);
    }
  };

  return (
    <div className="page">
      <h1>Checkout</h1>
      <Stepper steps={STEPS} currentStep={step} />

      <div className="checkout-layout">
        {step === 1 && (
          <ReviewStep
            cartDetails={cartDetails}
            subtotal={subtotal}
            tax={tax}
            total={total}
            onContinue={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <ShippingStep
            form={shippingForm}
            errors={shippingErrors}
            onChange={handleShippingChange}
            onBack={() => setStep(1)}
            onContinue={handleShippingContinue}
          />
        )}
        {step === 3 && (
          <PaymentStep
            form={paymentForm}
            errors={paymentErrors}
            onChange={handlePaymentChange}
            onBack={() => setStep(2)}
            onSubmit={handlePay}
            isProcessing={isProcessing}
            submitError={submitError}
            total={total}
          />
        )}

        <div className="cart-summary">
          <h2>Order summary</h2>
          <ul className="summary-items">
            {cartDetails.map((item) => (
              <li key={item.id}>
                <span>
                  {item.name} × {item.qty}
                </span>
                <span>${(item.price * item.qty).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="cart-summary__row">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="cart-summary__row">
            <span>Estimated tax</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="cart-summary__row cart-summary__row--total">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
