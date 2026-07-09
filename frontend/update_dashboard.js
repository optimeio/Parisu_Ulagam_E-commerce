const fs = require('fs');

let content = fs.readFileSync('c:\\\\Parisu Ulagam\\\\frontend\\\\src\\\\components\\\\CustomerDashboard.jsx', 'utf8');

// Add states and functions
const states_str =   const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const { addToast } = React.useContext(ToastContext);;

const new_states_str =   const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [addressFormOpen, setAddressFormOpen] = useState(false);
  const { addToast } = React.useContext(ToastContext);

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
        throw new Error(data.message);
      }
    } catch(err) {
      addToast(err.message, 'error');
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    const form = e.target;
    const label = form.label.value;
    const name = form.name.value.trim();
    const addressDetails = form.address.value.trim();
    
    const newAddress = { label, name, address: addressDetails };
    const currentAddresses = profile?.addresses || [];
    const updatedAddresses = [...currentAddresses, newAddress];
    
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-user-token': token },
        body: JSON.stringify({ addresses: updatedAddresses })
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data.user);
        setAddressFormOpen(false);
        addToast('Address added successfully', 'success');
      } else {
        throw new Error(data.message);
      }
    } catch(err) {
      addToast(err.message, 'error');
    }
  };;

content = content.replace(states_str, new_states_str);

// Sidebar and Overlay
const sidebar_str =     <div className="admin-layout" style={{ zIndex: 9999, position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'var(--bg-primary)' }}>
      <aside className="admin-sidebar">;

const new_sidebar_str =     <div className="admin-layout" style={{ zIndex: 9999, position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'var(--bg-primary)' }}>
      <div className={\sidebar-overlay \\} onClick={() => setIsSidebarOpen(false)}></div>
      <aside className={\dmin-sidebar \\}>;

content = content.replace(sidebar_str, new_sidebar_str);

// Add Hamburger button
const header_title_str = <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '300' }}>;
const new_header_title_str = <div style={{ display: 'flex', alignItems: 'center' }}>
              <button className="hamburger-btn" onClick={() => setIsSidebarOpen(true)}>?</button>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '300' }}>;
content = content.replace(header_title_str, new_header_title_str);

const header_title_close_str = </h1>
          </div>;
const new_header_title_close_str = </h1>
            </div>
          </div>;
content = content.replace(header_title_close_str, new_header_title_close_str);

// Update onClick handlers in nav
content = content.replaceAll("setActiveTab('profile')", "setActiveTab('profile'); setIsSidebarOpen(false);");
content = content.replaceAll("setActiveTab('wishlist')", "setActiveTab('wishlist'); setIsSidebarOpen(false);");
content = content.replaceAll("setActiveTab('cart')", "setActiveTab('cart'); setIsSidebarOpen(false);");
content = content.replaceAll("setActiveTab('orders')", "setActiveTab('orders'); setIsSidebarOpen(false);");
content = content.replaceAll("setActiveTab('queries')", "setActiveTab('queries'); setIsSidebarOpen(false);");

// Profile UI update
const profile_ui_str = {/* PROFILE */}
          {activeTab === 'profile' && (
            <div className="admin-card" style={{ maxWidth: '600px' }}>
              <h3 style={{ marginTop: 0, marginBottom: '20px', color: 'var(--text-primary)' }}>Personal Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '15px', fontSize: '0.95rem' }}>
                <strong style={{ color: 'var(--text-muted)' }}>Name:</strong>
                <span>{profile?.name}</span>
                
                <strong style={{ color: 'var(--text-muted)' }}>Email:</strong>
                <span>{profile?.email}</span>
                
                <strong style={{ color: 'var(--text-muted)' }}>Mobile:</strong>
                <span>{profile?.mobile || 'Not provided'}</span>
                
                <strong style={{ color: 'var(--text-muted)' }}>Address:</strong>
                <span>{profile?.address || 'No address added yet'}</span>
                
                <strong style={{ color: 'var(--text-muted)' }}>Preferences:</strong>
                <span>{profile?.extraDetails || 'None'}</span>
              </div>
            </div>
          )};

