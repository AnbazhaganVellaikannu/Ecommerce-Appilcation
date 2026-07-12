export default function PaymentStep({
  form,
  errors,
  onChange,
  onBack,
  onSubmit,
  isProcessing,
  submitError,
  total,
}) {
  return (
    <div className="checkout-panel">
      <h2>Payment</h2>
      <p className="mock-note">
        This is a demo checkout — no real payment is processed and no card
        details are transmitted or stored.
      </p>
      <form
        className="checkout-form"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        noValidate
      >
        <label>
          Name on card
          <input name="cardName" value={form.cardName} onChange={onChange} />
          {errors.cardName && <span className="field-error">{errors.cardName}</span>}
        </label>
        <label>
          Card number
          <input
            name="cardNumber"
            placeholder="4242 4242 4242 4242"
            value={form.cardNumber}
            onChange={onChange}
            inputMode="numeric"
          />
          {errors.cardNumber && (
            <span className="field-error">{errors.cardNumber}</span>
          )}
        </label>
        <div className="form-row">
          <label>
            Expiry (MM/YY)
            <input
              name="expiry"
              placeholder="12/28"
              value={form.expiry}
              onChange={onChange}
            />
            {errors.expiry && <span className="field-error">{errors.expiry}</span>}
          </label>
          <label>
            CVC
            <input
              name="cvc"
              placeholder="123"
              value={form.cvc}
              onChange={onChange}
              inputMode="numeric"
            />
            {errors.cvc && <span className="field-error">{errors.cvc}</span>}
          </label>
        </div>

        <div className="checkout-actions">
          <button
            type="button"
            className="btn btn--secondary"
            onClick={onBack}
            disabled={isProcessing}
          >
            Back
          </button>
          <button type="submit" className="btn btn--primary" disabled={isProcessing}>
            {isProcessing ? (
              <>
                <span className="spinner" aria-hidden="true" /> Processing…
              </>
            ) : (
              `Pay $${total.toFixed(2)}`
            )}
          </button>
        </div>

        {submitError && <p className="field-error">{submitError}</p>}
      </form>
    </div>
  );
}
