import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  ArrowLeft, Sprout, Layers, Droplet, Clock, DollarSign,
  AlertTriangle, BookOpen, CheckCircle2, ShieldAlert, Award, Compass
} from 'lucide-react';

const SeedDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/dashboard');
  };
  const [seed, setSeed] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSeed = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/seeds/catalog/${id}`);
        if (res.data && res.data.success) {
          setSeed(res.data.data);
        } else {
          setError(res.data?.message || 'Failed to load seed details.');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to fetch seed details.');
      } finally {
        setLoading(false);
      }
    };

    fetchSeed();
  }, [id]);

  if (loading) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3.5rem' }}>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>
          Loading variety specifications from MongoDB...
        </p>
      </div>
    );
  }

  if (error || !seed) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
          {error || 'Seed variety not found.'}
        </div>
        <button type="button" onClick={goBack} className="btn btn-secondary">
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top back navigation */}
      <div>
        <button type="button" onClick={goBack} className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem' }}>
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>

      {/* Main Seed Card Header */}
      <div className="card" style={{ borderLeft: '6px solid var(--color-forest-mid)', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span className="badge badge-earth" style={{ fontSize: '0.85rem' }}>{seed.cropType}</span>
              <span className="badge badge-forest" style={{ fontSize: '0.85rem' }}>Code: {seed.varietyCode}</span>
              {seed.demonstrationData && (
                <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}>
                  <AlertTriangle size={13} /> Demonstration Data
                </span>
              )}
            </div>
            <h1 style={{ fontSize: '2.1rem', color: 'var(--color-forest-dark)', margin: '0.35rem 0' }}>
              {seed.name}
            </h1>
          </div>

          {(seed.price || seed.packageSize) && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-md)', padding: '0.9rem 1.4rem', textAlign: 'right' }}>
              {seed.price && (
                <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--color-forest-dark)' }}>
                  ₹{seed.price}
                </div>
              )}
              {seed.packageSize && (
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                  Package: {seed.packageSize}
                </div>
              )}
            </div>
          )}
        </div>

        <p style={{ fontSize: '1.05rem', color: 'var(--color-text-secondary)', lineHeight: '1.6', marginTop: '0.5rem' }}>
          {seed.description}
        </p>

        {seed.demonstrationData && (
          <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: '#fffbeb', borderRadius: 'var(--radius-sm)', border: '1px solid #fef3c7', fontSize: '0.85rem', color: '#92400e', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={16} />
            <span>
              <strong>Transparency Notice:</strong> This profile contains demonstration data for prototype evaluation. Commercial pricing, yield, and agronomic trials should be confirmed with local agricultural research stations.
            </span>
          </div>
        )}
      </div>

      {/* Agronomic Specifications Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {/* Soil & pH Requirements */}
        <div className="card">
          <h3 style={{ fontSize: '1.15rem', color: 'var(--color-forest-dark)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={18} color="var(--color-earth-mid)" /> Soil & pH Conditions
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.92rem' }}>
            <div>
              <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.8rem' }}>Suitable Soil Types</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.25rem' }}>
                {seed.suitableSoilTypes && seed.suitableSoilTypes.length > 0 ? (
                  seed.suitableSoilTypes.map((st, i) => (
                    <span key={i} className="badge badge-earth">{st}</span>
                  ))
                ) : (
                  <span>Data not specified</span>
                )}
              </div>
            </div>
            <div style={{ marginTop: '0.5rem' }}>
              <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.8rem' }}>Soil pH Range</span>
              <strong style={{ fontSize: '1.05rem', color: 'var(--color-forest-dark)' }}>
                {seed.minPh != null && seed.maxPh != null ? `${seed.minPh} - ${seed.maxPh}` : 'Not specified'}
              </strong>
            </div>
          </div>
        </div>

        {/* Climate & Water */}
        <div className="card">
          <h3 style={{ fontSize: '1.15rem', color: 'var(--color-forest-dark)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Droplet size={18} color="var(--color-forest-mid)" /> Water & Irrigation
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.92rem' }}>
            <div>
              <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.8rem' }}>Water Requirements</span>
              <strong>{seed.waterRequirements || 'Not specified'}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.8rem' }}>Drought Tolerance</span>
              <strong>{seed.droughtTolerance || 'Not specified'}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.8rem' }}>Suitable Irrigation Methods</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.25rem' }}>
                {seed.suitableIrrigationMethods && seed.suitableIrrigationMethods.length > 0 ? (
                  seed.suitableIrrigationMethods.map((im, i) => (
                    <span key={i} className="badge badge-forest">{im}</span>
                  ))
                ) : (
                  <span>Data not specified</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Growing Season & Regions */}
        <div className="card">
          <h3 style={{ fontSize: '1.15rem', color: 'var(--color-forest-dark)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Compass size={18} color="var(--color-earth-mid)" /> Seasons & Regions
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.92rem' }}>
            <div>
              <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.8rem' }}>Growing Seasons</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.25rem' }}>
                {seed.growingSeasons && seed.growingSeasons.length > 0 ? (
                  seed.growingSeasons.map((gs, i) => (
                    <span key={i} className="badge" style={{ background: '#e0f2fe', color: '#0369a1' }}>{gs}</span>
                  ))
                ) : (
                  <span>General seasonal</span>
                )}
              </div>
            </div>
            <div style={{ marginTop: '0.25rem' }}>
              <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.8rem' }}>Suitable Growing Regions</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.25rem' }}>
                {seed.suitableRegions && seed.suitableRegions.length > 0 ? (
                  seed.suitableRegions.map((gr, i) => (
                    <span key={i} className="badge" style={{ background: '#f3e8ff', color: '#7e22ce' }}>{gr}</span>
                  ))
                ) : (
                  <span>Pan-regional</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Duration & Yield */}
        <div className="card">
          <h3 style={{ fontSize: '1.15rem', color: 'var(--color-forest-dark)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={18} color="var(--color-forest-mid)" /> Growth & Yield Performance
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.92rem' }}>
            <div>
              <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.8rem' }}>Maturity Duration</span>
              <strong style={{ fontSize: '1.05rem', color: 'var(--color-forest-dark)' }}>
                {seed.maturityDays ? `${seed.maturityDays} Days from sowing` : 'Not specified'}
              </strong>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.8rem' }}>Yield Potential</span>
              <strong style={{ fontSize: '1.05rem', color: 'var(--color-forest-dark)' }}>
                {seed.yieldPotentialQuintalPerAcre ? `${seed.yieldPotentialQuintalPerAcre} Quintals / Acre` : 'Yield data pending regional trials'}
              </strong>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.8rem' }}>Disease Resistance</span>
              <strong>{seed.pestResistance || 'Not recorded'}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Key Agronomic Strengths & Considerations */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="card" style={{ borderLeft: '4px solid #16a34a' }}>
          <h4 style={{ color: '#166534', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CheckCircle2 size={16} /> Key Agronomic Advantages
          </h4>
          <ul style={{ paddingLeft: '1.25rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {seed.advantages && seed.advantages.length > 0 ? (
              seed.advantages.map((str, i) => <li key={i}>{str}</li>)
            ) : (
              <li>No specific strengths recorded</li>
            )}
          </ul>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #ea580c' }}>
          <h4 style={{ color: '#9a3412', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShieldAlert size={16} /> Agronomic Considerations & Risks
          </h4>
          <ul style={{ paddingLeft: '1.25rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {seed.disadvantages && seed.disadvantages.length > 0 ? (
              seed.disadvantages.map((con, i) => <li key={i}>{con}</li>)
            ) : (
              <li>No specific considerations recorded</li>
            )}
          </ul>
        </div>
      </div>

      {/* Agronomic Source / Evidence */}
      <div className="card" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <BookOpen size={20} color="var(--color-forest-mid)" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
        <div>
          <h4 style={{ fontSize: '0.95rem', color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
            Agronomic Source & Evidence
          </h4>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', margin: 0 }}>
            {seed.agronomicSource || 'Curated agricultural research trials.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SeedDetail;
