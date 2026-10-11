import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  History, UserCheck, Calendar, Clock, Layers, Droplet,
  MapPin, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, RefreshCw
} from 'lucide-react';

const FarmMemory = () => {
  const [memoryData, setMemoryData] = useState(null);
  const [seedOptions, setSeedOptions] = useState([]);
  const [customSeedName, setCustomSeedName] = useState('');
  const [useCustomSeed, setUseCustomSeed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [filterType, setFilterType] = useState('ALL');
  const [harvestForm, setHarvestForm] = useState({ seedName: '', season: 'Kharif', cultivatedAreaAcres: '', yieldQuintalPerAcre: '', harvestOutcome: 'MODERATE', profitLevel: 'UNKNOWN', notes: '' });
  const [saveMessage, setSaveMessage] = useState('');
  const [savingHarvest, setSavingHarvest] = useState(false);

  const fetchFarmMemory = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/farm-memory');
      if (res.data && res.data.success) {
        setMemoryData(res.data.data);
      } else {
        setError(res.data?.message || 'Failed to load Farm Memory.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load farm history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmMemory();
    fetchSeedOptions();
  }, []);

  const fetchSeedOptions = async () => {
    try {
      const res = await api.get('/seeds/catalog');
      if (res.data?.success && Array.isArray(res.data.data)) {
        const unique = new Map();
        res.data.data.forEach(seed => {
          if (seed?.name?.trim()) unique.set(seed.name.trim().toLowerCase(), seed.name.trim());
        });
        setSeedOptions(Array.from(unique.values()).sort((a, b) => a.localeCompare(b)));
      }
    } catch (err) {
      console.error('Could not load seed catalog for Farm Memory:', err);
    }
  };

  const submitHarvest = async (event) => {
    event.preventDefault(); setSavingHarvest(true); setSaveMessage(''); setError('');
    try {
      const selectedSeedName = useCustomSeed ? customSeedName.trim() : harvestForm.seedName.trim();
      if (!selectedSeedName) { setError('Choose a seed variety from the catalog or enter a variety name.'); setSavingHarvest(false); return; }
      if (harvestForm.cultivatedAreaAcres.trim() === '' || harvestForm.yieldQuintalPerAcre.trim() === '') {
        setError('Enter both cultivated area and yield before saving the harvest experience.');
        setSavingHarvest(false);
        return;
      }
      const area = Number(harvestForm.cultivatedAreaAcres);
      const yieldPerAcre = Number(harvestForm.yieldQuintalPerAcre);
      if (!Number.isFinite(area) || area <= 0 || !Number.isFinite(yieldPerAcre) || yieldPerAcre < 0) {
        setError('Cultivated area must be greater than zero, and yield must be zero or greater.');
        setSavingHarvest(false);
        return;
      }
      const payload = { ...harvestForm, seedName: selectedSeedName, cultivatedAreaAcres: area, yieldQuintalPerAcre: yieldPerAcre };
      const res = await api.post('/farm-memory/harvest', payload);
      if (res.data?.success) { setSaveMessage('Harvest experience saved.'); setHarvestForm({ seedName: '', season: 'Kharif', cultivatedAreaAcres: '', yieldQuintalPerAcre: '', harvestOutcome: 'MODERATE', profitLevel: 'UNKNOWN', notes: '' }); setCustomSeedName(''); setUseCustomSeed(false); await fetchFarmMemory(); }
      else setError(res.data?.message || 'Could not save harvest experience.');
    } catch (err) { setError(err.response?.data?.message || 'Could not save harvest experience.'); }
    finally { setSavingHarvest(false); }
  };

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };


  const availableHistory = (memoryData?.history || []).filter(item => item.actionType !== 'CROP_PROBLEM');
  const filteredHistory = filterType === 'ALL'
    ? availableHistory
    : availableHistory.filter(item => item.actionType === filterType);

  if (loading) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3.5rem' }}>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>
          Loading Farm Memory records from MongoDB...
        </p>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1b4332, #2d6a4f)',
        color: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        padding: '2rem',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#ffffff', marginBottom: '0.75rem' }}>
            Your harvest records
          </span>
          <h1 style={{ fontSize: '2rem', color: '#ffffff', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <History size={28} /> Farm Memory
          </h1>
          <p style={{ color: '#d8f3dc', fontSize: '1rem', maxWidth: '750px', margin: 0 }}>
            Keep your cultivation notes and harvest outcomes together to support future farming decisions.
          </p>
        </div>
        <button onClick={fetchFarmMemory} className="btn btn-secondary" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}>
          <RefreshCw size={15} /> Refresh Memory
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Current Saved Profile Overview */}
      <div className="card" style={{ borderLeft: '5px solid var(--color-forest-mid)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h2 style={{ fontSize: '1.3rem', color: 'var(--color-forest-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <UserCheck size={20} color="var(--color-forest-mid)" /> Current Active Farm Profile
          </h2>
          <Link to="/profile" className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}>
            Update Profile
          </Link>
        </div>

        {memoryData?.currentProfile ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', background: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block' }}>Location & Size</span>
              <strong><MapPin size={13} style={{ verticalAlign: 'text-bottom' }} /> {memoryData.currentProfile.location}</strong>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{memoryData.currentProfile.farmAreaAcres} Acres</div>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block' }}>Soil & pH</span>
              <strong><Layers size={13} style={{ verticalAlign: 'text-bottom' }} /> {memoryData.currentProfile.soilType}</strong>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>pH {memoryData.currentProfile.soilPh}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block' }}>Water & Irrigation</span>
              <strong><Droplet size={13} style={{ verticalAlign: 'text-bottom' }} /> {memoryData.currentProfile.irrigationMethod}</strong>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Availability: {memoryData.currentProfile.waterAvailability}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block' }}>Crop Preference & Season</span>
              <strong>🌾 {memoryData.currentProfile.preferredCrop}</strong>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}><Calendar size={13} style={{ verticalAlign: 'text-bottom' }} /> {memoryData.currentProfile.growingSeason}</div>
            </div>
          </div>
        ) : (
          <div style={{ padding: '1.5rem', textAlign: 'center', background: '#f8fafc', borderRadius: 'var(--radius-md)' }}>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '0.75rem' }}>No farm profile has been created yet.</p>
            <Link to="/profile" className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
              Create Farm Profile
            </Link>
          </div>
        )}
      </div>

      <form className="card" onSubmit={submitHarvest}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Record a Harvest Experience</h2>
        {saveMessage && <div className="alert alert-success">{saveMessage}</div>}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <label className="form-group">Paddy seed variety
            <select className="form-control" value={useCustomSeed ? '__custom__' : harvestForm.seedName} onChange={e => { const value = e.target.value; setUseCustomSeed(value === '__custom__'); setHarvestForm({ ...harvestForm, seedName: value === '__custom__' ? '' : value }); }} required>
              <option value="">Choose a variety from available seed data</option>
              {seedOptions.map(name => <option key={name} value={name}>{name}</option>)}
              <option value="__custom__">Other / not listed — enter manually</option>
            </select>
            {useCustomSeed && <input className="form-control" style={{ marginTop: '0.5rem' }} required value={customSeedName} onChange={e => setCustomSeedName(e.target.value)} placeholder="Enter seed variety name" />}
            {!seedOptions.length && <small style={{ color: 'var(--color-text-muted)' }}>Catalog could not be loaded. You can enter a variety manually.</small>}
          </label>
          <label className="form-group">Season<select className="form-control" value={harvestForm.season} onChange={e => setHarvestForm({ ...harvestForm, season: e.target.value })}><option>Kharif</option><option>Rabi</option><option>Summer</option><option>Other</option></select></label>
          <label className="form-group">Cultivated area (acres)<input className="form-control" type="number" min="0.01" step="0.01" required value={harvestForm.cultivatedAreaAcres} onChange={e => setHarvestForm({ ...harvestForm, cultivatedAreaAcres: e.target.value })} /></label>
          <label className="form-group">Yield (quintals per acre)<input className="form-control" type="number" min="0" step="0.01" required value={harvestForm.yieldQuintalPerAcre} onChange={e => setHarvestForm({ ...harvestForm, yieldQuintalPerAcre: e.target.value })} /></label>
          <label className="form-group">Harvest outcome<select className="form-control" value={harvestForm.harvestOutcome} onChange={e => setHarvestForm({ ...harvestForm, harvestOutcome: e.target.value })}><option value="GOOD">Good</option><option value="MODERATE">Moderate</option><option value="LOW">Low</option></select></label>
          <label className="form-group">Profit level<select className="form-control" value={harvestForm.profitLevel} onChange={e => setHarvestForm({ ...harvestForm, profitLevel: e.target.value })}><option value="UNKNOWN">Not recorded</option><option value="PROFIT">Profit</option><option value="BREAK_EVEN">Break-even</option><option value="LOSS">Loss</option></select></label>
          <label className="form-group" style={{ gridColumn: '1 / -1' }}>Notes (optional)<textarea className="form-control" rows="2" value={harvestForm.notes} onChange={e => setHarvestForm({ ...harvestForm, notes: e.target.value })} placeholder="Weather, pests, input costs, or other observations" /></label>
        </div>
        <button type="submit" className="btn btn-primary" disabled={savingHarvest}>{savingHarvest ? 'Saving…' : 'Save Harvest Experience'}</button>
      </form>

      {/* Historical Audit Trail */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--color-forest-dark)', margin: 0 }}>
              Farm Memory History
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: '0.25rem 0 0 0' }}>
              Saved farm records stored in MongoDB ({filteredHistory.length} events)
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setFilterType('ALL')}
              className={`btn ${filterType === 'ALL' ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
            >
              All Records
            </button>
            <button
              onClick={() => setFilterType('HARVEST_EXPERIENCE')}
              className={`btn ${filterType === 'HARVEST_EXPERIENCE' ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
            >
              Harvest Experiences
            </button>
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--color-text-muted)' }}>
            <History size={36} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
            <p>No saved memory records found yet.</p>
            <p style={{ fontSize: '0.85rem' }}>Your saved farm records and harvest experiences will appear here.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filteredHistory.map((item, index) => (
              <div
                key={item.id || index}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  backgroundColor: '#ffffff',
                  transition: 'background-color 0.15s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', cursor: 'pointer' }} onClick={() => toggleExpand(index)}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <div style={{
                      marginTop: '0.2rem',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: '#e8f5e9',
                      color: '#2e7d32',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <CheckCircle2 size={16} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <strong style={{ fontSize: '0.98rem', color: 'var(--color-forest-dark)' }}>{item.title}</strong>
                        <span className="badge" style={{ fontSize: '0.7rem', background: '#f1f5f9', color: '#475569' }}>
                          {item.actionType}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', margin: '0.3rem 0 0 0' }}>
                        {item.summary}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', whiteSpace: 'nowrap' }}>
                      <Clock size={13} /> {new Date(item.timestamp).toLocaleString()}
                    </span>
                    {expandedIndex === index ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                {/* Expanded Historical Snapshot Details */}
                {expandedIndex === index && item.snapshotData && (
                  <div style={{ marginTop: '0.85rem', paddingTop: '0.85rem', borderTop: '1px dashed #e2e8f0', background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: '0.4rem', fontWeight: '600' }}>
                      RECORD DETAILS (Saved in MongoDB):
                    </div>
                    <pre style={{ margin: 0, fontSize: '0.82rem', color: '#334155', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                      {JSON.stringify(item.snapshotData, null, 2)}
                    </pre>

                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmMemory;
