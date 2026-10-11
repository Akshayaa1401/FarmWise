import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Save,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Maximize2,
  Layers,
  Thermometer,
  Droplet,
  Waves,
  Sprout,
  Calendar,
  Compass
} from 'lucide-react';

const SOIL_TYPES = ['Loamy', 'Clay', 'Sandy', 'Silt', 'Peat', 'Chalky'];
const IRRIGATION_METHODS = ['Drip', 'Sprinkler', 'Flood', 'Rainfed', 'Center Pivot'];
const WATER_AVAILABILITIES = ['High', 'Moderate', 'Low', 'Seasonal'];
const PREFERRED_CROPS = ['Rice/Paddy'];
const GROWING_SEASONS = ['Kharif', 'Rabi', 'Zaid', 'Year-Round'];

const FarmProfile = () => {
  const [formData, setFormData] = useState({
    location: '',
    farmAreaAcres: '',
    soilType: 'Loamy',
    soilPh: '',
    irrigationMethod: 'Drip',
    waterAvailability: 'Moderate',
    preferredCrop: 'Rice/Paddy',
    growingSeason: 'Kharif (Rainy Season)',
  });

  const [isExisting, setIsExisting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/profile');
        if (res.data && res.data.success && res.data.data) {
          const profile = res.data.data;
          setFormData({
            location: profile.location || '',
            farmAreaAcres: profile.farmAreaAcres || '',
            soilType: profile.soilType || 'Loamy',
            soilPh: profile.soilPh || '',
            irrigationMethod: profile.irrigationMethod || 'Drip',
            waterAvailability: profile.waterAvailability || 'Moderate',
            preferredCrop: profile.preferredCrop || 'Rice/Paddy',
            growingSeason: profile.growingSeason || 'Kharif (Rainy Season)',
          });
          setIsExisting(true);
        }
      } catch (err) {
        console.error("Error fetching existing farm profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    // Field validation
    if (!formData.location.trim()) {
      setErrorMessage('Farm location is required.');
      return;
    }

    const acres = parseFloat(formData.farmAreaAcres);
    if (isNaN(acres) || acres <= 0) {
      setErrorMessage('Farm area must be a positive number of acres.');
      return;
    }

    const ph = parseFloat(formData.soilPh);
    if (isNaN(ph) || ph < 3.0 || ph > 10.0) {
      setErrorMessage('Soil pH must be between 3.0 and 10.0.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        farmAreaAcres: acres,
        soilPh: ph,
      };

      const res = isExisting
        ? await api.put('/profile', payload)
        : await api.post('/profile', payload);

      if (res.data && res.data.success) {
        setSuccessMessage(isExisting ? 'Farm profile updated successfully in MongoDB!' : 'Farm profile saved successfully in MongoDB!');
        setIsExisting(true);
        setTimeout(() => {
          setSuccessMessage('');
        }, 4000);
      } else {
        setErrorMessage(res.data?.message || 'Failed to save farm profile.');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Server error while saving profile to MongoDB.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Loading farm profile data...</p>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ maxWidth: '840px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div>
          <span className="badge badge-sage" style={{ marginBottom: '0.5rem' }}>
            {isExisting ? 'Update Profile' : 'New Setup'}
          </span>
          <h1 style={{ fontSize: '1.85rem' }}>Farm Profile Configuration</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
            Enter exact agronomic parameters. This helps FarmWise compare seed requirements with your field conditions.
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="alert alert-success">
          <CheckCircle2 size={20} />
          <div>{successMessage}</div>
        </div>
      )}

      {errorMessage && (
        <div className="alert alert-danger">
          <AlertCircle size={20} />
          <div>{errorMessage}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          
          {/* 1. Location */}
          <div className="form-group">
            <label className="form-label" htmlFor="location" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MapPin size={16} style={{ color: 'var(--color-forest-mid)' }} />
              Location / Region *
            </label>
            <input
              id="location"
              name="location"
              type="text"
              className="form-control"
              placeholder="e.g., district, state"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>

          {/* 2. Farm Area in Acres */}
          <div className="form-group">
            <label className="form-label" htmlFor="farmAreaAcres" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Maximize2 size={16} style={{ color: 'var(--color-forest-mid)' }} />
              Farm Area (Acres) *
            </label>
            <input
              id="farmAreaAcres"
              name="farmAreaAcres"
              type="number"
              step="0.1"
              min="0.1"
              className="form-control"
              placeholder="e.g., 12.5"
              value={formData.farmAreaAcres}
              onChange={handleChange}
              required
            />
          </div>

          {/* 3. Soil Type */}
          <div className="form-group">
            <label className="form-label" htmlFor="soilType" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Layers size={16} style={{ color: 'var(--color-forest-mid)' }} />
              Soil Type *
            </label>
            <select
              id="soilType"
              name="soilType"
              className="form-control"
              value={formData.soilType}
              onChange={handleChange}
              required
            >
              {SOIL_TYPES.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* 4. Soil pH */}
          <div className="form-group">
            <label className="form-label" htmlFor="soilPh" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Thermometer size={16} style={{ color: 'var(--color-forest-mid)' }} />
              Soil pH Level (3.0 - 10.0) *
            </label>
            <input
              id="soilPh"
              name="soilPh"
              type="number"
              step="0.1"
              min="3.0"
              max="10.0"
              className="form-control"
              placeholder="e.g., 6.8"
              value={formData.soilPh}
              onChange={handleChange}
              required
            />
          </div>

          {/* 5. Irrigation Method */}
          <div className="form-group">
            <label className="form-label" htmlFor="irrigationMethod" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Droplet size={16} style={{ color: 'var(--color-forest-mid)' }} />
              Irrigation Method *
            </label>
            <select
              id="irrigationMethod"
              name="irrigationMethod"
              className="form-control"
              value={formData.irrigationMethod}
              onChange={handleChange}
              required
            >
              {IRRIGATION_METHODS.map((im) => (
                <option key={im} value={im}>{im}</option>
              ))}
            </select>
          </div>

          {/* 6. Water Availability */}
          <div className="form-group">
            <label className="form-label" htmlFor="waterAvailability" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Waves size={16} style={{ color: 'var(--color-forest-mid)' }} />
              Water Availability *
            </label>
            <select
              id="waterAvailability"
              name="waterAvailability"
              className="form-control"
              value={formData.waterAvailability}
              onChange={handleChange}
              required
            >
              {WATER_AVAILABILITIES.map((wa) => (
                <option key={wa} value={wa}>{wa}</option>
              ))}
            </select>
          </div>

          {/* 7. Preferred Crop */}
          <div className="form-group">
            <label className="form-label" htmlFor="preferredCrop" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sprout size={16} style={{ color: 'var(--color-forest-mid)' }} />
              Preferred Crop *
            </label>
            <select
              id="preferredCrop"
              name="preferredCrop"
              className="form-control"
              value={formData.preferredCrop}
              onChange={handleChange}
              required
            >
              {PREFERRED_CROPS.map((pc) => (
                <option key={pc} value={pc}>{pc}</option>
              ))}
            </select>
          </div>

          {/* 8. Growing Season */}
          <div className="form-group">
            <label className="form-label" htmlFor="growingSeason" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={16} style={{ color: 'var(--color-forest-mid)' }} />
              Growing Season *
            </label>
            <select
              id="growingSeason"
              name="growingSeason"
              className="form-control"
              value={formData.growingSeason}
              onChange={handleChange}
              required
            >
              {GROWING_SEASONS.map((gs) => (
                <option key={gs} value={gs}>{gs}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/dashboard')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            <Save size={18} />
            {submitting ? 'Saving to MongoDB...' : isExisting ? 'Update Farm Profile' : 'Save Farm Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FarmProfile;
