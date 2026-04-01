import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Plus, Minus } from 'lucide-react';
import './ProductCard.css';

function ProductCard({ product, storePrice }) {
  const { user, addToCart, selectedStore, cart } = useApp();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);

  const cartItem = cart.items.find(item => item.product_id === product.id);
  const price = storePrice || product.store_price || product.base_price;
  const mrp = product.store_mrp || product.mrp;
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  const handleAdd = async (e) => {
    e.stopPropagation();
    if (!user) { navigate('/login'); return; }
    setAdding(true);
    await addToCart(product.id, selectedStore?.id || 'store-1', 1, product.default_weight || product.weight_options?.[0] || '1 pc');
    setAdding(false);
  };

  return (
    <div className="product-card glass-card" data-testid={`product-card-${product.id}`}
      onClick={() => navigate(`/product/${product.id}`)}>
      {discount > 0 && <span className="product-discount-badge">{discount}% OFF</span>}
      <div className="product-card-image">
        <img src={product.image} alt={product.name} loading="lazy"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop'; }} />
      </div>
      <div className="product-card-body">
        <h4 className="product-card-name">{product.name}</h4>
        <span className="product-card-weight">{product.default_weight || product.weight_options?.[0]}</span>
        <div className="product-card-pricing">
          <div className="product-card-prices">
            <span className="product-card-price">Rs. {price}</span>
            {mrp > price && <span className="product-card-mrp">Rs. {mrp}</span>}
          </div>
          {cartItem ? (
            <div className="product-card-qty" data-testid={`qty-control-${product.id}`} onClick={(e) => e.stopPropagation()}>
              <button className="qty-btn" onClick={(e) => { e.stopPropagation(); }} data-testid={`qty-minus-${product.id}`}>
                <Minus size={14} />
              </button>
              <span className="qty-value">{cartItem.quantity}</span>
              <button className="qty-btn qty-btn-plus" onClick={(e) => { e.stopPropagation(); }} data-testid={`qty-plus-${product.id}`}>
                <Plus size={14} />
              </button>
            </div>
          ) : (
            <button className="product-add-btn" onClick={handleAdd} disabled={adding} data-testid={`add-to-cart-${product.id}`}>
              {adding ? '...' : 'ADD'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
