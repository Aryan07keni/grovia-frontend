import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import './CartBar.css';

function CartBar() {
  const { cart, user } = useApp();
  const navigate = useNavigate();

  if (!user || cart.item_count === 0) return null;

  return (
    <div className="cart-bar glass-card" data-testid="floating-cart-bar">
      <div className="cart-bar-inner">
        <div className="cart-bar-left">
          <div className="cart-bar-icon">
            <ShoppingBag size={20} />
          </div>
          <div className="cart-bar-info">
            <span className="cart-bar-count">{cart.item_count} item{cart.item_count > 1 ? 's' : ''}</span>
            <span className="cart-bar-total">Rs. {cart.total}</span>
          </div>
        </div>
        <button className="cart-bar-btn" onClick={() => navigate('/cart')} data-testid="cart-bar-checkout">
          View Cart <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

export default CartBar;
