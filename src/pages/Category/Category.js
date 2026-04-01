import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import ProductCard from '../../components/ProductCard/ProductCard';
import { ArrowLeft } from 'lucide-react';
import axios from 'axios';
import './Category.css';

function Category() {
  const { id } = useParams();
  const { categories, selectedStore, API } = useApp();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const category = categories.find(c => c.id === id);

  useEffect(() => {
    fetchProducts();
  }, [id, selectedStore]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url;
      if (selectedStore) {
        url = `${API}/stores/${selectedStore.id}/products?category=${id}`;
      } else {
        url = `${API}/products?category=${id}&limit=100`;
      }
      const res = await axios.get(url);
      setProducts(res.data.products || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <div className="category-page page-container" data-testid="category-page">
      <button className="back-btn" onClick={() => navigate(-1)} data-testid="category-back-btn">
        <ArrowLeft size={18} /> Back
      </button>

      <div className="category-header" data-testid="category-header">
        {category?.image && (
          <div className="category-header-img">
            <img src={category.image} alt={category?.name} />
          </div>
        )}
        <div>
          <h1 className="category-title">{category?.name || 'Category'}</h1>
          <p className="category-count">{products.length} products available</p>
        </div>
      </div>

      {loading ? (
        <div className="loading-grid">
          {[...Array(8)].map((_, i) => <div key={i} className="skeleton-card" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="empty-category glass-card">
          <h3>No products found in this category</h3>
          <p>Try selecting a different store or category</p>
        </div>
      ) : (
        <div className="product-grid" data-testid="category-products">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}

export default Category;
