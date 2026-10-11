import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle2, ChevronDown, ChevronUp, ClipboardCheck, Info, MapPin } from 'lucide-react';
import api from '../services/api';

const STAGES = [
  {
    id: 'planning', title: 'Planning and crop selection', icon: '🌱',
    why: 'Good planning helps match the crop to your field, water, season, and local conditions.',
    tasks: [
      'Confirm the current season and ask your local agriculture office which crops are recommended for your area.',
      'Consider soil-test results, water availability, drainage, labour, and expected input costs before choosing a crop.',
      'Check recent local weather forecasts and official agricultural advisories before field operations.'
    ],
    caution: 'FarmWise does not determine local suitability from a village name alone. Confirm the final crop choice with a local Krishi Vigyan Kendra (KVK) or agriculture officer.'
  },
  {
    id: 'seed', title: 'Seed selection', icon: '🌾',
    why: 'Choose a variety that fits the local season and field conditions, not only its advertised yield.',
    tasks: [
      'Compare the variety’s verified maturity duration, water needs, and local recommendation where those details are available.',
      'Buy properly labelled seed from a trusted or authorized seller and check the lot, validity, and certification details on the package.',
      'Keep the purchase receipt and seed-package details for your farm records.'
    ],
    caution: 'Variety characteristics and availability can vary. Verify the exact variety and local recommendation before purchase.'
  },
  {
    id: 'soil', title: 'Soil preparation', icon: '🧪',
    why: 'Soil testing helps guide nutrient and soil-management decisions.',
    tasks: [
      'Use a recent soil-test report if available; follow the testing laboratory’s instructions for sampling.',
      'Prepare the field according to the selected crop and local soil and drainage conditions.',
      'Review soil pH and nutrient results before choosing amendments or fertilizer.'
    ],
    caution: 'Do not apply lime, gypsum, or fertilizer based only on a general guide. Use soil-test results and local agronomic advice.'
  },
  {
    id: 'planting', title: 'Sowing or transplanting', icon: '🪴',
    why: 'Correct planting method, timing, depth, and spacing help establish a uniform crop.',
    tasks: [
      'Confirm the recommended planting window for your crop, variety, and locality.',
      'Use the crop-specific sowing or transplanting method recommended by your local agriculture department.',
      'Follow verified seed rate, spacing, and planting-depth guidance for the selected variety; do not guess quantities.'
    ],
    caution: 'For paddy, the correct method depends on whether the field uses direct seeding or transplanting. Follow local crop-specific guidance.'
  },
  {
    id: 'water-nutrients', title: 'Water and nutrient management', icon: '💧',
    why: 'Water and nutrients should match the crop stage, field conditions, and soil-test recommendations.',
    tasks: [
      'Monitor field moisture and drainage, and adjust irrigation to crop needs and local recommendations.',
      'Use soil-test results and the recommended nutrient schedule for the selected crop.',
      'Record irrigation and input applications so you can review costs and crop performance later.'
    ],
    caution: 'No universal fertilizer dose or watering schedule is suitable for every farm. Verify quantities with a soil test and local recommendations.'
  },
  {
    id: 'maintenance', title: 'Crop growth and maintenance', icon: '🌿',
    why: 'Regular observation helps identify tasks that need attention before they affect the whole field.',
    tasks: [
      'Walk through the field regularly and observe crop growth, weeds, waterlogging, and uneven patches.',
      'Carry out weed management using methods appropriate for the crop and its growth stage.',
      'Keep a simple record of field activities, dates, weather, and input use.'
    ],
    caution: 'Use crop-stage timing from trusted local guidance rather than applying the same schedule to every crop.'
  },
  {
    id: 'preventive-care', title: 'Preventive crop care', icon: '🛡️',
    why: 'Monitoring and prevention can help farmers respond responsibly when crop health changes.',
    tasks: [
      'Inspect leaves, stems, roots, and the field for unusual changes during routine visits.',
      'Keep field tools clean and use locally recommended practices that reduce avoidable crop stress.',
      'If unusual symptoms appear, seek identification from a qualified agriculture officer or KVK before selecting a treatment.'
    ],
    caution: 'This section is preventive guidance, not diagnosis. Do not apply pesticides without confirmed identification and label-compliant local advice.'
  },
  {
    id: 'harvest', title: 'Harvesting and storage', icon: '🌾',
    why: 'Harvest timing and careful handling help protect crop quality and reduce avoidable losses.',
    tasks: [
      'Check the crop-specific signs of maturity using trusted local recommendations.',
      'Plan labour, equipment, and safe transport before harvesting.',
      'Dry, handle, and store the harvested crop according to crop-specific moisture and storage guidance.'
    ],
    caution: 'Maturity indicators and safe storage requirements differ by crop. Confirm the correct values for your crop and intended storage.'
  }
];

