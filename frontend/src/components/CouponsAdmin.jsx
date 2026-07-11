import React, { useState, useEffect } from 'react';

export default function CouponsAdmin({ adminToken, products = [], addToast }) {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [editId, setEditId] = useState(null); // If null, we are in "Create" mode
  const [code, setCode] = useState('');
  const [targetProduct, setTargetProduct] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  // Fetch Coupons
  const fetchCoupons = async () => {
    try {
      const r = await fetch('/api/admin/coupons', {
        headers: { 'x-admin-token': adminToken }
      });
      if (r.ok) {
        const data = await r.json();
        setCoupons(data);
      }
    } catch (err) {
      console.error('Failed to fetch coupons:', err);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, [adminToken]);

  // Handle Form Submit (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code || !discountPercentage) {
      addToast('Code and Discount % are required', 'error');
      return;
    }

    setLoading(true);
    const payload = {
      code: code.toUpperCase().trim(),
      targetProduct,
      maxUses: maxUses ? parseInt(maxUses) : 0,
      discountPercentage: parseFloat(discountPercentage),
      expiryDate: expiryDate || null
    };

    try {
      const url = editId ? `/api/admin/coupons/${editId}` : '/api/admin/coupons';
      const method = editId ? 'PUT' : 'POST';

      const r = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken
        },
        body: JSON.stringify(payload)
      });

      const res = await r.json();
      if (res.success) {
        addToast(res.message, 'success');
        resetForm();
        fetchCoupons();
      } else {
        addToast(res.message || 'Operation failed', 'error');
      }
    } catch (err) {
      console.error('Save coupon error:', err);
      addToast('Server error while saving coupon', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Delete Coupon
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    try {
      const r = await fetch(`/api/admin/coupons/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': adminToken }
      });
      const res = await r.json();
      if (res.success) {
        addToast(res.message, 'success');
        fetchCoupons();
        if (editId === id) resetForm();
      } else {
        addToast(res.message || 'Failed to delete coupon', 'error');
      }
    } catch (err) {
      console.error('Delete coupon error:', err);
      addToast('Server error while deleting', 'error');
    }
  };

  // Edit Click Handler
  const handleEditClick = (coupon) => {
    setEditId(coupon._id);
    setCode(coupon.code);
    setTargetProduct(coupon.targetProduct || '');
    setMaxUses(coupon.maxUses || '');
    setDiscountPercentage(coupon.discountPercentage);
    
    if (coupon.expiryDate) {
      // Format Date to YYYY-MM-DD
      const d = new Date(coupon.expiryDate);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      setExpiryDate(`${year}-${month}-${day}`);
    } else {
      setExpiryDate('');
    }
  };

  // Reset Form
  const resetForm = () => {
    setEditId(null);
    setCode('');
    setTargetProduct('');
    setMaxUses('');
    setDiscountPercentage('');
    setExpiryDate('');
  };

  // Helper to find product name by ID
  const getProductName = (id) => {
    const p = products.find(prod => prod.id === id);
    return p ? p.name : id;
  };

  return (
    <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', width: '100%', marginTop: '8px' }}>
      
      {/* LEFT COLUMN: Generate/Edit Coupon Form */}
      <div style={{
        flex: '1 1 380px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: 'var(--shadow-sm)',
        height: 'fit-content'
      }}>
        <h3 style={{ margin: '0 0 20px', color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: '700' }}>
          {editId ? 'Edit Coupon' : 'Generate Coupon'}
        </h3>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Coupon Code
            </label>
            <input
              type="text"
              placeholder="e.g. SUMMER25"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
              required
              disabled={!!editId} // Don't let code change in edit mode for simplicity, or allowed
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Target Product (Optional)
            </label>
            <select
              value={targetProduct}
              onChange={(e) => setTargetProduct(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              <option value="">-- Apply to Generic Cart --</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.id})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Max Uses
              </label>
              <input
                type="number"
                min="0"
                placeholder="0 for unlimited"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Discount %
              </label>
              <input
                type="number"
                min="1"
                max="100"
                placeholder="10"
                value={discountPercentage}
                onChange={(e) => setDiscountPercentage(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Expiry Date
            </label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                background: 'var(--gold-gradient-btn)',
                color: '#fff',
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '0.9rem',
                textAlign: 'center',
                boxShadow: 'var(--shadow-sm)',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Saving...' : editId ? 'Update Coupon' : 'Save Coupon'}
            </button>
            {editId && (
              <button
                type="button"
                onClick={resetForm}
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* RIGHT COLUMN: Active Coupons Table */}
      <div style={{
        flex: '2 1 500px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <h3 style={{ margin: '0 0 20px', color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: '700' }}>
          Active Coupons
        </h3>

        {coupons.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0', margin: 0 }}>
            No coupons generated yet.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  <th style={{ padding: '12px 8px', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Code</th>
                  <th style={{ padding: '12px 8px', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Discount</th>
                  <th style={{ padding: '12px 8px', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Uses</th>
                  <th style={{ padding: '12px 8px', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Expires</th>
                  <th style={{ padding: '12px 8px', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map(coupon => (
                  <tr key={coupon._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 8px' }}>
                      <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{coupon.code}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Applied to:{' '}
                        <span style={{ fontWeight: '500', color: coupon.targetProduct ? 'var(--gold)' : 'var(--text-secondary)' }}>
                          {coupon.targetProduct ? getProductName(coupon.targetProduct) : 'Generic Cart'}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 8px', fontWeight: '700', color: 'var(--text-primary)' }}>
                      {coupon.discountPercentage}%
                    </td>
                    <td style={{ padding: '16px 8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {coupon.uses} / {coupon.maxUses === 0 ? '∞' : coupon.maxUses}
                    </td>
                    <td style={{ padding: '16px 8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : 'Never'}
                    </td>
                    <td style={{ padding: '16px 8px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          onClick={() => handleEditClick(coupon)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '4px',
                            border: '1px solid var(--border)',
                            background: 'var(--bg-primary)',
                            color: 'var(--text-primary)',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(coupon._id)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '4px',
                            border: 'none',
                            background: 'rgba(255, 111, 97, 0.1)',
                            color: '#FF6F61',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
