export default function ShippingStep({ form, errors, onChange, onBack, onContinue }) {
  return (
    <div className="checkout-panel">
      <h2>Shipping details</h2>
      <form
        className="checkout-form"
        onSubmit={(e) => {
          e.preventDefault();
          onContinue();
        }}
        noValidate
      >
        <label>
          Full name
          <input name="name" value={form.name} onChange={onChange} />
          {errors.name && <span className="field-error">{errors.name}</span>}
        </label>
        <label>
          Email
          <input name="email" value={form.email} onChange={onChange} />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </label>
        <label>
          Address
          <input name="address" value={form.address} onChange={onChange} />
          {errors.address && <span className="field-error">{errors.address}</span>}
        </label>
        <div className="form-row">
          <label>
            City
            <input name="city" value={form.city} onChange={onChange} />
            {errors.city && <span className="field-error">{errors.city}</span>}
          </label>
          <label>
            ZIP code
            <input name="zip" value={form.zip} onChange={onChange} />
            {errors.zip && <span className="field-error">{errors.zip}</span>}
          </label>
        </div>

        <div className="checkout-actions">
          <button type="button" className="btn btn--secondary" onClick={onBack}>
            Back
          </button>
          <button type="submit" className="btn btn--primary">
            Continue to payment
          </button>
        </div>
      </form>
    </div>
  );
}
