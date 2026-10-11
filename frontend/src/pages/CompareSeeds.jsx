import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import {
  Scale, Check, AlertCircle, Award, ArrowRight, Layers, Droplet,
  Search, Clock, Sprout, AlertTriangle, Info, CheckCircle2,
  HelpCircle, ExternalLink, RefreshCw
} from 'lucide-react';

const CompareSeeds = () => {
  const [searchParams] = useSearchParams();
  const preselectedId = searchParams.get('preselect');
  const passedRecommendedIds = (searchParams.get('recommendedIds') || '').split(',').map(id => id.trim()).filter(Boolean);

  // Seed Catalog State
  const [catalog, setCatalog] = useState([]);
  const [recommendedIds, setRecommendedIds] = useState(passedRecommendedIds);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCropFilter, setSelectedCropFilter] = useState('All');

  // Manual Selection State (Farmer picks 2 or 3)
  const [selectedIds, setSelectedIds] = useState([]);
  const [comparing, setComparing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [error, setError] = useState('');

  // Load the catalog and this farmer's saved recommendations, then expose only recommended varieties.
  useEffect(() => {
    fetchCatalog();
  }, []);

  const fetchCatalog = async () => {
    setLoadingCatalog(true);
    try {
      const [catalogRes, historyRes] = await Promise.all([
        api.get('/seeds/catalog'),
        api.get('/recommendations/history')
      ]);

      const seeds = catalogRes.data?.success ? (catalogRes.data.data || []) : [];
      const history = historyRes.data?.success ? (historyRes.data.data || []) : [];
      const latestRun = history[0];
      const latestIds = (latestRun?.recommendedVarieties || []).slice(0, 4)
        .map(item => item.seedId || item.seed?.id || item.id)
        .filter(Boolean);
      const allowedIds = passedRecommendedIds.length > 0 ? [...new Set(passedRecommendedIds)].slice(0, 4) : latestIds;

      setRecommendedIds(allowedIds);
      const allowedSeeds = seeds.filter(seed => allowedIds.includes(seed.id) || allowedIds.includes(seed.varietyCode));
      setCatalog(allowedSeeds);

      if (preselectedId && allowedSeeds.some(seed => seed.id === preselectedId || seed.varietyCode === preselectedId)) {
        setSelectedIds([allowedSeeds.find(seed => seed.id === preselectedId || seed.varietyCode === preselectedId).id]);
      }
      if (allowedIds.length === 0) {
        setError('Generate seed recommendations first. Only your recommended varieties can be compared.');
      } else if (allowedSeeds.length === 0) {
        setError('Your recommended seed varieties were not found in the current catalog. Refresh your recommendations and try again.');
      }
    } catch (err) {
      console.error("Error loading recommended seed varieties:", err);
      setError(err.response?.data?.message || "Could not load your recommended varieties. Please sign in and generate recommendations first.");
    } finally {
      setLoadingCatalog(false);
    }
  };

  const toggleSeedSelection = (seedId) => {
    setError('');
    if (selectedIds.includes(seedId)) {
      setSelectedIds(selectedIds.filter((id) => id !== seedId));
    } else {
      if (selectedIds.length >= 3) {
        setError('Comparison is limited to a maximum of 3 seed varieties.');
        return;
      }
      setSelectedIds([...selectedIds, seedId]);
    }
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
    setComparisonResult(null);
    setError('');
  };

  // Explicit button-triggered comparison
  const handleRunComparison = async () => {
    setError('');
    if (selectedIds.length < 2 || selectedIds.length > 3) {
      setError('Please select either 2 or 3 seed varieties to compare.');
      return;
    }

    setComparing(true);
    try {
      const res = await api.post('/seeds/compare', { seedIds: selectedIds });
      if (res.data && res.data.success) {
        setComparisonResult(res.data.data);
      } else {
        setError(res.data?.message || 'Comparison request failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to compare selected seeds.');
    } finally {
      setComparing(false);
    }
  };

  // Filter catalog list for manual picker
  const filteredCatalog = catalog.filter((seed) => {
    const normalizeCrop = (value) => (value || '').trim().toLowerCase().replace(/\s+/g, ' ');
    const isPaddy = ['rice/paddy', 'rice', 'paddy', 'paddy/rice', 'rice paddy'].includes(normalizeCrop(seed.cropType));
    const matchesCrop = isPaddy && (selectedCropFilter === 'All' || seed.cropType?.toLowerCase() === selectedCropFilter.toLowerCase());
    const matchesText = !searchFilter.trim() ||
      seed.name?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      seed.varietyCode?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      seed.cropType?.toLowerCase().includes(searchFilter.toLowerCase());
    const isRecommended = recommendedIds.includes(seed.id) || recommendedIds.includes(seed.varietyCode);
    return isRecommended && matchesCrop && matchesText;
  });

  const uniqueCrops = ['All', ...new Set(catalog.filter(s => ['rice/paddy', 'rice', 'paddy', 'paddy/rice', 'rice paddy'].includes((s.cropType || '').trim().toLowerCase().replace(/\s+/g, ' '))).map(s => s.cropType).filter(Boolean))];

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #7c522a 0%, var(--color-forest-dark) 100%)',
        color: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        padding: '2.25rem 2rem',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div className="badge badge-earth" style={{ marginBottom: '0.75rem', background: 'rgba(255,255,255,0.2)', color: '#ffffff' }}>
          Compare your choices
        </div>
        <h1 style={{ fontSize: '2.1rem', color: '#ffffff', marginBottom: '0.5rem' }}>
          Compare Seed Varieties Side-by-Side
        </h1>
        <p style={{ color: '#fef3c7', fontSize: '1rem', maxWidth: '850px', lineHeight: '1.6', margin: 0 }}>
          Choose 2–3 paddy varieties. Compare growing needs, farm suitability, strengths, and trade-offs side by side.
        </p>

        {preselectedId && (
          <div style={{ marginTop: '1rem', padding: '0.65rem 1rem', background: 'rgba(255,255,255,0.15)', borderRadius: 'var(--radius-sm)', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Info size={16} />
            <span>
              One variety is preselected. Pick 1 or 2 more varieties below to start the side-by-side comparison.
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertCircle size={20} />
          <div>{error}</div>
        </div>
      )}

      {/* STEP 1: Interactive Manual Seed Picker */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', color: 'var(--color-forest-dark)', margin: 0 }}>
              1. Browse & Select Varieties (Choose 2 or 3)
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: '0.25rem 0 0 0' }}>
              Only the seed varieties recommended for your saved farm profile are available here. Select 2 or 3 of those varieties to compare.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.92rem', fontWeight: '700', color: selectedIds.length >= 2 ? 'var(--color-forest-mid)' : 'var(--color-text-muted)' }}>
              Selected: {selectedIds.length} / 3
            </span>
            {selectedIds.length > 0 && (
              <button onClick={handleClearSelection} className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
                Reset Selection
              </button>
            )}
          </div>
        </div>

        {/* Filter / Search Bar */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '2.4rem' }}
              placeholder="Search by variety name or code..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
            />
            <Search size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          </div>

          <select
            className="form-control"
            style={{ width: 'auto', minWidth: '160px' }}
            value={selectedCropFilter}
            onChange={(e) => setSelectedCropFilter(e.target.value)}
          >
            {uniqueCrops.map(c => <option key={c} value={c}>{c === 'All' ? 'All Crop Types' : c}</option>)}
          </select>
        </div>

        {/* Seeds Grid */}
        {loadingCatalog ? (
          <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '2rem' }}>Loading seed catalog from MongoDB...</p>
        ) : filteredCatalog.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '2rem' }}>No seeds found matching your search.</p>
        ) : (
          <div className="grid-3" style={{ marginBottom: '1.5rem', maxHeight: '420px', overflowY: 'auto', padding: '0.25rem' }}>
            {filteredCatalog.map((seed) => {
              const seedId = seed.id;
              const isSelected = selectedIds.includes(seedId);

              return (
                <div
                  key={seedId}
                  onClick={() => toggleSeedSelection(seedId)}
                  style={{
                    border: isSelected ? '2px solid var(--color-forest-mid)' : '1px solid #e2e8f0',
                    backgroundColor: isSelected ? '#f0fdf4' : '#ffffff',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.15rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                    <span className="badge badge-earth" style={{ fontSize: '0.72rem' }}>{seed.cropType}</span>
                    <div style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      border: isSelected ? 'none' : '2px solid #cbd5e1',
                      backgroundColor: isSelected ? 'var(--color-forest-mid)' : 'transparent',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {isSelected && <Check size={14} />}
                    </div>
                  </div>

                  <h4 style={{ fontSize: '1.05rem', color: 'var(--color-forest-dark)', margin: '0.2rem 0' }}>
                    {seed.name}
                  </h4>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: '0.65rem' }}>
                    Code: {seed.varietyCode}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                    <div>Yield: <strong>{seed.yieldPotentialQuintalPerAcre ? `${seed.yieldPotentialQuintalPerAcre} Q/Ac` : 'Pending'}</strong></div>
                    <div>Duration: <strong>{seed.maturityDays ? `${seed.maturityDays} d` : 'N/A'}</strong></div>
                    <div>Water: <strong>{seed.waterRequirements || 'N/A'}</strong></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Action Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
            {selectedIds.length === 0 && 'Select 2 or 3 of your recommended varieties above to compare.'}
            {selectedIds.length === 1 && 'Pick at least 1 more variety to enable side-by-side comparison.'}
            {selectedIds.length >= 2 && `Ready to compare ${selectedIds.length} varieties.`}
          </div>

          <button
            onClick={handleRunComparison}
            className="btn btn-primary"
            disabled={selectedIds.length < 2 || comparing}
            style={{ padding: '0.75rem 1.75rem', fontSize: '1rem' }}
          >
            <Scale size={18} />
            {comparing ? 'Retrieving Comparison Data...' : `Compare Selected Seeds (${selectedIds.length})`}
          </button>
        </div>
      </div>

      {/* STEP 2: Comprehensive Comparison Matrix Output */}
      {comparisonResult && comparisonResult.comparedSeeds && (
        <div className="card fade-in" style={{ padding: '2rem' }}>
          {/* Quick decision banner: show the priority outcome before detailed explanations. */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1.1rem 1.25rem',
            marginBottom: '1.5rem',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #dcfce7 0%, #f0fdf4 100%)',
            border: '2px solid #86c79b'
          }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              background: '#bbf7d0'
            }}>
              <Award size={25} color='#166534' />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
                fontWeight: 800,
                color: '#166534',
                marginBottom: '0.2rem'
              }}>
                Priority pick for your farm
              </div>
              <div style={{
                fontSize: '1.25rem',
                lineHeight: 1.25,
                fontWeight: 800,
                color: 'var(--color-forest-dark)'
              }}>
                {comparisonResult.bestChoiceName || 'Top option to review'}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                {comparisonResult.bestChoiceExplanation || 'This variety ranks first for your farm details.'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', color: 'var(--color-forest-dark)', margin: 0 }}>
                2. Side-by-Side Comparison Matrix
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: '0.25rem 0 0 0' }}>
                Comparing {comparisonResult.comparedSeeds.length} varieties retrieved from MongoDB
              </p>
            </div>

            <button onClick={handleRunComparison} className="btn btn-outline" style={{ fontSize: '0.85rem' }}>
              <RefreshCw size={14} /> Re-evaluate
            </button>
          </div>

          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: '-0.75rem 0 1.25rem 0' }}>
            Relative farm fit—not a guarantee of yield. Confirm seed details and local price before buying.
          </div>

          {/* Meaningful Differences & Trade-offs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
            {/* Meaningful Differences */}
            <div style={{ padding: '1.15rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '0.98rem', color: 'var(--color-forest-dark)', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={16} color="var(--color-forest-mid)" /> Meaningful Differences
              </h4>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.88rem', color: 'var(--color-text-primary)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {comparisonResult.meaningfulDifferences && comparisonResult.meaningfulDifferences.length > 0 ? (
                  comparisonResult.meaningfulDifferences.map((diff, i) => <li key={i}>{diff}</li>)
                ) : (
                  <li>Varieties share closely matching agronomic metrics.</li>
                )}
              </ul>
            </div>

            {/* Agronomic Trade-offs */}
            <div style={{ padding: '1.15rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '0.98rem', color: '#92400e', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <AlertTriangle size={16} color="#d97706" /> Practical Trade-offs
              </h4>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.88rem', color: 'var(--color-text-primary)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {comparisonResult.tradeoffs && comparisonResult.tradeoffs.length > 0 ? (
                  comparisonResult.tradeoffs.map((to, i) => <li key={i}>{to}</li>)
                ) : (
                  <li>No significant operational trade-offs identified.</li>
                )}
              </ul>
            </div>
          </div>

          {/* Detailed Side-by-Side Comparison Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-forest-dark)', color: '#ffffff' }}>
                  <th style={{ padding: '1rem', width: '22%', borderRadius: '8px 0 0 0' }}>Agronomic Dimension</th>
                  {comparisonResult.comparedSeeds.map((seed) => {
                    const isPriority = seed.id === comparisonResult.bestChoiceId;
                    return (
                      <th key={seed.id} style={{ padding: '1rem', width: `${78 / comparisonResult.comparedSeeds.length}%`, backgroundColor: isPriority ? '#166534' : 'var(--color-forest-dark)', boxShadow: isPriority ? 'inset 0 0 0 3px #86efac' : 'none' }}>
                        {isPriority && <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', fontWeight: 800, color: '#dcfce7', background: '#14532d', border: '1px solid #86efac', borderRadius: '999px', padding: '0.2rem 0.55rem', marginBottom: '0.45rem' }}>✓ PRIORITY PICK</div>}
                        <div style={{ fontSize: '1.1rem', fontWeight: '700' }}>{seed.name}</div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.85, fontWeight: '400' }}>{seed.cropType} | {seed.varietyCode}</div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {/* 1. Suitable Soil Types */}
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: '600', backgroundColor: '#f8fafc' }}>
                    <Layers size={14} style={{ verticalAlign: 'text-bottom', marginRight: '0.35rem' }} /> Suitable Soil Types
                  </td>
                  {comparisonResult.comparedSeeds.map((seed) => (
                    <td key={seed.id} style={{ padding: '0.85rem 1rem' }}>
                      {seed.suitableSoilTypes && seed.suitableSoilTypes.length > 0 ? (
                        seed.suitableSoilTypes.join(', ')
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Data not recorded</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* 2. Soil pH Range */}
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: '600', backgroundColor: '#f8fafc' }}>
                    Soil pH Tolerance
                  </td>
                  {comparisonResult.comparedSeeds.map((seed) => (
                    <td key={seed.id} style={{ padding: '0.85rem 1rem' }}>
                      {seed.minPh != null && seed.maxPh != null ? (
                        <strong>{seed.minPh} – {seed.maxPh}</strong>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>pH range unverified</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* 3. Suitable Growing Regions */}
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: '600', backgroundColor: '#f8fafc' }}>
                    Growing Regions
                  </td>
                  {comparisonResult.comparedSeeds.map((seed) => (
                    <td key={seed.id} style={{ padding: '0.85rem 1rem', fontSize: '0.88rem' }}>
                      {seed.suitableRegions && seed.suitableRegions.length > 0 ? (
                        seed.suitableRegions.join(', ')
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Not recorded</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* 4. Growing Seasons */}
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: '600', backgroundColor: '#f8fafc' }}>
                    Growing Seasons
                  </td>
                  {comparisonResult.comparedSeeds.map((seed) => (
                    <td key={seed.id} style={{ padding: '0.85rem 1rem' }}>
                      {seed.growingSeasons && seed.growingSeasons.length > 0 ? (
                        seed.growingSeasons.join(', ')
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>General seasonal</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* 5. Water Requirements & Drought */}
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: '600', backgroundColor: '#f8fafc' }}>
                    <Droplet size={14} style={{ verticalAlign: 'text-bottom', marginRight: '0.35rem' }} /> Water & Drought Tolerance
                  </td>
                  {comparisonResult.comparedSeeds.map((seed) => (
                    <td key={seed.id} style={{ padding: '0.85rem 1rem' }}>
                      <div>Demand: <strong>{seed.waterRequirements || 'Not recorded'}</strong></div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginTop: '0.15rem' }}>
                        Drought Tolerance: {seed.droughtTolerance || 'Not recorded'}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* 6. Irrigation Suitability */}
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: '600', backgroundColor: '#f8fafc' }}>
                    Irrigation Methods
                  </td>
                  {comparisonResult.comparedSeeds.map((seed) => (
                    <td key={seed.id} style={{ padding: '0.85rem 1rem', fontSize: '0.88rem' }}>
                      {seed.suitableIrrigationMethods && seed.suitableIrrigationMethods.length > 0 ? (
                        seed.suitableIrrigationMethods.join(', ')
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Not recorded</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* 7. Growing Duration */}
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: '600', backgroundColor: '#f8fafc' }}>
                    <Clock size={14} style={{ verticalAlign: 'text-bottom', marginRight: '0.35rem' }} /> Maturity Duration
                  </td>
                  {comparisonResult.comparedSeeds.map((seed) => (
                    <td key={seed.id} style={{ padding: '0.85rem 1rem' }}>
                      {seed.maturityDays ? (
                        <strong>{seed.maturityDays} Days</strong>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Trial duration pending</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* 8. Yield Potential */}
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: '600', backgroundColor: '#f8fafc' }}>
                    Yield Potential
                  </td>
                  {comparisonResult.comparedSeeds.map((seed) => (
                    <td key={seed.id} style={{ padding: '0.85rem 1rem' }}>
                      {seed.yieldPotentialQuintalPerAcre ? (
                        <strong style={{ color: 'var(--color-forest-dark)', fontSize: '1.05rem' }}>
                          {seed.yieldPotentialQuintalPerAcre} Q / Acre
                        </strong>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Official yield pending</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Shop / Inventory Availability */}
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: '600', backgroundColor: '#f8fafc' }}>
                    Shop Inventory Data
                  </td>
                  {comparisonResult.comparedSeeds.map((seed) => (
                    <td key={seed.id} style={{ padding: '0.85rem 1rem', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.45rem' }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>
                          Check participating local shops for this variety. Stock and prices may change; confirm with the shop before travelling.
                        </span>
                        <Link to={`/shops?seedId=${encodeURIComponent(seed.id || '')}&query=${encodeURIComponent(seed.name || '')}&productType=SEED`} className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.4rem 0.65rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          Find this seed nearby <ArrowRight size={13} />
                        </Link>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* 11. Key Advantages */}
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: '600', backgroundColor: '#f8fafc' }}>
                    Key Advantages
                  </td>
                  {comparisonResult.comparedSeeds.map((seed) => (
                    <td key={seed.id} style={{ padding: '0.85rem 1rem', fontSize: '0.85rem' }}>
                      <ul style={{ margin: 0, paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {seed.advantages && seed.advantages.length > 0 ? (
                          seed.advantages.map((adv, i) => <li key={i}>{adv}</li>)
                        ) : (
                          <li>Standard agronomic profile</li>
                        )}
                      </ul>
                    </td>
                  ))}
                </tr>

                {/* 12. Disadvantages & Caveats */}
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: '600', backgroundColor: '#f8fafc' }}>
                    Disadvantages & Risks
                  </td>
                  {comparisonResult.comparedSeeds.map((seed) => (
                    <td key={seed.id} style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: '#9a3412' }}>
                      <ul style={{ margin: 0, paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {seed.disadvantages && seed.disadvantages.length > 0 ? (
                          seed.disadvantages.map((dis, i) => <li key={i}>{dis}</li>)
                        ) : (
                          <li>Standard crop care required</li>
                        )}
                      </ul>
                    </td>
                  ))}
                </tr>

                {/* 13. Catalog Links */}
                <tr>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: '600', backgroundColor: '#f8fafc' }}>
                    Full Variety Specs
                  </td>
                  {comparisonResult.comparedSeeds.map((seed) => (
                    <td key={seed.id} style={{ padding: '0.85rem 1rem' }}>
                      <Link to={`/seed-varieties/${seed.id}`} className="btn btn-outline" style={{ fontSize: '0.82rem', padding: '0.35rem 0.75rem' }}>
                        View Variety Details <ExternalLink size={13} />
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompareSeeds;
