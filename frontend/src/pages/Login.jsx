import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Lock, Mail, AlertCircle, Sprout } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.message || 'Invalid email or password.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please verify backend is running on port 8080.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '440px', margin: '3rem auto 2rem', padding: '0 1rem' }}>
      <div className="card fade-in" style={{ padding: '2.5rem 2rem', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, var(--color-forest-mid), var(--color-forest-dark))',
            color: '#ffffff',
            marginBottom: '1rem',
            boxShadow: '0 4px 12px rgba(27, 67, 50, 0.25)'
          }}>
            <Sprout size={28} />
          </div>
          <h2 style={{ fontSize: '1.75rem', color: 'var(--color-forest-dark)' }}>Farmer Sign In</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Access your farm profile & decision tools
          </p>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ fontSize: '0.875rem' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-email"
                type="email"
                className="form-control"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="farmer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Mail size={17} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type="password"
                className="form-control"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Lock size={17} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem', padding: '0.85rem' }}
            disabled={submitting}
          >
            {submitting ? 'Signing In...' : (
              <>
                <LogIn size={18} />
                Sign In
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
          New to FarmWise?{' '}
          <Link to="/register" style={{ fontWeight: '600', color: 'var(--color-forest-mid)' }}>
            Register as a new Farmer
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
