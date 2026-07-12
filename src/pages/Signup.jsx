import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { signUp } from '../lib/authClient';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setIsSubmitting(true);
    const { error: signUpError } = await signUp.email({ name, email, password });

    setIsSubmitting(false);
    if (signUpError) {
      setError(signUpError.message || 'Could not create your account.');
      return;
    }

    navigate(searchParams.get('redirect') || '/');
  };

  return (
    <div className="page">
      <div className="checkout-panel auth-panel">
        <h1>Create an account</h1>
        <form className="checkout-form" onSubmit={handleSubmit} noValidate>
          <label>
            Full name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </label>

          {error && <p className="field-error">{error}</p>}

          <button type="submit" className="btn btn--primary btn--full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="spinner" aria-hidden="true" /> Creating account…
              </>
            ) : (
              'Create account'
            )}
          </button>
        </form>
        <p className="auth-panel__switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
