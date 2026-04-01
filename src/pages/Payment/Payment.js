import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import FloatingGroceries from '../../components/FloatingGroceries/FloatingGroceries';
import { MapPin, CreditCard, Smartphone, Banknote, Check, ArrowLeft, ShieldCheck, Truck } from 'lucide-react';
import axios from 'axios';
import './Payment.css';

function Payment() {
  const { cart, API, getAuthHeaders, selectedStore, fetchCart } = useApp();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [address, setAddress] = useState({ label: 'Home', full_address: '', city: 'Bangalore', pincode: '' });
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [upiId, setUpiId] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const res = await axios.get(`${API}/user/addresses`, { headers: getAuthHeaders() });
      setSavedAddresses(res.data.addresses || []);
      if (res.data.addresses?.length > 0) setSelectedAddress(res.data.addresses[0].id);
    } catch (e) { console.error(e); }
  };

  const handleAddAddress = async () => {
    if (!address.full_address || !address.pincode) return;
    try {
      const res = await axios.post(`${API}/user/addresses`, address, { headers: getAuthHeaders() });
      setSavedAddresses([...savedAddresses, res.data]);
      setSelectedAddress(res.data.id);
      setAddress({ label: 'Home', full_address: '', city: 'Bangalore', pincode: '' });
    } catch (e) { console.error(e); }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress && !address.full_address) return;
    setProcessing(true);
    try {
      let addrId = selectedAddress;
      if (!addrId && address.full_address) {
        const addrRes = await axios.post(`${API}/user/addresses`, address, { headers: getAuthHeaders() });
        addrId = addrRes.data.id;
      }
      const res = await axios.post(`${API}/orders`, {
        address_id: addrId,
        payment_method: paymentMethod,
        store_id: selectedStore?.id || 'store-1'
      }, { headers: getAuthHeaders() });
      setOrderId(res.data.id);
      setOrderPlaced(true);
      fetchCart();
    } catch (e) { console.error(e); }
    setProcessing(false);
  };

  if (orderPlaced) {
    return (
      <div className="payment-page page-container" data-testid="order-success-page">
        <FloatingGroceries />
        <div className="order-success glass-card" data-testid="order-success">
          <div className="success-check"><Check size={48} /></div>
          <h1>Order Placed Successfully</h1>
          <p className="success-id">Order ID: {orderId.slice(0, 8).toUpperCase()}</p>
          <p className="success-msg">Your groceries will be delivered in 15-20 minutes</p>
          <div className="success-actions">
            <button className="btn-primary" onClick={() => navigate('/profile?tab=orders')} data-testid="view-orders-btn">View Orders</button>
            <button className="btn-outline" onClick={() => navigate('/')} data-testid="continue-shopping-btn">Continue Shopping</button>
          </div>
        </div>
      </div>
    );
  }

  if (cart.items.length === 0) { navigate('/cart'); return null; }

  return (
    <div className="payment-page page-container" data-testid="payment-page">
      <FloatingGroceries />
      <div className="payment-content">
        <button className="cart-back-btn" onClick={() => navigate('/cart')} data-testid="payment-back-btn">
          <ArrowLeft size={18} /> Back to Cart
        </button>
        <h1 className="payment-title">Checkout</h1>

        <div className="payment-layout">
          <div className="payment-left">
            {/* Delivery Address */}
            <div className="payment-section glass-card" data-testid="delivery-address-section">
              <h2><MapPin size={20} /> Delivery Address</h2>
              {savedAddresses.length > 0 && (
                <div className="saved-addresses">
                  {savedAddresses.map(addr => (
                    <div key={addr.id} className={`address-card ${selectedAddress === addr.id ? 'active' : ''}`}
                      onClick={() => setSelectedAddress(addr.id)} data-testid={`address-${addr.id}`}>
                      <span className="address-label">{addr.label}</span>
                      <span className="address-text">{addr.full_address}, {addr.city} - {addr.pincode}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="new-address-form">
                <h3>Add New Address</h3>
                <div className="form-row">
                  <input type="text" placeholder="Label (Home, Office...)" value={address.label}
                    onChange={(e) => setAddress({...address, label: e.target.value})} data-testid="address-label-input" />
                </div>
                <div className="form-row">
                  <input type="text" placeholder="Full address" value={address.full_address}
                    onChange={(e) => setAddress({...address, full_address: e.target.value})} data-testid="address-full-input" />
                </div>
                <div className="form-row-double">
                  <input type="text" placeholder="City" value={address.city}
                    onChange={(e) => setAddress({...address, city: e.target.value})} data-testid="address-city-input" />
                  <input type="text" placeholder="Pincode" value={address.pincode} maxLength={6}
                    onChange={(e) => setAddress({...address, pincode: e.target.value.replace(/\D/g, '')})} data-testid="address-pincode-input" />
                </div>
                <button className="btn-outline add-addr-btn" onClick={handleAddAddress} data-testid="add-address-btn">Save Address</button>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="payment-section glass-card" data-testid="payment-methods-section">
              <h2><CreditCard size={20} /> Payment Method</h2>
              <div className="payment-methods">
                <div className={`payment-method ${paymentMethod === 'upi' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('upi')} data-testid="payment-upi">
                  <Smartphone size={22} className="pm-icon" />
                  <div><span className="pm-name">UPI</span><span className="pm-desc">Google Pay, PhonePe, Paytm</span></div>
                </div>
                <div className={`payment-method ${paymentMethod === 'card' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('card')} data-testid="payment-card">
                  <CreditCard size={22} className="pm-icon" />
                  <div><span className="pm-name">Credit / Debit Card</span><span className="pm-desc">Visa, Mastercard, RuPay</span></div>
                </div>
                <div className={`payment-method ${paymentMethod === 'cod' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('cod')} data-testid="payment-cod">
                  <Banknote size={22} className="pm-icon" />
                  <div><span className="pm-name">Cash on Delivery</span><span className="pm-desc">Pay when your order arrives</span></div>
                </div>
              </div>

              {paymentMethod === 'upi' && (
                <div className="upi-section" data-testid="upi-section">
                  <input type="text" placeholder="Enter UPI ID (e.g., name@upi)" value={upiId}
                    onChange={(e) => setUpiId(e.target.value)} data-testid="upi-input" />
                  <div className="upi-apps">
                    <button className="upi-app-btn" data-testid="gpay-btn">Google Pay</button>
                    <button className="upi-app-btn" data-testid="phonepe-btn">PhonePe</button>
                    <button className="upi-app-btn" data-testid="paytm-btn">Paytm</button>
                  </div>
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="card-form" data-testid="card-form">
                  <input type="text" placeholder="Name on card" value={cardDetails.name}
                    onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})} data-testid="card-name-input" />
                  <input type="text" placeholder="Card number" value={cardDetails.number} maxLength={19}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim();
                      setCardDetails({...cardDetails, number: val});
                    }} data-testid="card-number-input" />
                  <div className="form-row-double">
                    <input type="text" placeholder="MM/YY" value={cardDetails.expiry} maxLength={5}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, '');
                        if (val.length >= 2) val = val.slice(0, 2) + '/' + val.slice(2);
                        setCardDetails({...cardDetails, expiry: val});
                      }} data-testid="card-expiry-input" />
                    <input type="password" placeholder="CVV" value={cardDetails.cvv} maxLength={3}
                      onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value.replace(/\D/g, '')})} data-testid="card-cvv-input" />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="payment-right">
            <div className="order-summary-card glass-card" data-testid="payment-order-summary">
              <h2>Order Summary</h2>
              <div className="summary-items">
                {cart.items.map(item => (
                  <div key={item.id} className="summary-item">
                    <div className="summary-item-info">
                      <span className="summary-item-name">{item.name}</span>
                      <span className="summary-item-qty">x{item.quantity} ({item.weight_option})</span>
                    </div>
                    <span className="summary-item-price">Rs. {item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="summary-breakdown">
                <div className="summary-row"><span>Subtotal</span><span>Rs. {cart.subtotal}</span></div>
                <div className="summary-row"><span>Delivery</span><span>{cart.delivery_fee > 0 ? `Rs. ${cart.delivery_fee}` : 'FREE'}</span></div>
                <div className="summary-row total"><span>Total</span><span>Rs. {cart.total}</span></div>
              </div>
              <button className="btn-primary place-order-btn" onClick={handlePlaceOrder} disabled={processing} data-testid="place-order-btn">
                {processing ? 'Processing...' : `Place Order - Rs. ${cart.total}`}
              </button>
              <div className="secure-badge"><ShieldCheck size={16} /> <span>100% Secure Payment</span></div>
              <div className="delivery-info"><Truck size={16} /> <span>Estimated delivery: 15-20 min</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payment;