const CROP_OPTIONS = ['Rice/Paddy', 'Maize', 'Cotton', 'Chilli', 'Other'];
const SEASONS = ['Kharif', 'Rabi', 'Summer', 'Year-round', 'Other'];

const CROP_NOTES = {
  'Rice/Paddy': 'Confirm whether direct seeding or transplanting is recommended locally. Pay special attention to field levelling, water management, weed monitoring, maturity checks, and safe drying after harvest.',
  'Maize': 'Check locally recommended planting method and spacing, provide suitable drainage, monitor weeds during early growth, and confirm crop-specific maturity and grain-drying guidance.',
  'Cotton': 'Choose a locally recommended variety, follow the district crop calendar, monitor the field regularly for pests, and use verified local guidance for nutrient management and picking.',
  'Chilli': 'Use healthy planting material, avoid poorly drained field conditions, monitor crop growth and pest pressure regularly, and confirm locally recommended harvest and drying practices.',
  'Other': 'Crop-specific timing, spacing, water needs, nutrient rates, and harvest indicators are not yet verified for this selection. Confirm the latest recommendations with your local agriculture office or KVK.'
};

const FarmingGuidance = () => {
  const [profile, setProfile] = useState(null);
  const [seedCatalog, setSeedCatalog] = useState([]);
  const [crop, setCrop] = useState('Rice/Paddy');
  const [season, setSeason] = useState('Kharif');
  const [variety, setVariety] = useState('');
  const [openStage, setOpenStage] = useState('planning');
  const [completed, setCompleted] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const loadContext = async () => {
      try {
        const [profileResponse, seedResponse] = await Promise.allSettled([
          api.get('/profile'), api.get('/seeds/catalog')
        ]);
        if (!active) return;
        if (profileResponse.status === 'fulfilled' && profileResponse.value.data?.success) {
          const saved = profileResponse.value.data.data;
          setProfile(saved || null);
          if (saved?.preferredCrop) setCrop(saved.preferredCrop);
          if (saved?.growingSeason) {
            const seasonText = saved.growingSeason.toLowerCase();
            if (seasonText.includes('kharif')) setSeason('Kharif');
            else if (seasonText.includes('rabi')) setSeason('Rabi');
            else if (seasonText.includes('zaid') || seasonText.includes('summer')) setSeason('Summer');
          }
        }
        if (seedResponse.status === 'fulfilled' && seedResponse.value.data?.success) {
          const seeds = seedResponse.value.data.data || [];
          setSeedCatalog(seeds);
          const savedCrop = profileResponse.status === 'fulfilled' ? profileResponse.value.data?.data?.preferredCrop : '';
          const initialVariety = seeds.find(seed => !savedCrop || (seed.cropType || '').toLowerCase().includes(savedCrop.toLowerCase().split('/')[0]));
          if (initialVariety) setVariety(initialVariety.name || initialVariety.varietyCode || '');
        }
      } catch (error) {
        console.error('Could not load farming guidance context:', error);
      } finally {
        if (active) setLoading(false);
      }
    };
    loadContext();
    return () => { active = false; };
  }, []);

  const varietyOptions = useMemo(() => seedCatalog.filter(seed => {
    const type = (seed.cropType || '').toLowerCase();
    const selected = crop.toLowerCase();
    if (selected.includes('rice') || selected.includes('paddy')) return type.includes('rice') || type.includes('paddy');
    if (selected === 'other') return true;
    return type.includes(selected);
  }), [seedCatalog, crop]);

  const storageKey = `farmwise-guidance:${crop}:${season}`;
  useEffect(() => {
    try { setCompleted(JSON.parse(localStorage.getItem(storageKey) || '{}')); }
    catch { setCompleted({}); }
  }, [storageKey]);

  const toggleTask = (stageId, taskIndex) => {
    setCompleted(previous => {
      const next = { ...previous, [`${stageId}-${taskIndex}`]: !previous[`${stageId}-${taskIndex}`] };
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  };

  const completedCount = Object.values(completed).filter(Boolean).length;
  const taskCount = STAGES.reduce((sum, stage) => sum + stage.tasks.length, 0);
  const selectedVariety = varietyOptions.find(seed => (seed.name || seed.varietyCode) === variety);
  const isPaddy = crop.toLowerCase().includes('paddy') || crop.toLowerCase().includes('rice');

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <section style={{ background: 'linear-gradient(135deg, #1b4332, #2d6a4f)', color: '#fff', padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
        <span className="badge" style={{ background: 'rgba(255,255,255,0.18)', color: '#fff', marginBottom: '0.65rem' }}>From planning to harvest</span>
        <h1 style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '0.65rem', margin: '0 0 0.65rem' }}><BookOpen size={30} /> Farming Guidance</h1>
        <p style={{ color: '#e5f4e9', maxWidth: '800px', lineHeight: 1.65, margin: 0 }}>Follow a practical checklist through the growing season. Guidance is kept general where verified local crop-specific recommendations are not available.</p>
      </section>

      <section className="card">
        <h2 style={{ fontSize: '1.2rem', marginBottom: '0.85rem' }}>Your crop and season</h2>
        {profile?.location && <p style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-secondary)', marginTop: 0 }}><MapPin size={16} /> Saved farm location: {profile.location}</p>}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '0.9rem' }}>
          <label className="form-group">Crop
            <select className="form-control" value={crop} onChange={event => { setCrop(event.target.value); setVariety(''); }}>
              {Array.from(new Set([...CROP_OPTIONS, ...(profile?.preferredCrop ? [profile.preferredCrop] : [])])).map(option => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <label className="form-group">Season
            <select className="form-control" value={season} onChange={event => setSeason(event.target.value)}>{SEASONS.map(option => <option key={option}>{option}</option>)}</select>
          </label>
          <label className="form-group">Seed variety (optional)
            <select className="form-control" value={variety} onChange={event => setVariety(event.target.value)}>
              <option value="">Select a variety</option>
              {varietyOptions.map(seed => <option key={seed.id || seed.varietyCode || seed.name} value={seed.name || seed.varietyCode}>{seed.name || seed.varietyCode}</option>)}
            </select>
          </label>
        </div>
        {selectedVariety && <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem', marginBottom: '0.6rem' }}>Selected variety: <strong>{selectedVariety.name || selectedVariety.varietyCode}</strong>. Confirm its local suitability and current package information before planting.</p>}
        <div style={{ marginTop: '0.7rem', padding: '0.85rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', lineHeight: 1.55 }}>
          <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Guidance focus for {crop}</strong>
          <span style={{ fontSize: '0.9rem' }}>{CROP_NOTES[crop] || CROP_NOTES.Other}</span>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', margin: '0.45rem 0 0' }}>Season selected: {season}. Confirm timing with the latest district advisory; the season label alone is not enough to determine planting dates.</p>
        </div>
        {loading && <p style={{ color: 'var(--color-text-muted)', marginBottom: 0 }}>Loading your saved farm details…</p>}
        {!profile && !loading && <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', marginBottom: 0 }}>You can browse this guide without a saved profile. <Link to="/profile">Save your farm profile</Link> to reuse your location, crop, and season details.</p>}
      </section>

      <section className="card" style={{ padding: '1.1rem 1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div><h2 style={{ fontSize: '1.15rem', margin: 0 }}>Season checklist</h2><p style={{ color: 'var(--color-text-secondary)', margin: '0.25rem 0 0', fontSize: '0.88rem' }}>{completedCount} checklist items completed in this crop and season view.</p></div>
          <div style={{ minWidth: '150px', flex: '0 1 220px', background: '#e2e8f0', borderRadius: '999px', height: '8px', overflow: 'hidden' }}><div style={{ height: '100%', width: `${Math.min(100, completedCount / taskCount * 100)}%`, background: 'var(--color-forest-mid)', transition: 'width 0.2s' }} /></div>
        </div>
      </section>

      <section style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {STAGES.map((stage, index) => {
          const isOpen = openStage === stage.id;
          const stageDone = stage.tasks.every((_, taskIndex) => completed[`${stage.id}-${taskIndex}`]);
          return <article key={stage.id} className="card" style={{ padding: 0, overflow: 'hidden', borderLeft: stageDone ? '5px solid #40916c' : '5px solid #d8e6dc' }}>
            <button type="button" onClick={() => setOpenStage(isOpen ? '' : stage.id)} aria-expanded={isOpen} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.85rem', textAlign: 'left', padding: '1.1rem 1.25rem', border: 0, background: '#fff', cursor: 'pointer' }}>
              <span style={{ fontSize: '1.6rem' }}>{stage.icon}</span>
              <span style={{ flex: 1 }}><span style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>Stage {index + 1}</span><strong style={{ color: 'var(--color-forest-dark)', fontSize: '1.05rem' }}>{stage.title}</strong><span style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: '0.86rem', marginTop: '0.2rem' }}>{stage.why}</span></span>
              {stageDone && <CheckCircle2 size={20} color="#2d6a4f" />}{isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {isOpen && <div style={{ padding: '0 1.25rem 1.25rem 1.25rem' }}>
              <h3 style={{ fontSize: '0.98rem', margin: '0.25rem 0 0.65rem' }}>Checklist for {crop}{isPaddy && stage.id === 'planting' ? ' (paddy)' : ''}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {stage.tasks.map((task, taskIndex) => <label key={taskIndex} style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start', cursor: 'pointer', lineHeight: 1.5 }}><input type="checkbox" checked={Boolean(completed[`${stage.id}-${taskIndex}`])} onChange={() => toggleTask(stage.id, taskIndex)} style={{ marginTop: '0.3rem', flexShrink: 0 }} /><span>{task}</span></label>)}
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem', marginTop: '1rem', fontSize: '0.86rem', lineHeight: 1.5 }}><Info size={17} style={{ flexShrink: 0, marginTop: '0.1rem', color: '#2d6a4f' }} /><span>{stage.caution}</span></div>
              {stage.id === 'planning' && <p style={{ fontSize: '0.86rem', margin: '0.8rem 0 0' }}>Need to review your saved details? <Link to="/profile">Open Farm Profile</Link>. To compare seed options, visit <Link to="/recommendations">Recommendations</Link>.</p>}
            </div>}
          </article>;
        })}
      </section>

      <section className="card" style={{ background: '#f8fbf8' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}><ClipboardCheck size={22} color="#2d6a4f" /><div><h2 style={{ fontSize: '1.1rem', margin: '0 0 0.4rem' }}>Use verified local advice</h2><p style={{ color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.6 }}>This checklist is general educational guidance, not a substitute for crop- and location-specific recommendations. For exact sowing dates, spacing, seed rates, fertilizer doses, pest treatment, maturity indicators, and storage conditions, confirm the latest advice with your district agriculture office or nearest Krishi Vigyan Kendra (KVK).</p></div></div>
      </section>
    </div>
  );
};

export default FarmingGuidance;
