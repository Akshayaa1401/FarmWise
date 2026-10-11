import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, User, Mail, Lock, AlertCircle, Sprout } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await register(name, email, password);
      if (res.success) {
        navigate('/login', { replace: true });
      } else {
        setError(res.message || 'Registration failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Check backend connectivity.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '480px', margin: '2.5rem auto 2rem', padding: '0 1rem' }}>
      <div className="card fade-in" style={{ padding: '2.5rem 2rem', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, var(--color-sage-primary), var(--color-forest-mid))',
            color: '#ffffff',
            marginBottom: '1rem',
            boxShadow: '0 4px 12px rgba(82, 183, 138, 0.3)'
          }}>
            <Sprout size={28} />
          </div>
          <h2 style={{ fontSize: '1.75rem', color: 'var(--color-forest-dark)' }}>Farmer Registration</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Create your account to start managing farm data
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
            <label className="form-label" htmlFor="reg-name">
              Full Name
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="reg-name"
                type="text"
                className="form-control"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Rajesh Patel"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <User size={17} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="reg-email"
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
            <label className="form-label" htmlFor="reg-password">
              Password (min. 6 characters)
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="reg-password"
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

          <div className="form-group">
            <label className="form-label" htmlFor="reg-confirm">
              Confirm Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="reg-confirm"
                type="password"
                className="form-control"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
            {submitting ? 'Registering...' : (
              <>
                <UserPlus size={18} />
                Create Account
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
          Already registered?{' '}
          <Link to="/login" style={{ fontWeight: '600', color: 'var(--color-forest-mid)' }}>
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
