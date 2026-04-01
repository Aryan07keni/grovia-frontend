import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AppContext = createContext();
const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState({ items: [], subtotal: 0, delivery_fee: 0, total: 0, item_count: 0 });
  const [selectedStore, setSelectedStore] = useState(null);
  const [deliveryLocation, setDeliveryLocation] = useState(() => {
    const saved = localStorage.getItem('grovia_delivery');
    return saved ? JSON.parse(saved) : null;
  });
  const [categories, setCategories] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('grovia_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  // Handler for setting selected store with localStorage persistence
  const handleSetSelectedStore = (store) => {
    setSelectedStore(store);
    if (store) {
      localStorage.setItem('grovia_selected_store', JSON.stringify(store));
    } else {
      localStorage.removeItem('grovia_selected_store');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('grovia_token');
    const userData = localStorage.getItem('grovia_user');
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
        fetchCart(token);
      } catch (e) {
        localStorage.removeItem('grovia_token');
        localStorage.removeItem('grovia_user');
      }
    }
    fetchCategories();
    fetchStores();
  }, []);

  // Load saved store from localStorage when stores are loaded
  useEffect(() => {
    const savedStore = localStorage.getItem('grovia_selected_store');
    if (savedStore && stores.length > 0) {
      try {
        const parsedStore = JSON.parse(savedStore);
        // Check if the saved store still exists in the stores list
        const storeExists = stores.find(s => s.id === parsedStore.id);
        if (storeExists) {
          setSelectedStore(parsedStore);
        } else if (stores.length > 0) {
          // If saved store doesn't exist, select the first store
          handleSetSelectedStore(stores[0]);
        }
      } catch (e) {
        console.error('Failed to load saved store:', e);
        if (stores.length > 0) {
          handleSetSelectedStore(stores[0]);
        }
      }
    } else if (stores.length > 0 && !selectedStore) {
      // Default to first store
      handleSetSelectedStore(stores[0]);
    }
  }, [stores]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API}/categories`);
      setCategories(res.data.categories);
    } catch (e) { 
      console.error('Failed to fetch categories:', e); 
    }
  };

  const fetchStores = async () => {
    try {
      const res = await axios.get(`${API}/stores`);
      setStores(res.data.stores);
    } catch (e) { 
      console.error('Failed to fetch stores:', e); 
    }
  };

  const fetchCart = async (token) => {
    try {
      const res = await axios.get(`${API}/cart`, {
        headers: { Authorization: `Bearer ${token || localStorage.getItem('grovia_token')}` }
      });
      setCart(res.data);
    } catch (e) { 
      console.error('Failed to fetch cart:', e); 
    }
  };

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('grovia_token', userData.token);
    localStorage.setItem('grovia_user', JSON.stringify(userData));
    fetchCart(userData.token);
  };

  const logout = () => {
    setUser(null);
    setCart({ items: [], subtotal: 0, delivery_fee: 0, total: 0, item_count: 0 });
    localStorage.removeItem('grovia_token');
    localStorage.removeItem('grovia_user');
    // Don't remove selected store on logout - keep it
  };

  const addToCart = async (productId, storeId, quantity, weightOption) => {
    try {
      const res = await axios.post(`${API}/cart`, {
        product_id: productId,
        store_id: storeId || (selectedStore ? selectedStore.id : 'store-1'),
        quantity,
        weight_option: weightOption
      }, { headers: getAuthHeaders() });
      setCart(res.data);
      return true;
    } catch (e) {
      console.error('Add to cart failed:', e);
      return false;
    }
  };

  const updateCartItem = async (itemId, quantity) => {
    try {
      const res = await axios.put(`${API}/cart/${itemId}`, { quantity }, { headers: getAuthHeaders() });
      setCart(res.data);
    } catch (e) { 
      console.error('Update cart failed:', e); 
    }
  };

  const removeCartItem = async (itemId) => {
    try {
      const res = await axios.delete(`${API}/cart/${itemId}`, { headers: getAuthHeaders() });
      setCart(res.data);
    } catch (e) { 
      console.error('Remove from cart failed:', e); 
    }
  };

  const value = {
    user,
    cart,
    selectedStore,
    categories,
    stores,
    loading,
    API,
    login,
    logout,
    addToCart,
    updateCartItem,
    removeCartItem,
    setSelectedStore: handleSetSelectedStore,
    setDeliveryLocation,
    fetchCart,
    getAuthHeaders,
    setLoading,
    fetchStores
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}