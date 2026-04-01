import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Search, ShoppingCart, User, MapPin, ChevronDown, LogOut } from 'lucide-react';
import './Navbar.css';

function Navbar() {
  const { user, cart, selectedStore, stores, setSelectedStore, logout } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [showStoreDropdown, setShowStoreDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <nav className="navbar" data-testid="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo" data-testid="navbar-logo">
          <span className="logo-text">Grovia</span>
        </Link>

        <Link to="/stores" className="navbar-location" data-testid="location-selector">
          <MapPin size={18} className="location-icon" />
          <div className="location-info">
            <span className="location-label">Store</span>
            <span className="location-value">{selectedStore ? selectedStore.name.split(' - ')[1] || selectedStore.name : 'Select Store'}</span>
          </div>
          <ChevronDown size={16} />
        </Link>

        <form className="navbar-search" onSubmit={handleSearch} data-testid="search-form">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search for products..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} data-testid="search-input" />
        </form>

        <div className="navbar-actions">
          <Link to="/cart" className="navbar-cart" data-testid="cart-icon">
            <ShoppingCart size={22} />
            {cart.item_count > 0 && <span className="cart-badge" data-testid="cart-badge">{cart.item_count}</span>}
          </Link>

          {user ? (
            <div className="navbar-profile" onClick={() => setShowProfileDropdown(!showProfileDropdown)} data-testid="profile-icon">
              {user.picture ? <img src={user.picture} alt="" className="profile-avatar" /> : <User size={22} />}
              {showProfileDropdown && (
                <div className="profile-dropdown glass-card" data-testid="profile-dropdown">
                  <div className="profile-dropdown-header">
                    <span className="profile-name">{user.name}</span>
                    <span className="profile-email">{user.email}</span>
                  </div>
                  <Link to="/profile" className="profile-dropdown-item" onClick={() => setShowProfileDropdown(false)}>My Profile</Link>
                  <Link to="/profile?tab=orders" className="profile-dropdown-item" onClick={() => setShowProfileDropdown(false)}>My Orders</Link>
                  <Link to="/profile?tab=wishlist" className="profile-dropdown-item" onClick={() => setShowProfileDropdown(false)}>Wishlist</Link>
                  <div className="profile-dropdown-item logout" onClick={() => { logout(); setShowProfileDropdown(false); navigate('/login'); }} data-testid="logout-btn">
                    <LogOut size={16} /> Logout
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="navbar-login-btn" data-testid="login-btn">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;