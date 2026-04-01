import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import ProductCard from '../../components/ProductCard/ProductCard';
import { User as UserIcon, ShoppingBag, MapPin, Heart, HelpCircle, RotateCcw, Store, Edit2, Package, LogOut } from 'lucide-react';
import axios from 'axios';
import './Profile.css';

const TABS = [
  { id: 'profile', label: 'My Profile', icon: UserIcon },
  { id: 'orders', label: 'My Orders', icon: ShoppingBag },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'favstores', label: 'Favorite Stores', icon: Store },
  { id: 'help', label: 'Help & Support', icon: HelpCircle },
  { id: 'refunds', label: 'Refunds', icon: RotateCcw },
];

function Profile() {
  const { user, logout, API, getAuthHeaders, stores } = useApp();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  useEffect(() => {
    if (activeTab === 'orders') fetchOrders();
    if (activeTab === 'addresses') fetchAddresses();
    if (activeTab === 'wishlist') fetchWishlist();
  }, [activeTab]);

  const fetchOrders = async () => {
    try { const res = await axios.get(`${API}/orders`, { headers: getAuthHeaders() }); setOrders(res.data.orders || []); } catch (e) { console.error(e); }
  };
  const fetchAddresses = async () => {
    try { const res = await axios.get(`${API}/user/addresses`, { headers: getAuthHeaders() }); setAddresses(res.data.addresses || []); } catch (e) { console.error(e); }
  };
  const fetchWishlist = async () => {
    try { const res = await axios.get(`${API}/user/wishlist`, { headers: getAuthHeaders() }); setWishlist(res.data.wishlist || []); } catch (e) { console.error(e); }
  };

  const handleUpdateProfile = async () => {
    try {
      await axios.put(`${API}/user/profile`, { name: editName, phone: editPhone }, { headers: getAuthHeaders() });
      setEditing(false);
    } catch (e) { console.error(e); }
  };

  const deleteAddress = async (id) => {
    try {
      await axios.delete(`${API}/user/addresses/${id}`, { headers: getAuthHeaders() });
      setAddresses(addresses.filter(a => a.id !== id));
    } catch (e) { console.error(e); }
  };

  return (
    <div className="profile-page page-container" data-testid="profile-page">
      <div className="profile-layout">
        <div className="profile-sidebar glass-card">
          <div className="profile-sidebar-header">
            {user?.picture ? <img src={user.picture} alt="" className="profile-sidebar-avatar" /> : <div className="profile-sidebar-avatar-placeholder"><UserIcon size={32} /></div>}
            <h3>{user?.name}</h3>
            <span>{user?.email}</span>
          </div>
          <div className="profile-nav" data-testid="profile-nav">
            {TABS.map(tab => (
              <button key={tab.id} className={`profile-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)} data-testid={`profile-tab-${tab.id}`}>
                <tab.icon size={18} /> {tab.label}
              </button>
            ))}
            <button className="profile-nav-item logout" onClick={() => { logout(); navigate('/login'); }} data-testid="profile-logout">
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>

        <div className="profile-content">
          {activeTab === 'profile' && (
            <div className="profile-card glass-card" data-testid="profile-info">
              <div className="profile-card-header"><h2>Personal Information</h2>
                <button className="edit-btn" onClick={() => setEditing(!editing)} data-testid="edit-profile-btn"><Edit2 size={16} /> {editing ? 'Cancel' : 'Edit'}</button>
              </div>
              <div className="profile-fields">
                <div className="profile-field">
                  <label>Name</label>
                  {editing ? <input value={editName} onChange={(e) => setEditName(e.target.value)} data-testid="edit-name-input" /> : <span>{user?.name}</span>}
                </div>
                <div className="profile-field">
                  <label>Email</label>
                  <span>{user?.email}</span>
                </div>
                <div className="profile-field">
                  <label>Phone</label>
                  {editing ? <input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} data-testid="edit-phone-input" /> : <span>{user?.phone || 'Not set'}</span>}
                </div>
              </div>
              {editing && <button className="btn-primary save-btn" onClick={handleUpdateProfile} data-testid="save-profile-btn">Save Changes</button>}
            </div>
          )}

          {activeTab === 'orders' && (
            <div data-testid="orders-section">
              <h2 className="content-title">My Orders</h2>
              {orders.length === 0 ? <div className="empty-state glass-card"><Package size={48} /><h3>No orders yet</h3><p>Your orders will appear here</p></div> : (
                <div className="orders-list">
                  {orders.map(order => (
                    <div key={order.id} className="order-card glass-card" data-testid={`order-${order.id}`}>
                      <div className="order-header">
                        <div><span className="order-id">Order #{order.id.slice(0, 8).toUpperCase()}</span><span className="order-date">{new Date(order.created_at).toLocaleDateString()}</span></div>
                        <span className={`order-status ${order.status}`}>{order.status}</span>
                      </div>
                      <div className="order-items">{order.items.map((item, i) => <span key={i} className="order-item-name">{item.name} x{item.quantity}</span>)}</div>
                      <div className="order-footer"><span className="order-total">Rs. {order.total}</span><span className="order-payment">{order.payment_method.toUpperCase()}</span></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'addresses' && (
            <div data-testid="addresses-section">
              <h2 className="content-title">Saved Addresses</h2>
              {addresses.length === 0 ? <div className="empty-state glass-card"><MapPin size={48} /><h3>No addresses saved</h3></div> : (
                <div className="addresses-list">
                  {addresses.map(addr => (
                    <div key={addr.id} className="address-item glass-card" data-testid={`address-item-${addr.id}`}>
                      <div><span className="addr-label">{addr.label}</span><span className="addr-text">{addr.full_address}, {addr.city} - {addr.pincode}</span></div>
                      <button className="addr-delete" onClick={() => deleteAddress(addr.id)}>Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div data-testid="wishlist-section">
              <h2 className="content-title">My Wishlist</h2>
              {wishlist.length === 0 ? <div className="empty-state glass-card"><Heart size={48} /><h3>Wishlist is empty</h3><p>Save items you love for later</p></div> : (
                <div className="product-grid">{wishlist.map(p => <ProductCard key={p.id} product={p} />)}</div>
              )}
            </div>
          )}

          {activeTab === 'favstores' && (
            <div data-testid="favstores-section">
              <h2 className="content-title">Favorite Stores</h2>
              <div className="stores-grid">
                {stores.slice(0, 4).map(store => (
                  <div key={store.id} className="fav-store-card glass-card" onClick={() => navigate('/stores')} data-testid={`fav-store-${store.id}`}>
                    <img src={store.image} alt={store.name} className="fav-store-img" />
                    <h3>{store.name}</h3>
                    <span>{store.address}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'help' && (
            <div className="help-section glass-card" data-testid="help-section">
              <h2>Help & Support</h2>
              <div className="help-items">
                {['Order Issues', 'Payment Problems', 'Delivery Tracking', 'Account Settings', 'App Feedback'].map(item => (
                  <div key={item} className="help-item"><span>{item}</span><span className="help-arrow">&#8250;</span></div>
                ))}
              </div>
              <div className="help-contact"><h3>Contact Us</h3><p>Email: support@grovia.app</p><p>Phone: 1800-123-4567 (Toll Free)</p></div>
            </div>
          )}

          {activeTab === 'refunds' && (
            <div data-testid="refunds-section">
              <h2 className="content-title">Refunds</h2>
              <div className="empty-state glass-card"><RotateCcw size={48} /><h3>No refunds</h3><p>Your refund requests will appear here</p></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
