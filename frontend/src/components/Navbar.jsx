import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sprout, LayoutDashboard, UserCheck, Sparkles, Scale, History, Store, Package, LogOut, BookOpen } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="glass-header sticky-top" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
      <div className="navbar-inner" style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0.85rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}>
          <div style={{
            background: 'linear-gradient(135deg, #52b788, #2d6a4f)',
            color: '#ffffff',
            padding: '0.45rem',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(82, 183, 138, 0.4)'
          }}>
            <Sprout size={22} />
          </div>
          <div>
            <span style={{
              fontSize: '1.4rem',
              fontWeight: '800',
              fontFamily: 'var(--font-family-heading)',
              color: '#ffffff',
              letterSpacing: '-0.5px'
            }}>
              FarmWise
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        {isAuthenticated ? (
          <div className="navbar-links" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
            <Link
              to="/dashboard"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: isActive('/dashboard') ? '#74c69d' : '#e2e8f0',
                fontWeight: isActive('/dashboard') ? '700' : '500',
                fontSize: '0.95rem',
                padding: '0.4rem 0.75rem',
                borderRadius: '8px',
                backgroundColor: isActive('/dashboard') ? 'rgba(255,255,255,0.1)' : 'transparent',
                transition: 'all 0.2s'
              }}
            >
              <LayoutDashboard size={17} />
              Dashboard
            </Link>

            <Link
              to="/profile"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: isActive('/profile') ? '#74c69d' : '#e2e8f0',
                fontWeight: isActive('/profile') ? '700' : '500',
                fontSize: '0.95rem',
                padding: '0.4rem 0.75rem',
                borderRadius: '8px',
                backgroundColor: isActive('/profile') ? 'rgba(255,255,255,0.1)' : 'transparent',
                transition: 'all 0.2s'
              }}
            >
              <UserCheck size={17} />
              Farm Profile
            </Link>

            <Link
              to="/recommendations"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: isActive('/recommendations') ? '#74c69d' : '#e2e8f0',
                fontWeight: isActive('/recommendations') ? '700' : '500',
                fontSize: '0.95rem',
                padding: '0.4rem 0.75rem',
                borderRadius: '8px',
                backgroundColor: isActive('/recommendations') ? 'rgba(255,255,255,0.1)' : 'transparent',
                transition: 'all 0.2s'
              }}
            >
              <Sparkles size={17} />
              Recommendations
            </Link>

            <Link
              to="/compare-seeds"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: isActive('/compare-seeds') ? '#74c69d' : '#e2e8f0',
                fontWeight: isActive('/compare-seeds') ? '700' : '500',
                fontSize: '0.95rem',
                padding: '0.4rem 0.75rem',
                borderRadius: '8px',
                backgroundColor: isActive('/compare-seeds') ? 'rgba(255,255,255,0.1)' : 'transparent',
                transition: 'all 0.2s'
              }}
            >
              <Scale size={17} />
              Compare Seeds
            </Link>

            <Link
              to="/shops"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: isActive('/shops') ? '#74c69d' : '#e2e8f0',
                fontWeight: isActive('/shops') ? '700' : '500',
                fontSize: '0.95rem',
                padding: '0.4rem 0.75rem',
                borderRadius: '8px',
                backgroundColor: isActive('/shops') ? 'rgba(255,255,255,0.1)' : 'transparent',
                transition: 'all 0.2s'
              }}
            >
              <Store size={17} />
              Shops
            </Link>

            <Link
              to="/my-bookings"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: isActive('/my-bookings') ? '#74c69d' : '#e2e8f0',
                fontWeight: isActive('/my-bookings') ? '700' : '500',
                fontSize: '0.95rem',
                padding: '0.4rem 0.75rem',
                borderRadius: '8px',
                backgroundColor: isActive('/my-bookings') ? 'rgba(255,255,255,0.1)' : 'transparent',
                transition: 'all 0.2s'
              }}
            >
              <Package size={17} />
              Bookings
            </Link>

            <Link
              to="/farming-guidance"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                color: isActive('/farming-guidance') ? '#74c69d' : '#e2e8f0',
                fontWeight: isActive('/farming-guidance') ? '700' : '500',
                fontSize: '0.95rem', padding: '0.4rem 0.75rem', borderRadius: '8px',
                backgroundColor: isActive('/farming-guidance') ? 'rgba(255,255,255,0.1)' : 'transparent',
                transition: 'all 0.2s'
              }}
            >
              <BookOpen size={17} /> Farming Guidance
            </Link>

            <Link
              to="/farm-memory"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: isActive('/farm-memory') ? '#74c69d' : '#e2e8f0',
                fontWeight: isActive('/farm-memory') ? '700' : '500',
                fontSize: '0.95rem',
                padding: '0.4rem 0.75rem',
                borderRadius: '8px',
                backgroundColor: isActive('/farm-memory') ? 'rgba(255,255,255,0.1)' : 'transparent',
                transition: 'all 0.2s'
              }}
            >
              <History size={17} />
              Farm Memory
            </Link>

            <div style={{ height: '24px', width: '1px', backgroundColor: 'rgba(255,255,255,0.2)', margin: '0 0.25rem' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ fontSize: '0.85rem', color: '#b7e4c7', textAlign: 'right' }}>
                <div style={{ fontWeight: '600', color: '#ffffff' }}>{user?.name}</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Farmer</div>
              </div>

              <button
                onClick={handleLogout}
                className="btn btn-secondary"
                style={{
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.85rem',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.25)'
                }}
                title="Logout"
              >
                <LogOut size={15} />
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div className="navbar-public-links" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link to="/farming-guidance" style={{ color: '#e2e8f0', textDecoration: 'none', fontSize: '0.9rem', marginRight: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <BookOpen size={16} /> Farming Guidance
            </Link>
            <Link to="/shops" style={{ color: '#e2e8f0', textDecoration: 'none', fontSize: '0.9rem', marginRight: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Store size={16} /> Shops & Prices
            </Link>
            <Link to="/login" className="btn btn-outline" style={{ borderColor: '#74c69d', color: '#ffffff' }}>
              Sign In
            </Link>
            <Link to="/register" className="btn btn-primary">
              Register Farmer
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
