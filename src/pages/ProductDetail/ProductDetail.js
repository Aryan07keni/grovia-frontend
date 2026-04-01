import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import ProductCard from '../../components/ProductCard/ProductCard';
import { Heart, ShoppingCart, Star, MapPin, Clock, ChevronRight, Minus, Plus, Store } from 'lucide-react';
import axios from 'axios';
import './ProductDetail.css';

function ProductDetail() {
  const { id } = useParams();
  const { user, addToCart, selectedStore, API, cart } = useApp();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedWeight, setSelectedWeight] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [wishlisted, setWishlisted] = useState(false);
  const [adding, setAdding] = useState(false);
  const [selectedStoreForProduct, setSelectedStoreForProduct] = useState(null);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/products/${id}`);
      setProduct(res.data);
      setSelectedWeight(res.data.default_weight || res.data.weight_options?.[0] || '');
      if (res.data.store_availability?.length > 0) {
        const storeMatch = res.data.store_availability.find(s => s.store_id === selectedStore?.id);
        setSelectedStoreForProduct(storeMatch || res.data.store_availability[0]);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleAddToCart = async () => {
    if (!user) { navigate('/login'); return; }
    setAdding(true);
    const storeId = selectedStoreForProduct?.store_id || selectedStore?.id || 'store-1';
    await addToCart(id, storeId, quantity, selectedWeight);
    setAdding(false);
  };

  const toggleWishlist = async () => {
    if (!user) { navigate('/login'); return; }
    const headers = { Authorization: `Bearer ${localStorage.getItem('grovia_token')}` };
    try {
      if (wishlisted) {
        await axios.delete(`${API}/user/wishlist/${id}`, { headers });
      } else {
        await axios.post(`${API}/user/wishlist/${id}`, {}, { headers });
      }
      setWishlisted(!wishlisted);
    } catch (e) { console.error(e); }
  };

  if (loading) return <div className="product-detail-page page-container"><div className="loading-skeleton" /></div>;
  if (!product) return <div className="product-detail-page page-container"><p>Product not found</p></div>;

  const currentPrice = selectedStoreForProduct?.price || product.base_price;
  const currentMrp = selectedStoreForProduct?.mrp || product.mrp;
  const discount = currentMrp > currentPrice ? Math.round(((currentMrp - currentPrice) / currentMrp) * 100) : 0;

  return (
    <div className="product-detail-page page-container" data-testid="product-detail-page">
      <div className="product-detail-layout">
        {/* Left - Image */}
        <div className="product-detail-image-section">
          <div className="product-detail-image glass-card">
            <img src={product.image} alt={product.name}
              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=600&fit=crop'; }} />
            {discount > 0 && <span className="detail-discount-badge">{discount}% OFF</span>}
          </div>
          <button className={`wishlist-btn ${wishlisted ? 'active' : ''}`} onClick={toggleWishlist} data-testid="wishlist-btn">
            <Heart size={22} fill={wishlisted ? 'var(--danger)' : 'none'} color={wishlisted ? 'var(--danger)' : 'var(--text-muted)'} />
          </button>
        </div>

        {/* Right - Info */}
        <div className="product-detail-info">
          {product.category && (
            <span className="product-detail-category" onClick={() => navigate(`/category/${product.category.id}`)}>
              {product.category.name} <ChevronRight size={14} />
            </span>
          )}
          <h1 className="product-detail-name" data-testid="product-name">{product.name}</h1>
          
          <div className="product-detail-rating">
            <Star size={16} fill="#F59E0B" color="#F59E0B" />
            <span>{product.rating}</span>
          </div>

          <div className="product-detail-price-block">
            <span className="detail-price" data-testid="product-price">Rs. {currentPrice}</span>
            {currentMrp > currentPrice && <span className="detail-mrp">Rs. {currentMrp}</span>}
            {discount > 0 && <span className="detail-save">You save Rs. {currentMrp - currentPrice}</span>}
          </div>

          <p className="product-detail-desc" data-testid="product-description">{product.description}</p>

          {/* Weight Options */}
          {product.weight_options?.length > 0 && (
            <div className="product-detail-weights">
              <h3>Select Quantity</h3>
              <div className="weight-options" data-testid="weight-options">
                {product.weight_options.map(w => (
                  <button key={w} className={`weight-option ${selectedWeight === w ? 'active' : ''}`}
                    onClick={() => setSelectedWeight(w)} data-testid={`weight-${w}`}>{w}</button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="product-detail-qty">
            <h3>Quantity</h3>
            <div className="qty-selector" data-testid="quantity-selector">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} data-testid="detail-qty-minus"><Minus size={16} /></button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} data-testid="detail-qty-plus"><Plus size={16} /></button>
            </div>
          </div>

          {/* Add to Cart */}
          <button className="detail-add-btn btn-primary" onClick={handleAddToCart} disabled={adding} data-testid="detail-add-to-cart">
            <ShoppingCart size={20} />
            {adding ? 'Adding...' : `Add to Cart - Rs. ${currentPrice * quantity}`}
          </button>

          {/* Store Availability */}
          {product.store_availability?.length > 0 && (
            <div className="store-availability" data-testid="store-availability">
              <h3><Store size={18} /> Available at {product.store_availability.length} stores</h3>
              <div className="store-avail-list">
                {product.store_availability.map(sa => (
                  <div key={sa.store_id}
                    className={`store-avail-card glass-card ${selectedStoreForProduct?.store_id === sa.store_id ? 'active' : ''}`}
                    onClick={() => setSelectedStoreForProduct(sa)} data-testid={`store-avail-${sa.store_id}`}>
                    <div className="store-avail-info">
                      <span className="store-avail-name">{sa.store_name}</span>
                      <div className="store-avail-meta">
                        <span><Clock size={12} /> {sa.delivery_time}</span>
                        <span><MapPin size={12} /> {sa.store_address.split(',').slice(0, 2).join(',')}</span>
                      </div>
                    </div>
                    <div className="store-avail-price">
                      <span className="store-avail-price-val">Rs. {sa.price}</span>
                      {sa.mrp > sa.price && <span className="store-avail-mrp">Rs. {sa.mrp}</span>}
                      <span className={`store-avail-stock ${sa.in_stock ? '' : 'out'}`}>
                        {sa.in_stock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {product.related_products?.length > 0 && (
        <div className="related-section">
          <h2 className="section-title">Related Products</h2>
          <div className="product-grid" data-testid="related-products">
            {product.related_products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetail;
