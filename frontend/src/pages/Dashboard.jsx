import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Sprout,
  MapPin,
  Layers,
  Droplet,
  Compass,
  Calendar,
  Sparkles,
  Scale,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  BookOpen,
  History,
  Store,
  CloudSun,
  CloudRain,
  Thermometer,
  RefreshCw
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/profile');
        if (res.data && res.data.success && res.data.data) {
          setProfile(res.data.data);
          setWeatherLoading(true);
          try {
            const weatherRes = await api.get('/weather');
            if (weatherRes.data?.success && weatherRes.data?.data) {
              setWeather(weatherRes.data.data);
              setWeatherError('');
            } else {
              setWeatherError(weatherRes.data?.message || 'Weather is currently unavailable.');
            }
          } catch (weatherErr) {
            setWeatherError(weatherErr.response?.data?.message || 'Weather unavailable. Check the API key and farm location.');
          } finally {
            setWeatherLoading(false);
          }
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error("Error fetching farm profile:", err);
        setError("Could not load farm profile from MongoDB server.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--color-forest-dark) 0%, var(--color-forest-mid) 100%)',
        color: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        padding: '2.5rem 2rem',
        boxShadow: 'var(--shadow-md)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          right: '-20px',
          bottom: '-30px',
          opacity: 0.1,
          color: '#ffffff'
        }}>
          <Sprout size={240} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '700px' }}>
          <div className="badge badge-sage" style={{ marginBottom: '1rem', background: 'rgba(255,255,255,0.2)', color: '#ffffff' }}>
            Your farm at a glance
          </div>
          <h1 style={{ fontSize: '2.25rem', color: '#ffffff', marginBottom: '0.5rem' }}>
            Welcome back, {user?.name || 'Farmer'}! 👋
          </h1>
          <p style={{ color: '#d8f3dc', fontSize: '1.05rem', lineHeight: '1.6' }}>
            Manage your farm details, explore suitable seeds, and review your harvest history.
          </p>
        </div>
      </div>

      {/* Profile Completion Indicator */}
      <div className="card" style={{ borderLeft: profile ? '6px solid var(--color-success)' : '6px solid #f59e0b' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: profile ? 'var(--color-success-bg)' : '#fef3c7',
              color: profile ? 'var(--color-success)' : '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {profile ? <CheckCircle size={26} /> : <AlertTriangle size={26} />}
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--color-forest-dark)' }}>
                {profile ? 'Farm Profile Complete (100%)' : 'Farm Profile Pending Setup'}
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                {profile
                  ? `Saved parameters for ${profile.location} (${profile.farmAreaAcres} acres, ${profile.soilType} soil).`
                  : 'Complete your farm parameters to unlock precision agronomic tools.'}
              </p>
            </div>
          </div>

          <Link
            to="/profile"
            className={profile ? "btn btn-secondary" : "btn btn-primary"}
          >
            {profile ? 'Edit Farm Profile' : 'Setup Profile Now'}
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Weather for the saved farm location */}
      <section className="card" aria-live="polite">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CloudSun size={28} style={{ color: 'var(--color-forest-mid)' }} />
            <div>
              <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Farm Weather</h2>
              <p style={{ color: 'var(--color-text-secondary)', margin: '0.25rem 0 0' }}>
                {profile?.location ? `Current conditions for ${profile.location}` : 'Save your farm location to view local weather.'}
              </p>
            </div>
          </div>
          {weather && <button type="button" className="btn btn-outline" onClick={async () => {
            setWeatherLoading(true); setWeatherError('');
            try { const r = await api.get('/weather'); if (r.data?.success) setWeather(r.data.data); else setWeatherError(r.data?.message || 'Weather unavailable.'); }
            catch (e) { setWeatherError(e.response?.data?.message || 'Weather unavailable.'); }
            finally { setWeatherLoading(false); }
          }} disabled={weatherLoading}><RefreshCw size={15} /> Refresh</button>}
        </div>
        {weatherLoading ? <p style={{ marginTop: '1rem' }}>Loading weather…</p> : weatherError ?
          <p className="alert alert-warning" style={{ marginTop: '1rem', marginBottom: 0 }}>{weatherError}</p> : weather ?
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Thermometer size={22} /><strong>{Math.round(weather.temperatureCelsius)}°C</strong><span>{weather.condition}</span></div>
            {weather.chanceOfRain != null && <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CloudRain size={20} /><span>Rain chance: {Math.round(weather.chanceOfRain)}%</span></div>}
            {weather.expectedRainfallMm != null && <span>Reported rainfall: {weather.expectedRainfallMm} mm</span>}
          </div> : <p style={{ color: 'var(--color-text-secondary)', marginTop: '1rem', marginBottom: 0 }}>Weather data appears here when the backend and OpenWeather API key are configured.</p>}
      </section>

      {/* Short, actionable pre-plant checks */}
      <section className="card" aria-labelledby="pre-plant-checks-title">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.9rem' }}>
          <AlertTriangle size={22} style={{ color: 'var(--color-earth-accent)' }} />
          <div>
            <h2 id="pre-plant-checks-title" style={{ fontSize: '1.2rem', margin: 0 }}>Before you plant</h2>
            <p style={{ color: 'var(--color-text-secondary)', margin: '0.2rem 0 0', fontSize: '0.88rem' }}>A few important checks before choosing or booking seed.</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: 'var(--radius-sm)', padding: '0.85rem' }}>
            <strong style={{ display: 'block', marginBottom: '0.25rem' }}>💧 Water needs</strong>
            <span style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)' }}>
              {profile?.waterAvailability && ['low', 'seasonal'].includes(profile.waterAvailability.toLowerCase())
                ? 'Water is limited or seasonal. Check the selected variety’s water needs before booking.'
                : 'Check that the selected variety’s water needs fit your farm and irrigation method.'}
            </span>
          </div>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: 'var(--radius-sm)', padding: '0.85rem' }}>
            <strong style={{ display: 'block', marginBottom: '0.25rem' }}>🧪 Soil & fertilizer</strong>
            <span style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)' }}>Use a recent soil-test report for fertilizer decisions. The right dose depends on the test and local crop guidance; FarmWise does not guess fertilizer quantities.</span>
          </div>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: 'var(--radius-sm)', padding: '0.85rem' }}>
            <strong style={{ display: 'block', marginBottom: '0.25rem' }}>🌾 Seed information</strong>
            <span style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)' }}>Some seed and shop records are demonstration data. Verify variety suitability, price, and stock with a local authorized dealer before purchasing.</span>
          </div>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: 'var(--radius-sm)', padding: '0.85rem' }}>
            <strong style={{ display: 'block', marginBottom: '0.25rem' }}>🌦️ Weather</strong>
            <span style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)' }}>Review a current local forecast and official agricultural advisories before field operations.</span>
          </div>
        </div>
        {!profile && <div style={{ marginTop: '0.85rem' }}><Link to="/profile" className="btn btn-primary">Set up farm profile <ArrowRight size={15} /></Link></div>}
      </section>

      {/* Saved Farm Summary Card */}
      <div>
        <h2 style={{ fontSize: '1.35rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Compass size={22} style={{ color: 'var(--color-forest-mid)' }} />
          Saved Farm Profile Summary
        </h2>

        {loading ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: 'var(--color-text-muted)' }}>Loading farm details from MongoDB...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : profile ? (
          <div className="grid-3">
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', color: 'var(--color-forest-mid)' }}>
                <MapPin size={20} />
                <h4 style={{ fontSize: '1rem' }}>Location & Size</h4>
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                {profile.location}
              </div>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                Area: <strong>{profile.farmAreaAcres} Acres</strong>
              </p>
            </div>

            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', color: 'var(--color-forest-mid)' }}>
                <Layers size={20} />
                <h4 style={{ fontSize: '1rem' }}>Soil Profile</h4>
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                {profile.soilType} Soil
              </div>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                Soil pH: <strong>{profile.soilPh}</strong>
              </p>
            </div>

            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', color: 'var(--color-forest-mid)' }}>
                <Droplet size={20} />
                <h4 style={{ fontSize: '1rem' }}>Irrigation & Water</h4>
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                {profile.irrigationMethod}
              </div>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                Water Availability: <strong>{profile.waterAvailability}</strong>
              </p>
            </div>

            <div className="card" style={{ gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <span className="badge badge-earth" style={{ marginBottom: '0.5rem' }}>Crop Focus</span>
                  <h3 style={{ fontSize: '1.25rem' }}>Preferred Crop: {profile.preferredCrop}</h3>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                    Target Season: <strong>{profile.growingSeason}</strong>
                  </p>
                </div>
                <Link to="/profile" className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                  Update Parameters
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
            <Sprout size={40} style={{ color: 'var(--color-sage-primary)', marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No Saved Profile Found</h3>
            <p style={{ color: 'var(--color-text-secondary)', maxWidth: '500px', margin: '0 auto 1.5rem', fontSize: '0.9rem' }}>
              Your MongoDB database does not contain a saved profile for this farmer account yet.
            </p>
            <Link to="/profile" className="btn btn-primary">
              Create Farm Profile
            </Link>
          </div>
        )}
      </div>

      {/* Navigation to Agronomic Features */}
      <div>
        <h2 style={{ fontSize: '1.35rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingUp size={22} style={{ color: 'var(--color-forest-mid)' }} />
          Agronomic Tools & Modules
        </h2>

        <div className="grid-2">
          {/* Card 1: Farming Guidance */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: '#e0f2fe',
                color: '#0369a1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <BookOpen size={22} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Farming Guidance</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '1.25rem' }}>
                Follow practical stage-by-stage guidance from crop planning and seed selection through crop care and harvesting.
              </p>
            </div>
            <div>
              <Link to="/farming-guidance" className="btn btn-secondary" style={{ width: '100%' }}>
                <BookOpen size={16} />
                Open Farming Guidance
              </Link>
            </div>
          </div>

          {/* Card 2: Recommendations */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: 'var(--color-sage-ghost)',
                color: 'var(--color-forest-dark)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <Sparkles size={22} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Seed Recommendations</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '1.25rem' }}>
                Automatically matches suitable seed varieties based on your active farm location, soil pH, and irrigation method using deterministic agronomic rules.
              </p>
            </div>
            <div>
              <Link to="/recommendations" className="btn btn-primary" style={{ width: '100%' }}>
                <Sparkles size={16} />
                Open Recommendations
              </Link>
            </div>
          </div>

          {/* Card 3: Compare Seeds */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: 'var(--color-earth-warm)',
                color: '#7c522a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <Scale size={22} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Compare Seeds</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '1.25rem' }}>
                Select 2 or 3 seed varieties to compare yield potential, maturity duration, drought resistance, and agronomic advantages side-by-side.
              </p>
            </div>
            <div>
              <Link to="/compare-seeds" className="btn btn-secondary" style={{ width: '100%' }}>
                <Scale size={16} />
                Open Seed Comparison
              </Link>
            </div>
          </div>

          {/* Card 4: Farm Memory */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: '#f3e8ff',
                color: '#7e22ce',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <History size={22} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Farm Memory</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '1.25rem' }}>
                View your historical profile timeline, configuration changes, and saved parameters persisted in MongoDB.
              </p>
            </div>
            <div>
              <Link to="/farm-memory" className="btn btn-outline" style={{ width: '100%' }}>
                <History size={16} />
                View Farm Memory
              </Link>
            </div>
          </div>

          {/* Card 5: Shops & Inventory */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gridColumn: '1 / -1' }}>
            <div>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: '#dcfce7',
                color: '#15803d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <Store size={22} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Local Agro Shops & Live Stock</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '1.25rem' }}>
                Explore local seed dealers with verified package prices and persistent MongoDB inventory. Check real-time stock levels across regional stores.
              </p>
            </div>
            <div>
              <Link to="/shops" className="btn btn-secondary" style={{ width: 'auto', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <Store size={16} />
                Browse Shops & Seed Prices
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
