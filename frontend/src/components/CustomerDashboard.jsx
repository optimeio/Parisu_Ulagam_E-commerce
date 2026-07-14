import React, { useEffect, useState, useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { ToastContext } from '../context/ToastContext';
import InvoiceView from './InvoiceView';
import OrderDetailsView from './OrderDetailsView';

const buildTrackingUrl = (link, id) => {
  if (!link) return '';
  let url = link.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }
  if (/\{id\}/i.test(url)) {
    return url.replace(/\{id\}/gi, encodeURIComponent(id));
  }
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('dtdc')) {
    return url + (url.includes('?') ? '&' : '?') + 'txCNNo=' + encodeURIComponent(id);
  }
  if (lowerUrl.includes('delhivery')) {
    return url.replace(/\/$/, '') + '/track/package/' + encodeURIComponent(id);
  }
  if (lowerUrl.includes('bluedart')) {
    return url + (url.includes('?') ? '&' : '?') + 'trackfor=' + encodeURIComponent(id);
  }
  if (lowerUrl.includes('ekart')) {
    return url.replace(/\/$/, '') + '/shipmenttrack/' + encodeURIComponent(id);
  }
  return url;
};


export const CustomerDashboard = ({ user, token, onClose, onLogout, initialTab = 'profile', cartItems = [], wishlist = [], addToCart, removeFromCart, updateQuantity, removeFromWishlist, buyNow, checkoutCart }) => {
  const { getCartKey } = useContext(CartContext);
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [customRequests, setCustomRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [addressFormOpen, setAddressFormOpen] = useState(false);
  const [editAddressIndex, setEditAddressIndex] = useState(null);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [referenceImages, setReferenceImages] = useState([]);
  const { addToast } = React.useContext(ToastContext);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/users/profile', {
        headers: { 'x-user-token': token }
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data);
        return data._id || data.id;
      } else {
        if (res.status === 401 && onLogout) {
          onLogout();
          return null;
        }
        throw new Error(data.message || 'Failed to load profile');
      }
    } catch (err) {
      setError(err.message);
      addToast(err.message, 'error');
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/users/orders', {
        headers: { 'x-user-token': token }
      });
      const data = await res.json();
      if (res.ok) {
        setOrders(data.orders || []);
      } else {
        if (res.status === 401 && onLogout) {
          onLogout();
          return;
        }
        throw new Error(data.message || 'Failed to load orders');
      }
    } catch (err) {
      setError(err.message);
      addToast(err.message, 'error');
    }
  };

  const fetchCustomRequests = async (userId) => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/users/${userId}/custom-requests`, {
        headers: { 'x-user-token': token }
      });
      if (res.ok) {
        const data = await res.json();
        setCustomRequests(data);
      }
    } catch(err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const userId = await fetchProfile();
      await fetchOrders();
      if (userId) {
        await fetchCustomRequests(userId);
      }
      setLoading(false);
    };
    if (token) load();
  }, [token]);

  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const subject = form.subject.value.trim();
    const message = form.message.value.trim();
    if (!name || !email || !message) {
      addToast('Name, Email and Message are required.', 'error');
      return;
    }
    try {
      const res = await fetch('/api/queries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message })
      });
      const data = await res.json();
      if (res.ok) {
        addToast('Query submitted successfully!', 'success');
        form.reset();
      } else {
        throw new Error(data.message || 'Failed to submit query');
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleCustomRequestSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData();
    formData.append('userId', profile._id || profile.id);
    formData.append('customerName', profile.name);
    formData.append('customerEmail', profile.email);
    formData.append('customerPhone', profile.mobile || '');
    formData.append('productType', form.productType.value);
    formData.append('description', form.description.value);
    
    if (referenceImages && referenceImages.length > 0) {
      referenceImages.forEach(img => {
        formData.append('referenceImages', img);
      });
    }

    try {
      const res = await fetch('/api/custom-requests', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        addToast('Custom request submitted successfully! We will contact you soon.', 'success');
        form.reset();
        setReferenceImages([]);
        fetchCustomRequests(profile._id || profile.id);
      } else {
        throw new Error(data.message || 'Failed to submit request');
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const form = e.target;
    const mobile = form.mobile.value.trim();
    const extraDetails = form.extraDetails.value.trim();
    
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-user-token': token },
        body: JSON.stringify({ mobile, extraDetails })
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data.user);
        setEditMode(false);
        addToast('Profile updated successfully', 'success');
      } else {
        throw new Error(data.message || 'Failed to update profile');
      }
    } catch(err) {
      addToast(err.message, 'error');
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    const form = e.target;
    const label = form.label.value.trim();
    const name = form.name.value.trim();
    const phone = form.phone?.value?.trim() || '';
    const addressDetails = form.address.value.trim();
    
    const newAddress = { label, name, phone, address: addressDetails };
    const currentAddresses = profile?.addresses ? [...profile.addresses] : [];
    
    if (editAddressIndex !== null) {
      currentAddresses[editAddressIndex] = newAddress;
    } else {
      currentAddresses.push(newAddress);
    }
    
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-user-token': token },
        body: JSON.stringify({ addresses: currentAddresses })
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data.user);
        setAddressFormOpen(false);
        setEditAddressIndex(null);
        addToast(editAddressIndex !== null ? 'Address updated successfully' : 'Address added successfully', 'success');
      } else {
        throw new Error(data.message || 'Failed to save address');
      }
    } catch(err) {
      addToast(err.message, 'error');
    }
  };

  if (loading) {
    return (
      <div className="admin-layout" style={{ zIndex: 9999, position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--gold)', fontSize: '1.2rem', fontWeight: '500' }}>Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-layout" style={{ zIndex: 9999, position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#FF6F61', marginBottom: '20px' }}>{error}</p>
        <button onClick={onClose} className="secondary-btn">Close</button>
      </div>
    );
  }

  return (
    <div className="admin-layout" style={{ zIndex: 9999, position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'var(--bg-primary)' }}>
      <style>{`
        @keyframes truckBounce { 0% { transform: translateY(0); } 100% { transform: translateY(-6px); } }
        @keyframes truckGlow { 0%,100% { filter: drop-shadow(0 0 4px #f0c84a); } 50% { filter: drop-shadow(0 0 14px #f0c84a); } }
      `}</style>
      <div className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header" style={{ background: 'linear-gradient(135deg, #012a32 0%, #03404c 100%)' }}>
          <div className="brand__logo" style={{width:'40px', height:'40px', fontSize:'0.9rem'}}>
            <img src="/PU.jpeg" alt="Parisu Ulagam" style={{width:'100%', height:'100%'}}/>
          </div>
          <div style={{fontSize:'1.1rem', color:'#FCEDD6', fontWeight:'700', letterSpacing:'0.08em', textTransform:'uppercase', fontFamily:"'Cormorant Garamond', serif", WebkitTextFillColor:'#FCEDD6'}}>My Account</div>
        </div>
        <nav className="admin-sidebar-nav">
          <button className={`admin-nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => { setActiveTab('profile'); setIsSidebarOpen(false); }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'10px'}}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Profile
          </button>
          <button className={`admin-nav-item ${activeTab === 'wishlist' ? 'active' : ''}`} onClick={() => { setActiveTab('wishlist'); setIsSidebarOpen(false); }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'10px'}}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            Wishlist
          </button>
          <button className={`admin-nav-item ${activeTab === 'cart' ? 'active' : ''}`} onClick={() => { setActiveTab('cart'); setIsSidebarOpen(false); }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'10px'}}><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            Cart Dashboard
          </button>
          <button className={`admin-nav-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => { setActiveTab('orders'); setIsSidebarOpen(false); }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'10px'}}><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
            My Orders
          </button>
          <button className={`admin-nav-item ${activeTab === 'queries' ? 'active' : ''}`} onClick={() => { setActiveTab('queries'); setIsSidebarOpen(false); }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'10px'}}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Help & Queries
          </button>
          <button className={`admin-nav-item ${activeTab === 'custom_orders' ? 'active' : ''}`} onClick={() => { setActiveTab('custom_orders'); setIsSidebarOpen(false); }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'10px'}}><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            Custom Orders
          </button>
          
          <div style={{ flex: 1 }} />
          <button className="admin-nav-item" onClick={onClose} style={{ color: '#03404c', borderTop: '1px solid var(--border)', paddingTop: '20px', marginTop: 'auto' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'10px'}}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Continue Shopping
          </button>
          {onLogout && (
            <button className="admin-nav-item" onClick={onLogout} style={{ color: 'var(--text-muted)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'10px'}}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sign Out
            </button>
          )}
        </nav>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div className="admin-header-title">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <button className="hamburger-btn" onClick={() => setIsSidebarOpen(true)}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              </button>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '300' }}>
                {activeTab === 'profile' && 'My Profile'}
                {activeTab === 'wishlist' && 'My Wishlist'}
                {activeTab === 'cart' && 'Cart Dashboard'}
                {activeTab === 'orders' && 'Order History'}
                {activeTab === 'queries' && 'Submit a Query'}
                {activeTab === 'custom_orders' && 'Custom Orders'}
              </h1>
            </div>
          </div>
          <div className="admin-header-actions">
            <span style={{ fontSize: '0.95rem', color: '#ffffff', fontWeight: '500' }}>
              Welcome, <span style={{ color: '#FCEDD6', fontWeight: '700', fontFamily: 'Playfair Display, serif' }}>{profile?.name || 'Customer'}</span>
            </span>
          </div>
        </header>

        <div className="admin-content">
          
          {/* PROFILE */}
          {activeTab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px' }}>
              <div className="admin-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Personal Information</h3>
                  <button onClick={() => setEditMode(!editMode)} className="secondary-btn" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                    {editMode ? 'Cancel Edit' : 'Edit Profile'}
                  </button>
                </div>
                
                {editMode ? (
                  <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div className="admin-form-group">
                      <label>Name</label>
                      <input id="inputField1" name="inputField1" type="text" value={profile?.name || ''} disabled style={{ background: 'var(--bg-secondary)', cursor: 'not-allowed', border: '1px solid var(--border)', padding: '12px', borderRadius: '6px', color: 'var(--text-muted)' }} />
                    </div>
                    <div className="admin-form-group">
                      <label>Email</label>
                      <input id="inputField2" name="inputField2" type="email" value={profile?.email || ''} disabled style={{ background: 'var(--bg-secondary)', cursor: 'not-allowed', border: '1px solid var(--border)', padding: '12px', borderRadius: '6px', color: 'var(--text-muted)' }} />
                    </div>
                    <div className="admin-form-group">
                      <label>Mobile Number</label>
                      <input type="text" name="mobile" defaultValue={profile?.mobile || ''} required style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', padding: '12px', borderRadius: '6px', color: 'var(--text-primary)' }} />
                    </div>
                    <div className="admin-form-group">
                      <label>Preferences / Extra Details</label>
                      <textarea name="extraDetails" defaultValue={profile?.extraDetails || ''} rows={3} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', padding: '12px', borderRadius: '6px', color: 'var(--text-primary)', resize: 'vertical' }}></textarea>
                    </div>
                    <button type="submit" className="primary-btn" style={{ alignSelf: 'flex-start' }}>Save Changes</button>
                  </form>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(90px, 120px) 1fr', gap: '12px 16px', fontSize: '0.9rem', wordBreak: 'break-word' }}>
                    <strong style={{ color: 'var(--text-muted)' }}>Name:</strong>
                    <span>{profile?.name}</span>
                    
                    <strong style={{ color: 'var(--text-muted)' }}>Email:</strong>
                    <span style={{ overflowWrap: 'break-word', wordBreak: 'break-all' }}>{profile?.email}</span>
                    
                    <strong style={{ color: 'var(--text-muted)' }}>Mobile:</strong>
                    <span>{profile?.mobile || 'Not provided'}</span>
                    
                    <strong style={{ color: 'var(--text-muted)' }}>Preferences:</strong>
                    <span>{profile?.extraDetails || 'None'}</span>
                  </div>
                )}
              </div>

              <div className="admin-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>My Addresses</h3>
                  <button onClick={() => {
                    setAddressFormOpen(!addressFormOpen);
                    setEditAddressIndex(null);
                  }} className="secondary-btn" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                    {addressFormOpen ? 'Cancel' : '+ Add Address'}
                  </button>
                  <small style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '6px' }}>Saved addresses will be auto-filled at checkout</small>
                </div>

                {addressFormOpen && (
                  <form onSubmit={handleAddAddress} style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '15px', border: '1px solid var(--border)', borderRadius: '8px', marginBottom: '20px', background: 'var(--bg-secondary)' }}>
                    <div className="admin-form-group">
                      <label>Address Type</label>
                      <input type="text" name="label" list="address-types" defaultValue={editAddressIndex !== null ? profile?.addresses[editAddressIndex]?.label : ''} required placeholder="Select or type (e.g. Home, Office)" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', padding: '12px', borderRadius: '6px', color: 'var(--text-primary)' }} />
                      <datalist id="address-types">
                        <option value="Home 1 Address" />
                        <option value="Home 2 Address" />
                        <option value="Company / Office Address" />
                        <option value="Friend's Address" />
                        <option value="Additional Address" />
                      </datalist>
                    </div>
                    <div className="admin-form-group">
                      <label>Contact Name / Relation</label>
                      <input type="text" name="name" defaultValue={editAddressIndex !== null ? profile?.addresses[editAddressIndex]?.name : ''} required placeholder="e.g. John Doe (Brother)" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', padding: '12px', borderRadius: '6px', color: 'var(--text-primary)' }} />
                    </div>
                    <div className="admin-form-group">
                      <label>Contact Number</label>
                      <input type="text" name="phone" defaultValue={editAddressIndex !== null ? profile?.addresses[editAddressIndex]?.phone : ''} placeholder="e.g. 9876543210" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', padding: '12px', borderRadius: '6px', color: 'var(--text-primary)' }} />
                    </div>
                    <div className="admin-form-group">
                      <label>Address Details</label>
                      <textarea name="address" required rows={3} defaultValue={editAddressIndex !== null ? profile?.addresses[editAddressIndex]?.address : ''} placeholder="Full address, City, Pincode..." style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', padding: '12px', borderRadius: '6px', color: 'var(--text-primary)' }}></textarea>
                    </div>
                    <button type="submit" className="primary-btn" style={{ alignSelf: 'flex-start' }}>{editAddressIndex !== null ? 'Update Address' : 'Save Address'}</button>
                  </form>
                )}

                {profile?.addresses && profile.addresses.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
                    {profile.addresses.map((addr, idx) => (
                      <div key={addr.id || idx} style={{ padding: '15px', border: '1px solid var(--border)', borderRadius: '10px', background: 'var(--bg-primary)', position: 'relative' }}>
                        <div style={{ display: 'inline-block', padding: '4px 8px', background: 'var(--gold)', color: '#000', fontSize: '0.75rem', fontWeight: 'bold', borderRadius: '4px', marginBottom: '10px' }}>{addr.label}</div>
                        <button onClick={() => {
                          setEditAddressIndex(idx);
                          setAddressFormOpen(true);
                        }} style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: 'var(--gold)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}>Edit</button>
                        <div style={{ fontWeight: '600', marginBottom: '5px' }}>{addr.name}</div>
                        {addr.phone && <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '5px' }}>📞 {addr.phone}</div>}
                        <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>📤 {addr.address}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No addresses added yet.</p>
                )}
                
                {profile?.address && (!profile?.addresses || profile.addresses.length === 0) && (
                   <div style={{ marginTop: '15px', padding: '15px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg-primary)' }}>
                     <div style={{ display: 'inline-block', padding: '4px 8px', background: 'var(--gold)', color: '#000', fontSize: '0.75rem', fontWeight: 'bold', borderRadius: '4px', marginBottom: '10px' }}>Primary Address</div>
                     <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>📤 {profile.address}</div>
                   </div>
                )}
              </div>
            </div>
          )}

          {/* WISHLIST */}
          {activeTab === 'wishlist' && (
            <div className="admin-card">
              <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Saved Items ({wishlist.length})</h3>
              {wishlist && wishlist.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                  {wishlist.map((item, wIdx) => (
                    <div key={item.id || wIdx} style={{ border: '1px solid var(--border)', borderRadius: '10px', padding: '15px', textAlign: 'center', background: 'var(--bg-card)', position: 'relative' }}>
                      <img 
                        src={item.image || '/images/hero.png'} 
                        alt={item.name} 
                        style={{ width: '100%', height: 'auto', maxHeight: '200px', objectFit: 'contain', borderRadius: '6px', marginBottom: '10px', cursor: 'pointer' }} 
                        onClick={() => {
                          if (onClose) onClose();
                          window.location.hash = `#/product/${item.id || item.productId || item._id}`;
                        }}
                      />
                      <p style={{ margin: '0 0 5px 0', fontWeight: '500', fontSize: '0.9rem' }}>{item.name}</p>
                      {item.description && (
                        <p style={{ margin: '0 0 8px 0', fontSize: '0.75rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {item.description}
                        </p>
                      )}
                      <p style={{ margin: '0 0 10px', color: 'var(--gold)', fontWeight: '600' }}>₹{item.price?.toLocaleString('en-IN')}</p>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {buyNow && (
                          <button
                            onClick={() => buyNow(item)}
                            style={{ padding: '8px 16px', fontSize: '0.78rem', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase', background: 'var(--gold)', color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s ease' }}
                          >
                            Buy Now
                          </button>
                        )}
                        {addToCart && (
                          <button
                            onClick={() => { addToCart(item, 1); addToast(`${item.name} added to cart!`, 'success'); }}
                            style={{ padding: '8px 16px', fontSize: '0.78rem', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase', background: 'linear-gradient(135deg, #012a32, #03404c)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s ease' }}
                          >
                            Add to Cart
                          </button>
                        )}
                        {removeFromWishlist && (
                          <button
                            onClick={() => { removeFromWishlist(item.id); addToast('Removed from wishlist', 'info'); }}
                            style={{ padding: '8px 16px', fontSize: '0.78rem', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase', background: 'transparent', color: '#FF6F61', border: '1px solid #FF6F61', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s ease' }}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)' }}>Your wishlist is currently empty.</p>
              )}
            </div>
          )}

          {/* CART */}
          {activeTab === 'cart' && (
            <div className="admin-card">
              <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Cart Dashboard ({cartItems.length} items)</h3>
              {cartItems && cartItems.length > 0 ? (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
                    {cartItems.map((item, cIdx) => {
                      const cartKey = getCartKey ? getCartKey(item) : (item._cartKey || item.id);
                      const displayImg = item.selectedImage || item.image;
                      return (
                        <div key={cartKey || cIdx} style={{ display: 'flex', alignItems: 'center', gap: '15px', border: '1px solid var(--border)', padding: '15px', borderRadius: '10px', background: 'var(--bg-card)' }}>
                          <img 
                            src={displayImg || '/images/hero.png'} 
                            alt={item.name} 
                            style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0, cursor: 'pointer' }} 
                            onClick={() => {
                              if (onClose) onClose();
                              window.location.hash = `#/product/${item.id || item.productId || item._id}`;
                            }}
                          />
                          <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, fontWeight: '500' }}>{item.name}</p>
                            {item.selectedImage && item.images && item.images.length > 1 && (
                              <p style={{ margin: '2px 0 0', color: 'var(--gold)', fontSize: '0.72rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 14.7255 3.09032 17.1962 4.85857 19C5.35857 19.5 5.5 20 5.5 20.5C5.5 21.3284 6.17157 22 7 22H12Z"/><circle cx="7.5" cy="10.5" r="1.5"/><circle cx="11.5" cy="7.5" r="1.5"/><circle cx="16.5" cy="9.5" r="1.5"/><circle cx="15.5" cy="14.5" r="1.5"/></svg> Color variant selected
                              </p>
                            )}
                            <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>₹{item.price?.toLocaleString('en-IN')} each</p>
                            {updateQuantity && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                                <button onClick={() => updateQuantity(cartKey, Math.max(1, item.quantity - 1))} style={{ width: '28px', height: '28px', border: '1px solid var(--border)', background: 'var(--bg-primary)', borderRadius: '4px', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '1rem' }}>✕</button>
                                <span style={{ minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                                <button onClick={() => updateQuantity(cartKey, item.quantity + 1)} style={{ width: '28px', height: '28px', border: '1px solid var(--border)', background: 'var(--bg-primary)', borderRadius: '4px', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '1rem' }}>+</button>
                              </div>
                            )}
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: '600', color: 'var(--gold)', fontSize: '1rem' }}>₹{(item.price * item.quantity)?.toLocaleString('en-IN')}</div>
                            {removeFromCart && (
                              <button onClick={() => { removeFromCart(cartKey); addToast('Item removed from cart', 'info'); }} style={{ marginTop: '8px', background: 'none', border: 'none', color: '#FF6F61', cursor: 'pointer', fontSize: '0.8rem' }}>Remove</button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ padding: '15px', background: 'var(--bg-secondary)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                    <strong style={{ fontSize: '1.1rem' }}>Total: <span style={{ color: 'var(--gold)' }}>₹{cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString('en-IN')}</span></strong>
                    {checkoutCart && (
                      <button 
                        onClick={() => checkoutCart()}
                        style={{ padding: '10px 20px', fontSize: '0.85rem', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase', background: 'linear-gradient(135deg, #012a32, #03404c)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s ease' }}
                      >
                        Proceed to Checkout
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <p style={{ color: 'var(--text-muted)' }}>Your cart is empty.</p>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="admin-card">
              <h3 style={{ marginTop: 0, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                My Orders
              </h3>
              {orders.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                  {orders.map((order, oIdx) => {
                    const steps = ['Ordered', 'Packing', 'On the way', 'Delivered'];
                    const statusMap = { 'Payment Verification': 0, 'Packing': 1, 'On the way': 2, 'Delivered': 3 };
                    const isCancelled = order.status === 'Cancelled';
                    const currentStep = isCancelled ? -1 : (statusMap[order.status] ?? 0);
                    const progressPct = (!isCancelled && currentStep >= 0) ? (currentStep / (steps.length - 1)) * 100 : 0;
                    return (
                      <div key={order.orderId || oIdx} style={{ border: '1px solid var(--border)', borderRadius: '16px', background: 'var(--bg-card)', overflow: 'hidden', boxShadow: '0 2px 20px rgba(0,0,0,0.12)' }}>

                        {/* Order Header Bar */}
                        <div style={{ background: 'var(--bg-primary)', padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                          <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap' }}>
                            <div>
                              <p style={{ margin: 0, fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order Placed</p>
                              <p style={{ margin: '2px 0 0', fontSize: '0.85rem', fontWeight: '500' }}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            </div>
                            <div>
                              <p style={{ margin: 0, fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</p>
                              <p style={{ margin: '2px 0 0', fontSize: '0.85rem', fontWeight: '700', color: 'var(--gold)' }}>₹{order.totalAmount?.toLocaleString('en-IN')}</p>
                            </div>
                            <div>
                              <p style={{ margin: 0, fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order ID</p>
                              <p style={{ margin: '2px 0 0', fontSize: '0.78rem', fontFamily: 'monospace', color: 'var(--text-primary)' }}>{order.orderId}</p>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ padding: '5px 13px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '700', background: order.paymentStatus === 'Paid' ? 'rgba(34,197,94,0.15)' : 'rgba(217,119,6,0.15)', color: order.paymentStatus === 'Paid' ? '#16a34a' : '#d97706', border: `1px solid ${order.paymentStatus === 'Paid' ? 'rgba(34,197,94,0.35)' : 'rgba(217,119,6,0.35)'}` }}>
                              {order.paymentStatus === 'Paid' ? '✅ Paid' : '⏳ Pending'}
                            </span>
                            {isCancelled && <span style={{ padding: '5px 13px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '700', background: 'rgba(255, 111, 97,0.12)', color: '#FF6F61', border: '1px solid rgba(255, 111, 97,0.3)' }}>Cancelled</span>}
                          </div>
                        </div>

                        <div style={{ padding: '28px 20px' }}>

                          {/* —— STATUS HEADLINE —— */}
                          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                            {isCancelled ? (
                              <>
                                <h2 style={{ margin: '0 0 6px', fontSize: '1.65rem', fontWeight: '800', color: '#FF6F61' }}>Order Cancelled</h2>
                                <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-muted)' }}>This order has been cancelled.</p>
                              </>
                            ) : (
                              <>
                                <h2 style={{ margin: '0 0 6px', fontSize: '1.65rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                                  {order.status === 'Payment Verification' ? 'Ordered' : order.status}
                                </h2>
                                <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                                  {order.status === 'Payment Verification' && 'We received your order and are verifying your payment.'}
                                  {order.status === 'Packing' && 'Your order is being carefully packed by our team.'}
                                  {order.status === 'On the way' && 'Your package has been dispatched and is on its way to you!'}
                                  {order.status === 'Delivered' && 'Your order has been successfully delivered. Thank you!'}
                                </p>
                              </>
                            )}
                          </div>

                          {/* —— HORIZONTAL STEP TRACKER —— */}
                          {!isCancelled && (
                            <div style={{ marginBottom: '32px', padding: '28px 8px 20px', background: 'var(--bg-primary)', borderRadius: '14px', border: '1px solid var(--border)' }}>
                              <div style={{ position: 'relative' }}>
                                {/* Grey track */}
                                <div style={{
                                  position: 'absolute', top: '17px',
                                  left: `${100 / (steps.length * 2)}%`,
                                  right: `${100 / (steps.length * 2)}%`,
                                  height: '4px', background: 'var(--border)', borderRadius: '4px'
                                }} />
                                {/* Blue fill */}
                                <div style={{
                                  position: 'absolute', top: '17px',
                                  left: `${100 / (steps.length * 2)}%`,
                                  width: `calc(${progressPct * ((steps.length - 1) / steps.length)}%)`,
                                  height: '4px',
                                  background: 'linear-gradient(90deg, #1d4ed8, #3b82f6)',
                                  borderRadius: '4px',
                                  transition: 'width 1.3s cubic-bezier(0.4,0,0.2,1)'
                                }} />
                                {/* Step nodes */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 3 }}>
                                  {steps.map((step, sIdx) => {
                                    const done = sIdx <= currentStep;
                                    const active = sIdx === currentStep;
                                    return (
                                      <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                                        <div style={{
                                          width: '34px', height: '34px', borderRadius: '50%',
                                          background: done ? '#1d4ed8' : 'var(--bg-card)',
                                          border: `3px solid ${done ? '#3b82f6' : 'var(--border)'}`,
                                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                                          color: done ? '#fff' : 'var(--border)',
                                          boxShadow: active ? '0 0 0 7px rgba(59,130,246,0.18)' : 'none',
                                          transition: 'all 0.5s ease'
                                        }}>
                                          {done ? (
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                          ) : (
                                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--border)' }} />
                                          )}
                                        </div>
                                        <span style={{
                                          marginTop: '10px', fontSize: '0.7rem', textAlign: 'center',
                                          fontWeight: active ? '800' : done ? '600' : '400',
                                          color: active ? '#3b82f6' : done ? 'var(--text-primary)' : 'var(--text-muted)',
                                          lineHeight: '1.3', maxWidth: '70px'
                                        }}>{step}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* —— THREE INFO CARDS —— */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '22px' }}>

                            {/* Card 1: Tracking / Shipment */}
                            <div style={{ border: '1px solid var(--border)', borderRadius: '10px', padding: '16px', background: 'var(--bg-primary)' }}>
                              <h4 style={{ margin: '0 0 8px', fontSize: '0.9rem', fontWeight: '700' }}>
                                {order.courierName ? `Shipped with ${order.courierName}` : 'Shipment Info'}
                              </h4>
                              {order.courierTrackingId ? (
                                <>
                                  <p style={{ margin: '0 0 2px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>Tracking ID:</p>
                                  <p style={{ margin: '0 0 10px', fontSize: '0.8rem', fontWeight: '700', fontFamily: 'monospace', color: 'var(--gold)', wordBreak: 'break-all' }}>{order.courierTrackingId}</p>
                                  {order.courierTrackingLink && (
                                    <a
                                      href={buildTrackingUrl(order.courierTrackingLink, order.courierTrackingId)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={() => {
                                        if (navigator.clipboard) {
                                          navigator.clipboard.writeText(order.courierTrackingId)
                                            .then(() => addToast('Tracking ID copied to clipboard!', 'success'))
                                            .catch(err => console.error("Could not copy tracking ID", err));
                                        }
                                      }}
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '7px 14px',
                                        background: 'linear-gradient(135deg, #b5882e 0%, #d4a843 100%)',
                                        color: '#000',
                                        fontWeight: '700',
                                        fontSize: '0.78rem',
                                        borderRadius: '8px',
                                        textDecoration: 'none',
                                        marginBottom: '10px',
                                        boxShadow: '0 2px 8px rgba(212,168,67,0.3)',
                                        transition: 'opacity 0.2s'
                                      }}
                                      onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                                      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                                    >
                                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                                      </svg>
                                      Track Package
                                    </a>
                                  )}
                                </>
                              ) : (
                                <p style={{ margin: '0 0 10px', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                                  Tracking details will appear once your order is dispatched.
                                </p>
                              )}
                              {order.paymentStatus === 'Paid' && (
                                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                                  <button
                                    onClick={() => setSelectedInvoiceOrder(order)}
                                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#2563eb', fontSize: '0.82rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}
                                  >
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                                    View Invoice
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Card 2: Shipping Address */}
                            <div style={{ border: '1px solid var(--border)', borderRadius: '10px', padding: '16px', background: 'var(--bg-primary)' }}>
                              <h4 style={{ margin: '0 0 8px', fontSize: '0.9rem', fontWeight: '700' }}>Shipping Address</h4>
                              {order.customerName && <p style={{ margin: '0 0 4px', fontWeight: '700', fontSize: '0.88rem', textTransform: 'uppercase' }}>{order.customerName}</p>}
                              {order.shippingAddress ? (
                                <p style={{ margin: '0', fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.65', whiteSpace: 'pre-wrap' }}>{order.shippingAddress}</p>
                              ) : (
                                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>N/A</p>
                              )}
                              {order.customerPhone && <p style={{ margin: '6px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ph: {order.customerPhone}</p>}
                            </div>

                            {/* Card 3: Order Info */}
                            <div style={{ border: '1px solid var(--border)', borderRadius: '10px', padding: '16px', background: 'var(--bg-primary)' }}>
                              <h4 style={{ margin: '0 0 10px', fontSize: '0.9rem', fontWeight: '700', color: '#2563eb' }}>Order Info</h4>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem' }}>
                                {order.subtotal > 0 && (
                                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                                    <span>₹{order.subtotal?.toLocaleString('en-IN')}</span>
                                  </div>
                                )}
                                {order.shippingMethod && (
                                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Shipping ({order.shippingMethod})</span>
                                    <span>₹{(order.shippingCharge || 0).toLocaleString('en-IN')}</span>
                                  </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '0.88rem', borderTop: '1px solid var(--border)', paddingTop: '8px', marginTop: '2px' }}>
                                  <span>Grand Total</span>
                                  <span style={{ color: 'var(--gold)' }}>₹{order.totalAmount?.toLocaleString('en-IN')}</span>
                                </div>
                              </div>
                              <div style={{ borderTop: '1px solid var(--border)', marginTop: '12px', paddingTop: '10px' }}>
                                <button
                                  onClick={() => setSelectedOrderDetails(order)}
                                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#2563eb', fontSize: '0.82rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}
                                >
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                                  View order details
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* —— ITEMS IN THIS ORDER —— */}
                          <div style={{ background: 'var(--bg-secondary)', borderRadius: '10px', padding: '14px 16px' }}>
                            <p style={{ margin: '0 0 12px', fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.07em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Items in this order</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              {order.items.map((it, iIdx) => {
                                const itemImg = it.selectedImage || it.image;
                                return (
                                  <div key={iIdx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    {itemImg && (
                                      <img src={itemImg} alt={it.name} style={{ width: '46px', height: '46px', objectFit: 'cover', borderRadius: '7px', border: '1px solid var(--border)', flexShrink: 0 }} />
                                    )}
                                    <div style={{ flex: 1 }}>
                                      <p style={{ margin: 0, fontWeight: '600', fontSize: '0.88rem' }}>{it.name}</p>
                                      <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>Qty: {it.quantity} &nbsp;·&nbsp; ₹{it.price?.toLocaleString('en-IN')} each</p>
                                    </div>
                                    <span style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--gold)', flexShrink: 0 }}>₹{(it.price * it.quantity).toLocaleString('en-IN')}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>You haven't placed any orders yet.</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Start shopping and your orders will appear here!</p>
                </div>
              )}
            </div>
          )}


          {/* QUERIES */}
          {activeTab === 'queries' && (
            <div className="admin-card" style={{ maxWidth: '600px' }}>
              <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Contact Support</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.9rem' }}>Have a question about your order or need custom design assistance? Send us a message.</p>
              <form onSubmit={handleQuerySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div className="admin-form-group">
                  <label>Your Name</label>
                  <input type="text" name="name" defaultValue={profile?.name || ''} required style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', padding: '12px', borderRadius: '6px', color: 'var(--text-primary)' }} />
                </div>
                <div className="admin-form-group">
                  <label>Your Email</label>
                  <input type="email" name="email" defaultValue={profile?.email || ''} required style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', padding: '12px', borderRadius: '6px', color: 'var(--text-primary)' }} />
                </div>
                <div className="admin-form-group">
                  <label>Subject</label>
                  <input type="text" name="subject" placeholder="e.g. Order Status, Custom Wood Engraving..." style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', padding: '12px', borderRadius: '6px', color: 'var(--text-primary)' }} />
                </div>
                <div className="admin-form-group">
                  <label>Message</label>
                  <textarea name="message" rows={5} required placeholder="How can we help you?" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', padding: '12px', borderRadius: '6px', color: 'var(--text-primary)', resize: 'vertical' }}></textarea>
                </div>
                <button type="submit" className="primary-btn" style={{ alignSelf: 'flex-start', marginTop: '10px' }}>
                  Submit Query
                </button>
              </form>
            </div>
          )}

          {/* CUSTOM ORDERS */}
          {activeTab === 'custom_orders' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              <div className="admin-card" style={{ maxWidth: '600px' }}>
                <h3 style={{ marginTop: 0, marginBottom: '8px' }}>Request a Custom Product</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.9rem' }}>
                  Want a customized 3D model, wood engraving, key chain, or jewelry piece? Fill in your requirements and we'll get in touch with you!
                </p>
                <form onSubmit={handleCustomRequestSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div className="admin-form-group">
                    <label>Product Type <span style={{ color: '#FF6F61' }}>*</span></label>
                    <select name="productType" required style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', padding: '12px', borderRadius: '6px', color: 'var(--text-primary)', width: '100%' }}>
                      <option value="">— Select Category —</option>
                      <option value="3D Models">3D Models</option>
                      <option value="Wood Engraving">Wood Engraving</option>
                      <option value="Key Chain">Key Chain</option>
                      <option value="Earrings">Earrings</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label>Requirements Description <span style={{ color: '#FF6F61' }}>*</span></label>
                    <textarea
                      name="description"
                      rows={5}
                      required
                      placeholder="Describe your design, dimensions, text to be engraved, material preferences, quantity, etc."
                      style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', padding: '12px', borderRadius: '6px', color: 'var(--text-primary)', resize: 'vertical', width: '100%' }}
                    ></textarea>
                  </div>
                  <div className="admin-form-group">
                    <label>Reference Images <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Optional, up to 5)</span></label>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      {[0, 1, 2, 3, 4].map(index => {
                        const file = referenceImages[index];
                        const previewUrl = file ? URL.createObjectURL(file) : null;
                        return (
                          <div 
                            key={index}
                            style={{ 
                              width: '80px', height: '80px', 
                              border: file ? 'none' : '2px dashed var(--border)', 
                              borderRadius: '8px', 
                              display: 'flex', alignItems: 'center', justifyContent: 'center', 
                              cursor: 'pointer', position: 'relative', overflow: 'hidden',
                              background: file ? 'transparent' : 'var(--bg-secondary)'
                            }}
                            onClick={() => document.getElementById(`custom-req-img-${index}`).click()}
                          >
                            {previewUrl ? (
                              <>
                                <img src={previewUrl} alt={`Reference ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <button 
                                  type="button" 
                                  onClick={(e) => { 
                                    e.stopPropagation(); 
                                    const newImgs = [...referenceImages]; 
                                    newImgs.splice(index, 1); 
                                    setReferenceImages(newImgs); 
                                    document.getElementById(`custom-req-img-${index}`).value = '';
                                  }} 
                                  style={{ 
                                    position: 'absolute', top: 4, right: 4, 
                                    background: 'rgba(0,0,0,0.6)', color: 'white', 
                                    border: 'none', borderRadius: '50%', 
                                    width: '20px', height: '20px', 
                                    fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer'
                                  }}
                                >✕</button>
                              </>
                            ) : (
                              <span style={{ fontSize: '24px', color: 'var(--text-muted)' }}>+</span>
                            )}
                            <input 
                              id={`custom-req-img-${index}`} 
                              type="file" 
                              accept="image/*" 
                              style={{ display: 'none' }}
                              onChange={e => {
                                if (e.target.files && e.target.files[0]) {
                                  const newImgs = [...referenceImages];
                                  newImgs[index] = e.target.files[0];
                                  setReferenceImages(newImgs.filter(Boolean));
                                }
                              }} 
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <button type="submit" className="primary-btn" style={{ alignSelf: 'flex-start', marginTop: '10px' }}>
                    	 Submit Request
                  </button>
                </form>
              </div>

              {customRequests.length > 0 && (
                <div className="admin-card" style={{ maxWidth: '800px' }}>
                  <h3 style={{ marginTop: 0, marginBottom: '20px' }}>My Past Requests</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {customRequests.map((req, idx) => (
                      <div key={req._id || idx} style={{ border: '1px solid var(--border)', padding: '16px', borderRadius: '10px', background: 'var(--bg-secondary)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <strong style={{ color: 'var(--gold)', fontSize: '1rem' }}>{req.productType}</strong>
                          <span style={{
                            fontSize: '0.75rem', padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold', color: '#fff',
                            background: req.status === 'Completed' ? '#059669' : req.status === 'Cancelled' ? '#dc2626' : req.status === 'Processing' ? '#2563eb' : req.status === 'Reviewed' ? '#7c3aed' : '#d97706'
                          }}>
                            {req.status}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '10px', lineHeight: '1.5' }}>{req.description}</p>
                        {req.referenceImages?.length > 0 && (
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                            {req.referenceImages.map((img, i) => (
                              <img key={i} src={img} alt={`Ref ${i + 1}`} style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border)', cursor: 'pointer' }} onClick={() => window.open(img, '_blank')} />
                            ))}
                          </div>
                        )}
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Submitted on: {new Date(req.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      {selectedInvoiceOrder && (
        <InvoiceView order={selectedInvoiceOrder} onClose={() => setSelectedInvoiceOrder(null)} />
      )}
      {selectedOrderDetails && (
        <OrderDetailsView
          order={selectedOrderDetails}
          token={token}
          onClose={() => setSelectedOrderDetails(null)}
          onOrderUpdate={() => { setSelectedOrderDetails(null); fetchProfile(); }}
          onViewInvoice={(order) => { setSelectedOrderDetails(null); setSelectedInvoiceOrder(order); }}
          onContactSupport={() => { setSelectedOrderDetails(null); setActiveTab('queries'); }}
        />
      )}
    </div>
  );
};

export default CustomerDashboard;
