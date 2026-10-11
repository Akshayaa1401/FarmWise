import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Sparkles, CheckCircle2, AlertCircle, Award, ArrowRight, BookOpen,
  Scale, Clock, Layers, Droplet, MapPin, Calendar, AlertTriangle,
  History, ExternalLink, ChevronRight, RefreshCw, Info, HelpCircle
} from 'lucide-react';

const Recommendations = () => {
  const navigate = useNavigate();

  // Active saved profile state
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Recommendations calculation state
  const [recommendations, setRecommendations] = useState(null);
  const [profileConditionsUsed, setProfileConditionsUsed] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // History state
  const [historyList, setHistoryList] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Note: NO automatic recommendation calculation on page load!
  // Only the saved profile and history list are loaded.
  useEffect(() => {
    fetchSavedProfile();
    fetchHistory();
  }, []);

  const fetchSavedProfile = async () => {
    setProfileLoading(true);
    try {
      const res = await api.get('/profile');
      if (res.data && res.data.success && res.data.data) {
        setProfile(res.data.data);
      } else {
        setProfile(null);
      }
    } catch (err) {
      console.error("Error retrieving saved farm profile:", err);
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await api.get('/recommendations/history');
      if (res.data && res.data.success) {
        setHistoryList(res.data.data || []);
      }
    } catch (err) {
      console.error("Error retrieving recommendation history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Explicit calculation triggered ONLY when the farmer clicks the button
  const handleGetRecommendations = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    setSelectedHistoryItem(null); // Clear any historical view
    setRecommendations(null);

    if (!profile) {
      setError('Your saved farm profile could not be found. Save your location, soil type, soil pH, water availability, irrigation method and growing season first.');
      setLoading(false);
      return;
    }

    try {
      const res = await api.post('/recommendations/generate');
      const envelope = res?.data;
      const data = envelope?.data;

      if (!envelope?.success) {
        throw new Error(envelope?.message || 'The server rejected the recommendation request.');
      }
      if (!data) {
        throw new Error('The server returned an empty recommendation response. Please check the backend logs.');
      }
      if (data.status === 'PROFILE_REQUIRED') {
        setError(data.message || 'Please complete your farm profile first.');
        return;
      }
      if (data.status === 'NO_SEEDS' || !Array.isArray(data.recommendations) || data.recommendations.length === 0) {
        setError(data.message || 'No paddy varieties are available to evaluate. Add verified paddy seed records to the catalog and try again.');
        return;
      }

      setRecommendations(data.recommendations);
      setProfileConditionsUsed(data.profileConditions || null);
      setMessage(data.message || 'Your paddy varieties have been ranked against your saved farm profile.');
      fetchHistory();
    } catch (err) {
      const status = err.response?.status;
      const serverMessage = err.response?.data?.message || err.response?.data?.error;
      if (status === 401) {
        setError('Your session has expired. Please sign in again, then retry the recommendation calculation.');
      } else if (status === 403) {
        setError('Your account is not permitted to run this evaluation. Please sign in with a farmer account.');
      } else if (status === 404) {
        setError('The recommendation endpoint was not found. Restart the Spring Boot backend and confirm it includes POST /api/recommendations/generate.');
      } else if (!err.response) {
        setError('Cannot reach the backend at the configured API address. Start Spring Boot on port 8080 and check the frontend API configuration.');
      } else {
        setError(serverMessage || err.message || 'Recommendation evaluation failed. Check the backend terminal for the underlying error.');
      }
      console.error('Recommendation evaluation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHistoryItem = (item) => {
    setSelectedHistoryItem(item);
    setRecommendations(null); // Switch off freshly calculated view
  };

  const handleReturnToFreshView = () => {
    setSelectedHistoryItem(null);
  };

  // Transfer seed to separate Compare Seeds tool without calling any calculation
  const handleAddToCompare = (seedId) => {
    const activeItems = selectedHistoryItem
      ? (selectedHistoryItem.recommendedVarieties || [])
      : (recommendations || []);
    const recommendedIds = activeItems.slice(0, 4)
      .map(item => item.seed?.id || item.seedId || item.id)
      .filter(Boolean);
    // Keep the clicked recommendation available even when it is the fourth-ranked item.
    const allowedIds = [...new Set([...recommendedIds, seedId].filter(Boolean))].slice(0, 4);
    navigate(`/compare-seeds?recommendedIds=${encodeURIComponent(allowedIds.join(','))}&preselect=${encodeURIComponent(seedId)}`);
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--color-forest-dark), #1b4332)',
        color: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        padding: '2.25rem 2rem',
        boxShadow: 'var(--shadow-md)',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ maxWidth: '800px' }}>
            <span className="badge badge-sage" style={{ marginBottom: '0.75rem', background: 'rgba(255,255,255,0.2)', color: '#ffffff' }}>
              Personalized for your farm
            </span>
            <h1 style={{ fontSize: '2.1rem', color: '#ffffff', marginBottom: '0.5rem' }}>
              Personalized Seed Variety Recommendations
            </h1>
            <p style={{ color: '#d8f3dc', fontSize: '1rem', lineHeight: '1.6', margin: 0 }}>
              Find paddy seeds that best match your farm. Review the key points first; open details only when you need them.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="btn btn-secondary"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.3)', fontSize: '0.9rem' }}
            >
              <History size={16} />
              {showHistory ? 'Hide Run History' : `Saved History (${historyList.length})`}
            </button>
          </div>
        </div>

        {/* Action Trigger Area */}
        <div style={{ marginTop: '1.75rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleGetRecommendations}
            className="btn btn-primary"
            style={{
              backgroundColor: '#52b788',
              color: '#081c15',
              fontWeight: '700',
              padding: '0.9rem 2rem',
              fontSize: '1.05rem',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
            }}
            disabled={loading || profileLoading}
          >
            <Sparkles size={20} style={{ color: '#081c15' }} />
            {loading ? 'Evaluating Agronomic Rules...' : 'Get Recommendations'}
          </button>

          <span style={{ fontSize: '0.85rem', color: '#b7e4c7', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Info size={14} /> Uses your saved farm profile
          </span>
        </div>
      </div>

      {/* Active Farm Profile Status Bar */}
      <div className="card" style={{ borderLeft: profile ? '6px solid var(--color-forest-mid)' : '6px solid #eab308' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-text-muted)', fontWeight: '700' }}>
              Your Farm Conditions
            </span>
            {profile ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginTop: '0.35rem', flexWrap: 'wrap', fontSize: '0.92rem' }}>
                <div><strong>Location:</strong> {profile.location}</div>
                <div><strong>Crop Preference:</strong> <span className="badge badge-earth">{profile.preferredCrop}</span></div>
                <div><strong>Soil:</strong> {profile.soilType} (pH {profile.soilPh})</div>
                <div><strong>Water:</strong> {profile.waterAvailability} ({profile.irrigationMethod})</div>
                <div><strong>Season:</strong> {profile.growingSeason}</div>
              </div>
            ) : (
              <p style={{ margin: '0.35rem 0 0 0', color: '#b45309', fontSize: '0.95rem' }}>
                No active farm profile found. Please configure your profile first to enable personalized scoring.
              </p>
            )}
          </div>

          <div>
            <Link to="/profile" className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '0.4rem 0.85rem' }}>
              {profile ? 'Edit Profile Parameters' : 'Create Profile'}
            </Link>
          </div>
        </div>
      </div>

      {/* History Drawer / Panel */}
      {showHistory && (
        <div className="card fade-in" style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--color-forest-dark)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <History size={18} /> Saved Recommendation Runs in MongoDB
            </h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              Historical snapshots are strictly separated from fresh calculations
            </span>
          </div>

          {loadingHistory ? (
            <p style={{ color: 'var(--color-text-muted)' }}>Loading historical records...</p>
          ) : historyList.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)' }}>No historical recommendation runs recorded yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {historyList.map((hist) => (
                <div
                  key={hist.id}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.85rem 1.25rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.75rem'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <strong style={{ fontSize: '0.95rem', color: 'var(--color-forest-dark)' }}>
                        Evaluated for {hist.profileConditions?.preferredCrop || 'Crop'} ({hist.profileConditions?.location || 'Location'})
                      </strong>
                      <span className="badge" style={{ background: '#e2e8f0', color: '#334155', fontSize: '0.7rem' }}>
                        {hist.recommendedVarieties?.length || 0} varieties
                      </span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                      Recorded: {new Date(hist.timestamp).toLocaleString()} | Soil: {hist.profileConditions?.soilType} (pH {hist.profileConditions?.soilPh})
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelectHistoryItem(hist)}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.82rem', padding: '0.35rem 0.75rem' }}
                  >
                    View Historical Snapshot <ChevronRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Feedback Messages */}
      {error && (
        <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertCircle size={20} />
            <div>{error}</div>
          </div>
          {(error.toLowerCase().includes('profile') || error.toLowerCase().includes('farm conditions')) && (
            <Link to="/profile" className="btn btn-secondary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}>
              Setup Farm Profile
            </Link>
          )}
        </div>
      )}

      {message && !error && (
        <div className="alert alert-success">
          <CheckCircle2 size={20} />
          <div>{message}</div>
        </div>
      )}

      {/* Historical View Warning Banner */}
      {selectedHistoryItem && (
        <div className="alert alert-warning" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <AlertTriangle size={22} style={{ color: '#d97706', flexShrink: 0 }} />
            <div>
              <strong style={{ display: 'block' }}>Viewing Historical Recommendation Run (Snapshot from MongoDB)</strong>
              <span style={{ fontSize: '0.85rem' }}>
                Recorded on {new Date(selectedHistoryItem.timestamp).toLocaleString()} under conditions: {selectedHistoryItem.profileConditions?.location}, {selectedHistoryItem.profileConditions?.soilType} soil, pH {selectedHistoryItem.profileConditions?.soilPh}. This is not a freshly calculated result.
              </span>
            </div>
          </div>
          <button onClick={handleReturnToFreshView} className="btn btn-outline" style={{ fontSize: '0.82rem', padding: '0.35rem 0.75rem' }}>
            Exit Historical View
          </button>
        </div>
      )}

      {/* Initial Guidance Card (shown before calculation and when no history is selected) */}
      {!recommendations && !selectedHistoryItem && !loading && (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 2rem', backgroundColor: '#ffffff' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-sage-ghost)',
            color: 'var(--color-forest-dark)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem'
          }}>
            <Sparkles size={32} />
          </div>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--color-forest-dark)', marginBottom: '0.5rem' }}>
            Find seeds for your farm
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', maxWidth: '650px', margin: '0 auto 1.5rem', lineHeight: '1.6' }}>
            Select <strong>Get Recommendations</strong> to see the best matches for your saved farm conditions.
          </p>
          <div style={{ display: 'inline-flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={handleGetRecommendations} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
              <Sparkles size={16} /> Get Recommendations Now
            </button>
            <Link to="/farming-guidance" className="btn btn-outline" style={{ padding: '0.75rem 1.5rem' }}>
              <BookOpen size={16} /> Farming Guidance
            </Link>
          </div>
        </div>
      )}

      {/* RESULTS DISPLAY: Render either Fresh Recommendations or Selected Historical Item */}
      {(recommendations || (selectedHistoryItem && selectedHistoryItem.recommendedVarieties)) && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.45rem', color: 'var(--color-forest-dark)', margin: 0 }}>
                {selectedHistoryItem ? 'Historical Variety Recommendations' : 'Seed Varieties Ranked for Your Farm'}
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: '0.25rem 0 0 0' }}>
                Ranked using your farm conditions and comparable Farm Memory records where available. Check the evidence and limitations before choosing.
              </p>
            </div>
            {recommendations && (
              <span className="badge badge-forest" style={{ fontSize: '0.8rem' }}>
                Freshly Evaluated
              </span>
            )}
          </div>

          {recommendations && (
            <p className="alert alert-success" style={{ marginBottom: '1rem' }}>
Showing up to four of the highest-ranked eligible seed varieties for your farm. Open each variety to review its match reasons and limitations.
            </p>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {(selectedHistoryItem ? selectedHistoryItem.recommendedVarieties : recommendations).slice(0, 4).map((item, index) => {
              const seedObj = item.seed || {
                id: item.seedId,
                name: item.seedName,
                cropType: item.cropType,
                varietyCode: item.varietyCode,
                maturityDays: item.maturityDays,
                yieldPotentialQuintalPerAcre: item.yieldPotential,
                agronomicSource: item.agronomicSource,
                demonstrationData: item.demonstrationData
              };

              return (
                <div
                  key={seedObj.id || index}
                  className="card fade-in"
                  style={{
                    borderLeft: '6px solid var(--color-forest-mid)',
                    boxShadow: 'var(--shadow-md)',
                    padding: '1.75rem'
                  }}
                >
                  {/* Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                        <span className="badge badge-sage" style={{ fontWeight: '700' }}>Rank #{index + 1}</span>
                        <span className="badge badge-earth">{seedObj.cropType}</span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: '600' }}>
                          Code: {seedObj.varietyCode}
                        </span>
                        {seedObj.demonstrationData && (
                          <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}>
                            <AlertTriangle size={12} /> Demonstration Data
                          </span>
                        )}
                      </div>
                      <h3 style={{ fontSize: '1.6rem', color: 'var(--color-forest-dark)', margin: '0.25rem 0' }}>
                        {seedObj.name}
                      </h3>
                    </div>

                    {/* Farmer-friendly suitability label derived from the actual ranking score; no misleading percentage is shown. */}
                    <div style={{
                      backgroundColor: 'var(--color-sage-ghost)',
                      border: '1px solid #b7e4c7',
                      padding: '0.8rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      minWidth: '170px'
                    }}>
                      <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: '800', color: 'var(--color-text-muted)', letterSpacing: '0.5px', marginBottom: '0.3rem' }}>
                        Farm suitability
                      </div>
                      <div style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--color-forest-dark)' }}>
                        {item.matchScore >= 80 ? 'Strong match' : item.matchScore >= 60 ? 'Good match' : item.matchScore >= 45 ? 'Consider with care' : 'Needs careful review'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                        Based on your farm details
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem', margin: '0.75rem 0 1rem' }}>
                    <div style={{ padding: '0.7rem 0.85rem', background: '#f8fafc', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Water needs</div>
                      <strong>{seedObj.waterRequirements || 'Not recorded'}</strong>
                    </div>
                    <div style={{ padding: '0.7rem 0.85rem', background: '#f8fafc', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Growing time</div>
                      <strong>{item.maturityDays ? `${item.maturityDays} days` : 'Not recorded'}</strong>
                    </div>
                    <div style={{ padding: '0.7rem 0.85rem', background: '#f8fafc', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Price</div>
                      <strong>{seedObj.price != null ? `₹${seedObj.price}` : 'Not verified'}</strong>
                    </div>
                  </div>
                  {item.mismatches && item.mismatches.length > 0 && (
                    <div role="note" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '0.7rem 0.85rem', background: '#fff8e8', border: '1px solid #f4d58d', borderRadius: 'var(--radius-sm)', color: '#854d0e', marginBottom: '0.85rem', fontSize: '0.88rem' }}>
                      <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                      <span><strong>Check:</strong> {item.mismatches[0]}</span>
                    </div>
                  )}
                  <details style={{ marginBottom: '1rem', padding: '0.85rem 1rem', background: '#fbfdfb', border: '1px solid #dbe7dd', borderRadius: 'var(--radius-sm)' }}>
                    <summary style={{ cursor: 'pointer', fontWeight: 700, color: 'var(--color-forest-dark)' }}>Why this match? View risks and evidence</summary>
                    <div style={{ paddingTop: '1rem' }}>
                  {/* Reasons It Matches Farmer's Profile */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <h4 style={{ fontSize: '0.95rem', color: 'var(--color-forest-dark)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <CheckCircle2 size={16} color="var(--color-forest-mid)" /> Why it may fit:
                    </h4>
                    <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem', color: 'var(--color-text-primary)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      {item.matchReasons && item.matchReasons.map((reason, rIdx) => (
                        <li key={rIdx}>{reason}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Important Mismatches (if any) */}
                  {item.mismatches && item.mismatches.length > 0 && (
                    <div style={{
                      marginBottom: '1.25rem',
                      padding: '0.85rem 1rem',
                      backgroundColor: '#fffbeb',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid #fde68a'
                    }}>
                      <h4 style={{ fontSize: '0.9rem', color: '#92400e', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <AlertTriangle size={15} /> Check before choosing:
                      </h4>
                      <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.88rem', color: '#78350f', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {item.mismatches.map((mismatch, mIdx) => (
                          <li key={mIdx}>{mismatch}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Soil & Water Suitability Breakdown */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div style={{ padding: '0.85rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.35rem' }}>
                        <Layers size={14} color="var(--color-earth-mid)" /> Soil Compatibility
                      </div>
                      <div style={{ fontSize: '0.88rem', color: 'var(--color-text-primary)' }}>
                        {item.soilSuitability}
                      </div>
                    </div>

                    <div style={{ padding: '0.85rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.35rem' }}>
                        <Droplet size={14} color="var(--color-forest-mid)" /> Water & Irrigation Compatibility
                      </div>
                      <div style={{ fontSize: '0.88rem', color: 'var(--color-text-primary)' }}>
                        {item.waterSuitability}
                      </div>
                    </div>

                    <div style={{ padding: '0.85rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.35rem' }}>
                        <Clock size={14} /> Growing Duration
                      </div>
                      <div style={{ fontSize: '0.92rem', fontWeight: '700', color: 'var(--color-forest-dark)' }}>
                        {item.maturityDays ? `${item.maturityDays} Days to maturity` : 'Duration trial pending'}
                      </div>
                    </div>
                  </div>

                  {/* Limitations or Missing Evidence */}
                  {item.limitations && item.limitations.length > 0 && (
                    <div style={{
                      marginBottom: '1.25rem',
                      padding: '0.75rem 1rem',
                      backgroundColor: '#f1f5f9',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.82rem',
                      color: '#475569'
                    }}>
                      <div style={{ fontWeight: '700', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <HelpCircle size={14} /> Data to verify:
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        {item.limitations.map((lim, lIdx) => (
                          <li key={lIdx}>{lim}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                    </div>
                  </details>

                  {/* Actions: View Variety Details & Add to Compare Seeds */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid #e2e8f0'
                  }}>
                    <Link
                      to={`/seed-varieties/${seedObj.id}`}
                      className="btn btn-outline"
                      style={{ fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <BookOpen size={15} /> View Variety Details <ExternalLink size={13} />
                    </Link>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                      <button
                        onClick={() => handleAddToCompare(seedObj.id)}
                        className="btn btn-secondary"
                        style={{ fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                        title="Select this variety in the separate comparison tool"
                      >
                        <Scale size={15} /> Compare Seeds <ArrowRight size={14} />
                      </button>
                      <Link
                        to={`/shops?seedId=${encodeURIComponent(seedObj.id || '')}&query=${encodeURIComponent(seedObj.name || '')}&productType=SEED`}
                        className="btn btn-primary"
                        style={{ fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <MapPin size={15} /> Find Local Shops
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Disclaimers & Methodology */}
      <div className="card" style={{ backgroundColor: 'var(--color-bg-warm)', border: '1px solid #d8f3dc' }}>
        <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-forest-dark)' }}>
          <Info size={18} style={{ color: 'var(--color-forest-mid)' }} />
          Transparent Agronomic Scoring Methodology
        </h4>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: '1.6', margin: 0 }}>
          FarmWise uses deterministic weighted nearest-neighbor scoring. Suitability scores are relative rankings based on physiological tolerances documented in agronomic literature. The application does not use generative LLMs for recommendations, does not claim certainty, and does not invent crop yield guarantees. Real-world crop performance depends on microclimatic variables, fertilizer management, and pathogen pressures.
        </p>
      </div>
    </div>
  );
};

export default Recommendations;
