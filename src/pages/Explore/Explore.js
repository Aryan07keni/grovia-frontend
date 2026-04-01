import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import ProductCard from '../../components/ProductCard/ProductCard';
import { ChevronLeft, ChevronRight, Sparkles, TrendingUp, Clock } from 'lucide-react';
import axios from 'axios';
import './Explore.css';

function Explore() {
  const { categories, selectedStore, API } = useApp();
  const [products, setProducts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const catScrollRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedStore, searchQuery]);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url;
      if (searchQuery) {
        url = `${API}/products/search?q=${encodeURIComponent(searchQuery)}`;
      } else if (selectedStore) {
        url = `${API}/stores/${selectedStore.id}/products${selectedCategory ? `?category=${selectedCategory}` : ''}`;
      } else {
        url = `${API}/products?${selectedCategory ? `category=${selectedCategory}&` : ''}limit=100`;
      }
      const res = await axios.get(url);
      setProducts(res.data.products || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchRecommendations = async () => {
    try {
      const token = localStorage.getItem('grovia_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`${API}/recommendations`, { headers });
      setRecommendations(res.data.products || []);
    } catch (e) { console.error(e); }
  };

  const scrollCategories = (dir) => {
    if (catScrollRef.current) {
      catScrollRef.current.scrollBy({ left: dir * 200, behavior: 'smooth' });
    }
  };

  const groupedProducts = {};
  products.forEach(p => {
    const catId = p.category_id;
    if (!groupedProducts[catId]) groupedProducts[catId] = [];
    groupedProducts[catId].push(p);
  });

  return (
    <div className="explore-page page-container" data-testid="explore-page">
      {/* Category Bar */}
      <div className="category-bar" data-testid="category-bar">
        <button className="cat-scroll-btn cat-scroll-left" onClick={() => scrollCategories(-1)}><ChevronLeft size={18} /></button>
        <div className="category-scroll" ref={catScrollRef}>
          <button className={`category-pill ${!selectedCategory ? 'active' : ''}`}
            onClick={() => setSelectedCategory(null)} data-testid="category-all">
            All
          </button>
          {categories.map(cat => (
            <button key={cat.id} className={`category-pill ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)} data-testid={`category-${cat.id}`}>
              <img src={cat.image} alt="" className="category-pill-img" />
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
        <button className="cat-scroll-btn cat-scroll-right" onClick={() => scrollCategories(1)}><ChevronRight size={18} /></button>
      </div>

      <div className="explore-content">
        {/* Search Results */}
        {searchQuery && (
          <div className="explore-section">
            <h2 className="section-title">Search results for "{searchQuery}"</h2>
            {products.length === 0 && !loading ? (
              <p className="no-results">No products found. Try a different search term.</p>
            ) : (
              <div className="product-grid" data-testid="search-results">{products.map(p => <ProductCard key={p.id} product={p} />)}</div>
            )}
          </div>
        )}

        {/* Browse Categories */}
        {!searchQuery && !selectedCategory && (
          <>
            <div className="explore-section">
              <div className="section-header">
                <h2 className="section-title"><Sparkles size={20} className="section-icon" /> Shop by Category</h2>
                <button className="see-all-btn" onClick={() => {}}>See All</button>
              </div>
              <div className="categories-grid" data-testid="categories-grid">
                {categories.map(cat => (
                  <div key={cat.id} className="category-card glass-card" data-testid={`cat-card-${cat.id}`}
                    onClick={() => navigate(`/category/${cat.id}`)}>
                    <div className="category-card-img">
                      <img src={cat.image} alt={cat.name} loading="lazy" />
                    </div>
                    <span className="category-card-name">{cat.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div className="explore-section">
                <div className="section-header">
                  <h2 className="section-title"><TrendingUp size={20} className="section-icon" /> Recommended for You</h2>
                </div>
                <div className="product-grid" data-testid="recommendations">{recommendations.map(p => <ProductCard key={p.id} product={p} />)}</div>
              </div>
            )}

            {/* Products by Category */}
            {Object.entries(groupedProducts).slice(0, 5).map(([catId, prods]) => {
              const cat = categories.find(c => c.id === catId);
              if (!cat || prods.length === 0) return null;
              return (
                <div key={catId} className="explore-section">
                  <div className="section-header">
                    <h2 className="section-title">{cat.name}</h2>
                    <button className="see-all-btn" onClick={() => navigate(`/category/${catId}`)}>See All</button>
                  </div>
                  <div className="product-scroll">
                    {prods.slice(0, 8).map(p => <ProductCard key={p.id} product={p} />)}
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* Filtered Products */}
        {!searchQuery && selectedCategory && (
          <div className="explore-section">
            <h2 className="section-title">
              {categories.find(c => c.id === selectedCategory)?.name || 'Products'}
            </h2>
            {loading ? (
              <div className="loading-grid">{[...Array(8)].map((_, i) => <div key={i} className="skeleton-card" />)}</div>
            ) : (
              <div className="product-grid" data-testid="filtered-products">{products.map(p => <ProductCard key={p.id} product={p} />)}</div>
            )}
          </div>
        )}

        {/* Quick Delivery Banner */}
        {!searchQuery && !selectedCategory && (
          <div className="delivery-banner glass-card" data-testid="delivery-banner">
            <Clock size={28} className="banner-icon" />
            <div>
              <h3>Lightning Fast Delivery</h3>
              <p>Get your groceries delivered in as fast as 10 minutes</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Explore;
