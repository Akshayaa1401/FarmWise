import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Store, Search, Filter, MapPin, Phone, Package, DollarSign,
  Clock, CheckCircle2, AlertTriangle, AlertCircle, X, ChevronDown,
  ChevronUp, ArrowRight, ShieldCheck, Tag, RefreshCw, ShoppingCart,
  Calendar, Check, Copy, ExternalLink, Info
} from 'lucide-react';

const Shops = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter State
  const [query, setQuery] = useState(() => searchParams.get('query') || '');
  const [locationSearch, setLocationSearch] = useState('');
  const [appliedLocation, setAppliedLocation] = useState('');
  const [cropType, setCropType] = useState('All');
  const [productType, setProductType] = useState(() => searchParams.get('productType') || 'SEED');
  const seedId = searchParams.get('seedId') || '';
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('');
  const [availableCrops, setAvailableCrops] = useState(['All']);
  const [searchTrigger, setSearchTrigger] = useState(0);

  // Reservation Modal State
  const [reservingItem, setReservingItem] = useState(null);
  const [reservingShop, setReservingShop] = useState(null);
  const [reserveQuantity, setReserveQuantity] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [copiedId, setCopiedId] = useState(false);
  const [bookingFarmAreaAcres, setBookingFarmAreaAcres] = useState(null);
  const [bookingProfileLoading, setBookingProfileLoading] = useState(false);
  const [bookingProfileMissing, setBookingProfileMissing] = useState(false);

  const fetchShops = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.append('query', query.trim());
      if (appliedLocation.trim()) params.append('location', appliedLocation.trim());
      if (cropType !== 'All') params.append('cropType', cropType);
      if (productType !== 'All') params.append('productType', productType);
      if (seedId) params.append('seedId', seedId);
      if (inStockOnly) params.append('inStockOnly', 'true');
      if (sortBy) params.append('sortBy', sortBy);

      const res = await api.get(`/shops?${params.toString()}`);
      if (res.data && res.data.success) {
        const data = res.data.data || [];
        setShops(data);

        // Extract crops for filter dropdown
        const crops = new Set(['All']);
        data.forEach(shop => {
          shop.inventoryItems?.forEach(item => {
            if (item.cropType) crops.add(item.cropType);
          });
        });
        setAvailableCrops(Array.from(crops));
      } else {
        setError(res.data?.message || 'Failed to load shops.');
      }
    } catch (err) {
      console.error("Error retrieving shops:", err);
      setError('Failed to retrieve shop listings from MongoDB.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, [cropType, productType, inStockOnly, sortBy, searchTrigger, seedId, appliedLocation]);

  // Compare the same product across the shops returned for the farmer's saved location.
  // This stays inside Shops; seed recommendation/comparison features are not changed.
  const comparableProductOffers = (() => {
    const groups = new Map();
    shops.forEach((shop) => {
      (shop.inventoryItems || []).forEach((item) => {
        const type = String(item.productType || 'SEED').toUpperCase();
        const productName = String(item.productName || item.seedVarietyName || 'Agricultural product').trim();
        const packageSize = String(item.packageSize || '').trim();
        const productIdentity = type === 'SEED' && item.seedVarietyId
          ? `seed:${item.seedVarietyId}:${packageSize.toLowerCase()}`
          : `${type}:${productName.toLowerCase()}:${packageSize.toLowerCase()}`;
        if (!groups.has(productIdentity)) {
          groups.set(productIdentity, { key: productIdentity, name: productName, type, packageSize, offers: [] });
        }
        groups.get(productIdentity).offers.push({ shop, item });
      });
    });
    return Array.from(groups.values())
      .map((group) => ({
        ...group,
        offers: group.offers.sort((a, b) => Number(a.item.price ?? Number.MAX_VALUE) - Number(b.item.price ?? Number.MAX_VALUE))
      }))
      .filter((group) => group.offers.length > 1)
      .sort((a, b) => a.name.localeCompare(b.name));
  })();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setAppliedLocation(locationSearch.trim());
    setSearchTrigger(value => value + 1);
  };

  const handleClearFilters = () => {
    setQuery('');
    setLocationSearch('');
    setAppliedLocation('');
    setCropType('All');
    setProductType('All');
    setInStockOnly(false);
    setSortBy('');
    navigate('/shops');
    setSearchTrigger(value => value + 1);
  };

  const handleOpenReservation = async (shop, item) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setReservingShop(shop);
    setReservingItem(item);
    setReserveQuantity(1);
    setBookingError('');
    setConfirmedBooking(null);
    setBookingFarmAreaAcres(null);
    setBookingProfileMissing(false);

    const productType = String(item.productType || 'SEED').toUpperCase();
    if (productType === 'SEED') {
      setBookingProfileLoading(true);
      try {
        const profileRes = await api.get('/profile');
        const acres = profileRes.data?.success ? Number(profileRes.data.data?.farmAreaAcres) : NaN;
        if (Number.isFinite(acres) && acres > 0) {
          setBookingFarmAreaAcres(acres);
        } else {
          setBookingProfileMissing(true);
        }
      } catch (err) {
        setBookingProfileMissing(true);
      } finally {
        setBookingProfileLoading(false);
      }
    }
  };

  const isSeedReservation = String(reservingItem?.productType || 'SEED').toUpperCase() === 'SEED';
  const maxSeedBags = Number.isFinite(bookingFarmAreaAcres) && bookingFarmAreaAcres > 0
    ? Math.floor((bookingFarmAreaAcres * 4) + 1e-9)
    : null;
  const maxAllowedQuantity = reservingItem
    ? Math.min(Number(reservingItem.currentStock ?? 0), isSeedReservation && maxSeedBags !== null ? maxSeedBags : Number.MAX_SAFE_INTEGER)
    : 0;

  const handleConfirmReservation = async () => {
    if (!reservingItem) return;
    if (reserveQuantity <= 0 || !Number.isInteger(Number(reserveQuantity))) {
      setBookingError('Quantity must be a positive whole number of bags/packages.');
      return;
    }
    if (isSeedReservation && (bookingProfileMissing || maxSeedBags === null)) {
      setBookingError('Save your farm area in Farm Profile before booking seeds.');
      return;
    }
    if (isSeedReservation && Number(reserveQuantity) > maxSeedBags) {
      setBookingError(`Your farm area of ${bookingFarmAreaAcres} acre(s) allows a maximum of ${maxSeedBags} seed bag(s), at 4 bags per acre.`);
      return;
    }

    setBookingLoading(true);
    setBookingError('');
    try {
      const res = await api.post('/bookings', {
        inventoryItemId: reservingItem.id,
        quantity: parseInt(reserveQuantity, 10)
      });

      if (res.data && res.data.success && res.data.data) {
        setConfirmedBooking(res.data.data);
        fetchShops(); // Refresh live stock immediately in the background
      } else {
        setBookingError(res.data?.message || 'Reservation failed.');
      }
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Failed to process product reservation.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCopyBookingId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
        color: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        padding: '2.25rem 2rem',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#ffffff', marginBottom: '0.75rem' }}>
              Agricultural product shops
            </span>
            <h1 style={{ fontSize: '2.1rem', color: '#ffffff', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Store size={32} /> Local Agro Shops & Product Prices
            </h1>
            <p style={{ color: '#d8f3dc', fontSize: '1rem', maxWidth: '850px', lineHeight: '1.6', margin: 0 }}>
              Browse available agricultural products, compare shop prices, and reserve eligible stock for pickup. Check the selected product, price, and availability before travelling.
            </p>
          </div>

          {isAuthenticated && (
            <Link to="/my-bookings" className="btn btn-secondary" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}>
              <Package size={16} /> My Reservations
            </Link>
          )}
        </div>

        {/* Transparency Banner */}
        <div style={{ marginTop: '1.25rem', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.12)', borderRadius: 'var(--radius-sm)', fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e8f5e9' }}>
          <AlertTriangle size={16} style={{ color: '#fde047', flexShrink: 0 }} />
          <span>
            <strong>Before travelling:</strong> Shop listings, prices, and stock come from the records available in FarmWise and should be confirmed with the shop. A reservation is for physical pickup; it is not online payment or courier delivery.
          </span>
        </div>
      </div>

      {searchParams.get('query') && (
        <div style={{ padding: '0.9rem 1rem', borderRadius: 'var(--radius-md)', background: '#eef8ef', border: '1px solid #c5e5ca', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div><strong>Looking for:</strong> {searchParams.get('query')} <span style={{ color: 'var(--color-text-secondary)' }}>— check the shop inventory below before travelling.</span></div>
          <button type="button" className="btn btn-outline" onClick={() => { setQuery(''); navigate('/shops'); }} style={{ fontSize: '0.82rem' }}>Show all shops</button>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search shop, location, or paddy seed variety..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          </div>

          <div style={{ minWidth: '210px', flex: '0 1 230px' }}>
            <input
              type="text"
              className="form-control"
              aria-label="Search shops by area or district"
              placeholder="Area / district (optional)"
              value={locationSearch}
              onChange={(e) => setLocationSearch(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ padding: '0.65rem 1.25rem' }}>
            <Search size={15} /> Search
          </button>

          <select
            className="form-control"
            style={{ width: 'auto', minWidth: '185px' }}
            value={productType}
            onChange={(e) => setProductType(e.target.value)}
          >
            <option value="All">All Product Types</option>
            <option value="SEED">Seeds</option>
            <option value="FERTILIZER">Fertilizers</option>
            <option value="PEST_CONTROL">Pest Control</option>
            <option value="DISEASE_CONTROL">Disease Management</option>
          </select>

          <select
            className="form-control"
            style={{ width: 'auto', minWidth: '160px' }}
            value={cropType}
            onChange={(e) => setCropType(e.target.value)}
          >
            {availableCrops.map(c => <option key={c} value={c}>{c === 'All' ? 'All Crop Types' : c}</option>)}
          </select>

          <select
            className="form-control"
            style={{ width: 'auto', minWidth: '170px' }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="">Sort: Default</option>
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
            <option value="name">Shop Name (A-Z)</option>
            <option value="location">Location (A-Z)</option>
          </select>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.9rem', cursor: 'pointer', margin: '0 0.5rem', userSelect: 'none' }}>
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              style={{ width: '16px', height: '16px' }}
            />
            <strong>In Stock Only</strong>
          </label>

          {(query || locationSearch || cropType !== 'All' || productType !== 'All' || inStockOnly || sortBy) && (
            <button type="button" onClick={handleClearFilters} className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '0.5rem 0.85rem' }}>
              <X size={14} /> Clear
            </button>
          )}
        </form>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertCircle size={20} />
          <div>{error}</div>
        </div>
      )}

      {/* Results Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.92rem', margin: 0 }}>
          Found <strong>{shops.length}</strong> shops matching your location and filters
        </p>

        <button onClick={fetchShops} className="btn btn-outline" style={{ fontSize: '0.82rem', padding: '0.35rem 0.75rem' }}>
          <RefreshCw size={13} /> Refresh Inventory
        </button>
      </div>

      {!loading && shops.some((shop) => shop.demonstrationData) && (
        <div className="alert" style={{ fontSize: '0.88rem' }}>
          Demo data is enabled for development. Shops, locations, stock, and prices marked DEMO ONLY are sample records for testing the nearby-shop and price-comparison workflow, not verified real businesses or live prices. Replace them with verified local shop records before using this for real purchases.
        </div>
      )}

      {/* Same-product price comparison across nearby matching shops */}
      {!loading && comparableProductOffers.length > 0 && (
        <section className="card" style={{ padding: '1.25rem' }}>
          <div style={{ marginBottom: '0.9rem' }}>
            <h2 style={{ margin: 0, color: 'var(--color-forest-dark)', fontSize: '1.2rem' }}>Compare Prices at Nearby Shops</h2>
            <p style={{ margin: '0.35rem 0 0', color: 'var(--color-text-secondary)', fontSize: '0.88rem' }}>
              Prices below are for the same product across shops that match your saved location. Choose a convenient shop and reserve for physical pickup.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.9rem' }}>
            {comparableProductOffers.map((group) => (
              <div key={group.key} style={{ border: '1px solid #dbe5dc', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <div>
                    <strong style={{ color: 'var(--color-forest-dark)' }}>{group.name}</strong>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem', marginTop: '0.2rem' }}>
                      {group.type.replaceAll('_', ' ')}{group.packageSize ? ` · ${group.packageSize}` : ''}
                    </div>
                  </div>
                  <span className="badge badge-sage">{group.offers.length} shops</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.85rem' }}>
                  {group.offers.map(({ shop, item }, index) => (
                    <div key={`${shop.id}:${item.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', paddingTop: '0.6rem', borderTop: '1px solid #edf2ed' }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '0.88rem', fontWeight: 650 }}>{shop.name}</div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>{shop.location}{shop.district ? `, ${shop.district}` : ''}</div>
                        <div style={{ fontSize: '0.78rem', color: Number(item.currentStock || 0) > 0 ? 'var(--color-forest-mid)' : 'var(--color-text-muted)' }}>
                          {Number(item.currentStock || 0) > 0 ? `${item.currentStock} in stock` : 'Out of stock'}
                          {index === 0 && item.price != null ? ' · Lowest listed price' : ''}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <strong style={{ display: 'block', marginBottom: '0.35rem' }}>₹{item.price == null ? 'N/A' : Number(item.price).toFixed(2)}</strong>
                        {Number(item.currentStock || 0) > 0 ? (
                          <button type="button" className="btn btn-primary" style={{ fontSize: '0.76rem', padding: '0.3rem 0.55rem' }} onClick={() => handleOpenReservation(shop, item)}>Reserve</button>
                        ) : (
                          <button type="button" className="btn btn-outline" disabled style={{ fontSize: '0.76rem', padding: '0.3rem 0.55rem' }}>Unavailable</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Shop Cards Grid */}
      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--color-text-muted)' }}>Retrieving persistent inventory records from MongoDB...</p>
        </div>
      ) : shops.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Store size={40} style={{ color: 'var(--color-text-muted)', marginBottom: '0.75rem' }} />
          <h3>No matching shops found</h3>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
            No shop records match your saved location and current filters. Clear filters, or add verified local shop and product inventory records to MongoDB. FarmWise does not create sample shops or prices to fill this list.
          </p>
          <button onClick={handleClearFilters} className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Clear Filters
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {shops.map((shop) => (
            <div
              key={shop.id}
              className="card fade-in"
              style={{
                borderLeft: '5px solid var(--color-forest-mid)',
                padding: '1.75rem'
              }}
            >
              {/* Shop Header Details */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '1.4rem', color: 'var(--color-forest-dark)', margin: 0 }}>
                      {(shop.name || '').replace(/^DEMO ONLY\s*[-:]\s*/i, '')}
                    </h3>

                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.88rem', color: 'var(--color-text-secondary)', marginTop: '0.35rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <MapPin size={14} color="var(--color-earth-mid)" /> {shop.location}, {shop.district}, {shop.state}
                    </span>
                    {shop.contactPhone && !/^not verified$/i.test(shop.contactPhone.trim()) && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Phone size={14} color="var(--color-forest-mid)" /> {shop.contactPhone}
                      </span>
                    )}
                  </div>
                </div>

                {/* Honest Distance Information */}
                <div style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.6rem 1rem',
                  textAlign: 'right'
                }}>
                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: '700' }}>
                    Distance Proximity
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--color-forest-dark)', marginTop: '0.15rem' }}>
                    {shop.distanceInfo}
                  </div>
                </div>
              </div>

              {/* Seed Variety Inventory Table for this Shop */}
              <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '650px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9', color: '#334155', fontSize: '0.85rem' }}>
                      <th style={{ padding: '0.75rem 1rem', borderRadius: '6px 0 0 6px' }}>Product</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Crop Category</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Package Size</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Price</th>
                      <th style={{ padding: '0.75rem 1rem' }}>MongoDB Stock</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right', borderRadius: '0 6px 6px 0' }}>Reservation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shop.inventoryItems && shop.inventoryItems.length > 0 ? (
                      shop.inventoryItems.map((item) => {
                        const inStock = item.currentStock > 0;

                        return (
                          <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0', fontSize: '0.9rem' }}>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <strong style={{ color: 'var(--color-forest-dark)' }}>{item.productName || item.seedVarietyName || 'Agricultural product'}</strong>
                              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{(item.productType || 'SEED') === 'SEED' ? `Code: ${item.varietyCode || 'Not listed'}` : (item.description || item.recommendedFor || 'Check label and local expert guidance')}</div>
                            </td>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <span className="badge badge-earth" style={{ fontSize: '0.75rem' }}>{({ SEED: 'Seed', FERTILIZER: 'Fertilizer', PEST_CONTROL: 'Pest control', DISEASE_CONTROL: 'Disease management' }[item.productType || 'SEED']) || item.productType}</span>
                            </td>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              {item.packageSize || 'Standard pack'}
                            </td>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <strong style={{ fontSize: '1.05rem', color: 'var(--color-forest-dark)' }}>
                                ₹{item.price}
                              </strong>
                            </td>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              {inStock ? (
                                <span className="badge badge-forest" style={{ fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                                  <CheckCircle2 size={12} /> {item.currentStock} Units in Stock
                                </span>
                              ) : (
                                <span className="badge badge-danger" style={{ fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#fee2e2', color: '#991b1b' }}>
                                  <AlertCircle size={12} /> Out of Stock
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
                                {(item.productType || 'SEED') === 'SEED' && item.seedVarietyId && <Link
                                  to={`/seed-varieties/${item.seedVarietyId}`}
                                  className="btn btn-outline"
                                  style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
                                  title="View Variety Details"
                                >
                                  Specs
                                </Link>}

                                {inStock ? (
                                  <button
                                    onClick={() => handleOpenReservation(shop, item)}
                                    className="btn btn-primary"
                                    style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                                  >
                                    Book Now
                                  </button>
                                ) : (
                                  <button
                                    disabled
                                    className="btn btn-outline"
                                    style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', opacity: 0.5, cursor: 'not-allowed' }}
                                  >
                                    Unavailable
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} style={{ padding: '1rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                          No seed inventory matches current filter for this store.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Shop Footer Timestamp */}
              <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                <span>Backend MongoDB Source of Truth</span>
                <span>Last inventory sync: {new Date(shop.lastUpdated).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* RESERVATION MODAL / DRAWER */}
      {reservingItem && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div className="card fade-in" style={{ maxWidth: '540px', width: '100%', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            {!confirmedBooking ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <span className="badge badge-sage" style={{ marginBottom: '0.25rem' }}>Product Reservation</span>
                    <h3 style={{ fontSize: '1.4rem', color: 'var(--color-forest-dark)', margin: 0 }}>
                      {reservingItem.productName || reservingItem.seedVarietyName || 'Agricultural product'}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: '0.2rem 0 0 0' }}>
                      At {reservingShop?.name} ({reservingShop?.location})
                    </p>
                  </div>
                  <button onClick={() => setReservingItem(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                    <X size={20} />
                  </button>
                </div>

                {bookingError && (
                  <div className="alert alert-danger" style={{ fontSize: '0.88rem', marginBottom: '1rem' }}>
                    {bookingError}
                  </div>
                )}

                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span>Package Size:</span>
                    <strong>{reservingItem.packageSize}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span>Price per unit:</span>
                    <strong>₹{reservingItem.price}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span>Available Store Stock:</span>
                    <strong style={{ color: 'var(--color-forest-mid)' }}>{reservingItem.currentStock} units</strong>
                  </div>
                </div>

                {isSeedReservation && (
                  <div className="alert" style={{ marginBottom: '1rem', fontSize: '0.86rem' }}>
                    {bookingProfileLoading ? (
                      'Checking your saved farm acreage…'
                    ) : bookingProfileMissing ? (
                      <span>Save your farm area before booking seeds. <Link to="/profile" style={{ fontWeight: 700, textDecoration: 'underline' }}>Open Farm Profile</Link></span>
                    ) : maxSeedBags < 1 ? (
                      `Your saved area (${bookingFarmAreaAcres} acre(s)) is below the minimum for one whole bag under the 4-bags-per-acre limit.`
                    ) : (
                      <>Maximum seed booking: <strong>{maxSeedBags} bag(s)</strong> for {bookingFarmAreaAcres} acre(s) (4 bags per acre). Available stock: {reservingItem.currentStock}.</>
                    )}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: '700' }}>
                    Enter Reservation Quantity ({isSeedReservation ? 'Bags / Packages' : 'Units'}):
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={maxAllowedQuantity}
                    step="1"
                    className="form-control"
                    value={reserveQuantity}
                    onChange={(e) => setReserveQuantity(e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value, 10) || 1))}
                  />
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.35rem' }}>
                    Total Estimated Cost: <strong>₹{(reservingItem.price * (Number(reserveQuantity) || 0)).toFixed(2)}</strong> (Pay at store upon collection)
                  </div>
                </div>

                <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', fontSize: '0.82rem', color: '#065f46' }}>
                  <Info size={14} style={{ verticalAlign: 'text-bottom', marginRight: '0.3rem' }} />
                  <strong>Stock Guarantee:</strong> Stock will be atomically held in MongoDB upon confirmation. Please collect your reservation within 48 hours.
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button onClick={() => setReservingItem(null)} className="btn btn-outline" disabled={bookingLoading}>
                    Cancel
                  </button>
                  <button onClick={handleConfirmReservation} className="btn btn-primary" disabled={bookingLoading || bookingProfileLoading || !Number.isInteger(Number(reserveQuantity)) || Number(reserveQuantity) < 1 || Number(reserveQuantity) > maxAllowedQuantity || (isSeedReservation && (bookingProfileMissing || maxSeedBags === null || maxSeedBags < 1))}>
                    {bookingLoading ? 'Reserving in MongoDB...' : 'Confirm Reservation'}
                  </button>
                </div>
              </>
            ) : (
              /* SUCCESSFUL BOOKING CONFIRMATION */
              <div className="fade-in">
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <div style={{
                    width: '60px', height: '60px', borderRadius: '50%',
                    backgroundColor: '#dcfce7', color: '#16a34a',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem'
                  }}>
                    <CheckCircle2 size={36} />
                  </div>
                  <h3 style={{ fontSize: '1.5rem', color: 'var(--color-forest-dark)', margin: 0 }}>
                    Booking Confirmed!
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', margin: '0.35rem 0 0 0' }}>
                    Stock has been atomically reserved in MongoDB.
                  </p>
                </div>

                {/* Booking ID Card */}
                <div style={{
                  background: 'linear-gradient(135deg, #1b4332, #2d6a4f)',
                  color: '#ffffff',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.25rem',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.85 }}>
                    Your Unique Booking ID
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: '800', letterSpacing: '1px', margin: '0.35rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    {confirmedBooking.bookingId}
                    <button
                      onClick={() => handleCopyBookingId(confirmedBooking.bookingId)}
                      style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '0.3rem', borderRadius: '4px', cursor: 'pointer' }}
                      title="Copy Booking ID"
                    >
                      {copiedId ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                    Show this Booking ID at the counter to collect your reserved product.
                  </div>
                </div>

                {/* Reservation Summary */}
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: '0.88rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Product:</span>
                    <strong>{confirmedBooking.productName || confirmedBooking.seedVarietyName || 'Agricultural product'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Store:</span>
                    <strong>{confirmedBooking.shopName}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Store Location:</span>
                    <span>{confirmedBooking.shopLocation}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Quantity Reserved:</span>
                    <strong>{confirmedBooking.quantity} units ({confirmedBooking.packageSize})</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Total Cost:</span>
                    <strong style={{ fontSize: '1.05rem', color: 'var(--color-forest-dark)' }}>₹{confirmedBooking.totalAmount}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Date:</span>
                    <span>{new Date(confirmedBooking.bookingDate).toLocaleString()}</span>
                  </div>
                </div>

                {/* Sowing-rate guidance */}
                {confirmedBooking.sowingRateNote && (
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: '0.82rem', color: '#166534' }}>
                    <strong>Agronomic Requirement Check:</strong> {confirmedBooking.sowingRateNote}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between' }}>
                  <button onClick={() => setReservingItem(null)} className="btn btn-outline" style={{ flex: 1 }}>
                    Close
                  </button>
                  <Link to="/my-bookings" className="btn btn-primary" style={{ flex: 1, textAlign: 'center' }}>
                    View My Bookings
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Shops;