const new_profile_ui_str = {/* PROFILE */}
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
                      <input type="text" value={profile?.name || ''} disabled style={{ background: 'var(--bg-secondary)', cursor: 'not-allowed', border: '1px solid var(--border)', padding: '12px', borderRadius: '6px', color: 'var(--text-muted)' }} />
                    </div>
                    <div className="admin-form-group">
                      <label>Email</label>
                      <input type="email" value={profile?.email || ''} disabled style={{ background: 'var(--bg-secondary)', cursor: 'not-allowed', border: '1px solid var(--border)', padding: '12px', borderRadius: '6px', color: 'var(--text-muted)' }} />
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
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '15px', fontSize: '0.95rem' }}>
                    <strong style={{ color: 'var(--text-muted)' }}>Name:</strong>
                    <span>{profile?.name}</span>
                    
                    <strong style={{ color: 'var(--text-muted)' }}>Email:</strong>
                    <span>{profile?.email}</span>
                    
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
                  <button onClick={() => setAddressFormOpen(!addressFormOpen)} className="secondary-btn" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                    {addressFormOpen ? 'Cancel' : '+ Add Address'}
                  </button>
                </div>

                {addressFormOpen && (
                  <form onSubmit={handleAddAddress} style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '15px', border: '1px solid var(--border)', borderRadius: '8px', marginBottom: '20px', background: 'var(--bg-secondary)' }}>
                    <div className="admin-form-group">
                      <label>Address Type</label>
                      <select name="label" required style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', padding: '12px', borderRadius: '6px', color: 'var(--text-primary)' }}>
                        <option value="Home 1 Address">Home 1 Address</option>
                        <option value="Home 2 Address">Home 2 Address</option>
                        <option value="Company / Office Address">Company / Office Address</option>
                        <option value="Friend's Address">Friend's Address</option>
                        <option value="Additional Address">Additional Address</option>
                      </select>
                    </div>
                    <div className="admin-form-group">
                      <label>Contact Name / Relation</label>
                      <input type="text" name="name" required placeholder="e.g. John Doe (Brother)" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', padding: '12px', borderRadius: '6px', color: 'var(--text-primary)' }} />
                    </div>
                    <div className="admin-form-group">
                      <label>Address Details</label>
                      <textarea name="address" required rows={3} placeholder="Full address, City, Pincode..." style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', padding: '12px', borderRadius: '6px', color: 'var(--text-primary)' }}></textarea>
                    </div>
                    <button type="submit" className="primary-btn" style={{ alignSelf: 'flex-start' }}>Save Address</button>
                  </form>
                )}

                {profile?.addresses && profile.addresses.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
                    {profile.addresses.map((addr, idx) => (
                      <div key={idx} style={{ padding: '15px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg-primary)' }}>
                        <div style={{ display: 'inline-block', padding: '4px 8px', background: 'var(--gold)', color: '#000', fontSize: '0.75rem', fontWeight: 'bold', borderRadius: '4px', marginBottom: '10px' }}>{addr.label}</div>
                        <div style={{ fontWeight: '600', marginBottom: '5px' }}>{addr.name}</div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{addr.address}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No addresses added yet.</p>
                )}
                
                {profile?.address && (!profile?.addresses || profile.addresses.length === 0) && (
                   <div style={{ marginTop: '15px', padding: '15px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg-primary)' }}>
                     <div style={{ display: 'inline-block', padding: '4px 8px', background: 'var(--gold)', color: '#000', fontSize: '0.75rem', fontWeight: 'bold', borderRadius: '4px', marginBottom: '10px' }}>Legacy Address</div>
                     <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{profile.address}</div>
                   </div>
                )}
              </div>
            </div>
          )};

content = content.replace(profile_ui_str, new_profile_ui_str);

fs.writeFileSync('c:\\\\Parisu Ulagam\\\\frontend\\\\src\\\\components\\\\CustomerDashboard.jsx', content, 'utf8');
console.log("Updated CustomerDashboard.jsx successfully.");
