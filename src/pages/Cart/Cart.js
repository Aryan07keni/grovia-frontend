import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';
import './Cart.css';

function Cart() {
  const { cart, updateCartItem, removeCartItem } = useApp();
  const navigate = useNavigate();

  if (cart.items.length === 0) {
    return (
      <div className="cart-page page-container" data-testid="cart-page">
        <div className="cart-empty glass-card">
          <ShoppingBag size={64} className="cart-empty-icon" />
          <h2>Your cart is empty</h2>
          <p>Add some items to your cart and come back here</p>
          <button className="btn-primary" onClick={() => navigate('/')} data-testid="continue-shopping">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page page-container" data-testid="cart-page">
      <button className="cart-back-btn" onClick={() => navigate(-1)} data-testid="cart-back-btn">
        <ArrowLeft size={18} /> Back
      </button>
      <h1 className="cart-title">Shopping Cart</h1>
      <div className="cart-layout">
        <div className="cart-items-section">
          {cart.items.map(item => (
            <div key={item.id} className="cart-item glass-card" data-testid={`cart-item-${item.id}`}>
              <div className="cart-item-image" onClick={() => navigate(`/product/${item.product_id}`)}>
                <img src={item.image} alt={item.name}
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&h=200&fit=crop'; }} />
              </div>
              <div className="cart-item-info">
                <h3 className="cart-item-name" onClick={() => navigate(`/product/${item.product_id}`)}>{item.name}</h3>
                <span className="cart-item-weight">{item.weight_option}</span>
                <span className="cart-item-store">{item.store_name}</span>
                <div className="cart-item-pricing">
                  <span className="cart-item-price">Rs. {item.price}</span>
                  {item.mrp > item.price && <span className="cart-item-mrp">Rs. {item.mrp}</span>}
                </div>
              </div>
              <div className="cart-item-actions">
                <div className="cart-qty-control" data-testid={`cart-qty-${item.id}`}>
                  <button onClick={() => updateCartItem(item.id, item.quantity - 1)} data-testid={`cart-minus-${item.id}`}><Minus size={14} /></button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateCartItem(item.id, item.quantity + 1)} data-testid={`cart-plus-${item.id}`}><Plus size={14} /></button>
                </div>
                <span className="cart-item-total">Rs. {item.price * item.quantity}</span>
                <button className="cart-remove-btn" onClick={() => removeCartItem(item.id)} data-testid={`cart-remove-${item.id}`}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary-section">
          <div className="cart-summary glass-card" data-testid="cart-summary">
            <h2>Order Summary</h2>
            <div className="cart-summary-rows">
              <div className="summary-row"><span>Subtotal ({cart.item_count} items)</span><span>Rs. {cart.subtotal}</span></div>
              <div className="summary-row"><span>Delivery Fee</span><span>{cart.delivery_fee > 0 ? `Rs. ${cart.delivery_fee}` : 'FREE'}</span></div>
              {cart.delivery_fee === 0 && <div className="summary-free-delivery">Free delivery on orders above Rs. 500</div>}
              <div className="summary-row total"><span>Total</span><span>Rs. {cart.total}</span></div>
            </div>
            <button className="btn-primary cart-checkout-btn" onClick={() => navigate('/payment')} data-testid="checkout-btn">
              Proceed to Checkout <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
