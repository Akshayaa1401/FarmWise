import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  Package, Store, MapPin, Calendar, Clock, DollarSign,
  CheckCircle2, XCircle, AlertTriangle, ArrowRight, RefreshCw,
  Copy, Check, Info, ShieldAlert
} from 'lucide-react';

const formatShopLocation = (value) => value && value.trim() ? value : 'Location unavailable';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [cancellingId, setCancellingId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/bookings');
      if (res.data && res.data.success) {
        setBookings(res.data.data || []);
      } else {
        setError(res.data?.message || 'Failed to retrieve bookings.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading reservations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm(`Are you sure you want to cancel booking ${bookingId}? The reserved stock will be safely restored to the store.`)) {
      return;
    }

    setCancellingId(bookingId);
    setActionMessage('');
    setError('');
    try {
      const res = await api.post(`/bookings/${bookingId}/cancel`);
      if (res.data && res.data.success) {
        setActionMessage(`Booking ${bookingId} has been successfully cancelled and stock restored.`);
        fetchBookings();
      } else {
        setError(res.data?.message || 'Failed to cancel booking.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error cancelling reservation.');
    } finally {
      setCancellingId(null);
    }
  };

  const handleCopy = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--color-forest-dark) 0%, #1b4332 100%)',
        color: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        padding: '2.25rem 2rem',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <span className="badge badge-sage" style={{ marginBottom: '0.75rem', background: 'rgba(255,255,255,0.2)', color: '#ffffff' }}>
            Phase 6 — Seed Reservations
          </span>
          <h1 style={{ fontSize: '2.1rem', color: '#ffffff', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Package size={30} /> My Seed Reservations
          </h1>
          <p style={{ color: '#d8f3dc', fontSize: '1rem', maxWidth: '750px', lineHeight: '1.6', margin: 0 }}>
            Active and past seed bookings. Present your unique Booking ID at the authorized shop counter to collect your verified seed bags.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={fetchBookings} className="btn btn-secondary" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}>
            <RefreshCw size={15} /> Refresh
          </button>
          <Link to="/shops" className="btn btn-primary" style={{ backgroundColor: '#52b788', color: '#081c15', fontWeight: '700' }}>
            <Store size={15} /> Browse Shops
          </Link>
        </div>
      </div>

      {actionMessage && (
        <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <CheckCircle2 size={18} />
          <div>{actionMessage}</div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <XCircle size={18} />
          <div>{error}</div>
        </div>
      )}

      {/* Bookings List */}
      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem' }}>
          <p style={{ color: 'var(--color-text-muted)' }}>Retrieving your booking records from MongoDB...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
          <Package size={48} style={{ color: 'var(--color-text-muted)', marginBottom: '1rem', opacity: 0.6 }} />
          <h2 style={{ fontSize: '1.35rem', color: 'var(--color-forest-dark)', marginBottom: '0.5rem' }}>
            No Seed Reservations Found
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', maxWidth: '550px', margin: '0 auto 1.5rem', lineHeight: '1.6' }}>
            You haven't reserved any seeds yet. Explore participating agro stores to hold seed bags with guaranteed stock.
          </p>
          <Link to="/shops" className="btn btn-primary">
            <Store size={16} /> Explore Local Shops & Seed Stock
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {bookings.map((booking) => {
            const isConfirmed = booking.status === 'CONFIRMED';

            return (
              <div
                key={booking.id}
                className="card fade-in"
                style={{
                  borderLeft: isConfirmed ? '6px solid var(--color-forest-mid)' : '6px solid #94a3b8',
                  padding: '1.75rem',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                      <span className="badge" style={{
                        backgroundColor: isConfirmed ? '#dcfce7' : '#f1f5f9',
                        color: isConfirmed ? '#166534' : '#64748b',
                        fontWeight: '700',
                        fontSize: '0.78rem'
                      }}>
                        {booking.status}
                      </span>
                      <span className="badge badge-earth">{({ SEED: 'Seed', FERTILIZER: 'Fertilizer', PEST_CONTROL: 'Pest control', DISEASE_CONTROL: 'Disease management' }[booking.productType || 'SEED']) || booking.productType || booking.cropType}</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                        Booked: {new Date(booking.bookingDate).toLocaleString()}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.5rem', color: 'var(--color-forest-dark)', margin: '0.2rem 0' }}>
                      {booking.productName || booking.seedVarietyName || 'Agricultural product'}
                    </h3>
                  </div>

                  {/* Booking ID Badge */}
                  <div style={{
                    backgroundColor: isConfirmed ? '#f0fdf4' : '#f8fafc',
                    border: isConfirmed ? '2px dashed var(--color-forest-mid)' : '1px dashed #cbd5e1',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem 1.25rem',
                    textAlign: 'right'
                  }}>
                    <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: '800', color: 'var(--color-text-muted)', letterSpacing: '0.5px' }}>
                      Booking ID
                    </div>
                    <div style={{ fontSize: '1.35rem', fontWeight: '800', color: isConfirmed ? 'var(--color-forest-dark)' : '#64748b', margin: '0.2rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {booking.bookingId}
                      <button
                        onClick={() => handleCopy(booking.bookingId)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
                        title="Copy Booking ID"
                      >
                        {copiedId === booking.bookingId ? <Check size={16} color="var(--color-forest-mid)" /> : <Copy size={16} />}
                      </button>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                      Show at shop counter to collect
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '1rem',
                  backgroundColor: '#f8fafc',
                  padding: '1.15rem',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '1rem',
                  fontSize: '0.9rem'
                }}>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', display: 'block' }}>Store Name & Location</span>
                    <strong><Store size={13} style={{ verticalAlign: 'text-bottom' }} /> {booking.shopName}</strong>
                    <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginTop: '0.15rem' }}>{formatShopLocation(booking.shopLocation)}</div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', display: 'block' }}>Reserved Quantity</span>
                    <strong>{booking.quantity} Units</strong>
                    <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginTop: '0.15rem' }}>Pack size: {booking.packageSize}</div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', display: 'block' }}>Unit Price & Total</span>
                    <strong>₹{booking.unitPrice} per pack</strong>
                    <div style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--color-forest-dark)', marginTop: '0.15rem' }}>
                      Total: ₹{booking.totalAmount}
                    </div>
                  </div>
                </div>

                {/* Sowing Rate Agronomic Check */}
                {booking.sowingRateNote && (
                  <div style={{
                    padding: '0.65rem 0.85rem',
                    backgroundColor: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.82rem',
                    color: '#065f46',
                    marginBottom: '1rem'
                  }}>
                    <Info size={13} style={{ verticalAlign: 'text-bottom', marginRight: '0.3rem' }} />
                    <strong>Agronomic Guideline:</strong> {booking.sowingRateNote}
                  </div>
                )}

                {/* Pickup Instructions & Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                    {isConfirmed ? (
                      <span>💡 <strong>Collection Instructions:</strong> Present this Booking ID at {booking.shopName}. Physical payment is completed upon collection.</span>
                    ) : (
                      <span>Reservation was cancelled. Reserved units were restored to store inventory.</span>
                    )}
                  </div>

                  {isConfirmed && (
                    <button
                      onClick={() => handleCancelBooking(booking.bookingId)}
                      disabled={cancellingId === booking.bookingId}
                      className="btn btn-outline"
                      style={{ fontSize: '0.82rem', color: '#b91c1c', borderColor: '#fca5a5' }}
                    >
                      {cancellingId === booking.bookingId ? 'Restoring Stock...' : 'Cancel Reservation'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
