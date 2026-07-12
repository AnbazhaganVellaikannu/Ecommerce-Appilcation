import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { signIn } from '../lib/authClient';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const { error: signInError } = await signIn.email({ email, password });

    setIsSubmitting(false);
    if (signInError) {
      setError(signInError.message || 'Invalid email or password.');
      return;
    }

    navigate(searchParams.get('redirect') || '/');
  };

  return (
    <div className="page">
      <div className="checkout-panel auth-panel">
        <h1>Sign in</h1>
        <form className="checkout-form" onSubmit={handleSubmit} noValidate>
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
            />
          </label>

          {error && <p className="field-error">{error}</p>}

          <button type="submit" className="btn btn--primary btn--full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="spinner" aria-hidden="true" /> Signing in…
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>
        <p className="auth-panel__switch">
          Don't have an account? <Link to="/signup">Create one</Link>
        </p>
      </div>
    </div>
  );
}
