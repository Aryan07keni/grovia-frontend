import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { MapPin, Navigation, Clock, Star, Search, Phone } from 'lucide-react';
import './StoreSelection.css';

function StoreSelection() {
  const { stores, setSelectedStore, selectedStore, API } = useApp();
  const [nearbyStores, setNearbyStores] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setUserLocation({ lat: 12.9352, lng: 77.6245 })
      );
    } else {
      setUserLocation({ lat: 12.9352, lng: 77.6245 });
    }
  }, []);

  // Load Google Maps script
  useEffect(() => {
    if (window.google && window.google.maps) {
      setMapsLoaded(true);
      return;
    }
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    if (!apiKey) { return; }
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => setMapsLoaded(true));
      return;
    }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setMapsLoaded(true);
    script.onerror = () => console.error('Google Maps failed to load');
    document.head.appendChild(script);
  }, []);

  // Initialize map when both mapsLoaded and userLocation are ready
  useEffect(() => {
    if (!mapsLoaded || !userLocation || !mapRef.current || !window.google || !window.google.maps) return;
    try {
      const map = new window.google.maps.Map(mapRef.current, {
        center: userLocation,
        zoom: 13,
        styles: [
          { featureType: 'poi', stylers: [{ visibility: 'off' }] },
          { featureType: 'water', elementType: 'geometry.fill', stylers: [{ color: '#c8e6f0' }] },
        ],
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
      });
      mapInstance.current = map;

      new window.google.maps.Marker({
        position: userLocation,
        map,
        title: 'Your Location',
        icon: { url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png' },
      });

      stores.forEach(store => {
        const marker = new window.google.maps.Marker({
          position: { lat: store.lat, lng: store.lng },
          map,
          title: store.name,
          icon: { url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png' },
        });
        const infoWindow = new window.google.maps.InfoWindow({
          content: `<div style="font-family:Manrope;padding:4px"><strong>${store.name}</strong><br/><span style="color:#666;font-size:12px">${store.address}</span></div>`,
        });
        marker.addListener('click', () => infoWindow.open(map, marker));
        markersRef.current.push(marker);
      });
    } catch (err) {
      console.error('Map init error:', err);
    }
  }, [mapsLoaded, userLocation, stores]);

  useEffect(() => {
    const sorted = [...stores].map(s => {
      if (userLocation) {
        const R = 6371;
        const dLat = (s.lat - userLocation.lat) * Math.PI / 180;
        const dLon = (s.lng - userLocation.lng) * Math.PI / 180;
        const a = Math.sin(dLat/2)**2 + Math.cos(userLocation.lat * Math.PI/180) * Math.cos(s.lat * Math.PI/180) * Math.sin(dLon/2)**2;
        const dist = R * 2 * Math.asin(Math.sqrt(a));
        return { ...s, distance_km: Math.round(dist * 10) / 10 };
      }
      return { ...s, distance_km: null };
    });
    sorted.sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0));
    setNearbyStores(sorted);
  }, [stores, userLocation]);

  const filteredStores = nearbyStores.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const focusStore = (store) => {
    setSelectedStore(store);
    localStorage.setItem('grovia_selected_store', JSON.stringify(store));
    if (mapInstance.current && window.google && window.google.maps) {
      mapInstance.current.panTo({ lat: store.lat, lng: store.lng });
      mapInstance.current.setZoom(15);
    }
    // Navigate back to previous page after selection
    setTimeout(() => {
      navigate(-1);
    }, 500);
  };

  return (
    <div className="store-page page-container" data-testid="store-selection-page">
      <div className="store-layout">
        <div className="store-sidebar">
          <h2 className="store-sidebar-title">Nearby Stores</h2>
          <div className="store-search">
            <Search size={18} className="store-search-icon" />
            <input type="text" placeholder="Search stores..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)} data-testid="store-search-input" />
          </div>
          <div className="store-list" data-testid="store-list">
            {filteredStores.map(store => (
              <div key={store.id}
                className={`store-card glass-card ${selectedStore?.id === store.id ? 'active' : ''}`}
                onClick={() => focusStore(store)} data-testid={`store-card-${store.id}`}>
                <div className="store-card-img">
                  <img src={store.image} alt={store.name} loading="lazy" />
                </div>
                <div className="store-card-info">
                  <h3 className="store-card-name">{store.name}</h3>
                  <p className="store-card-address">{store.address}</p>
                  <div className="store-card-meta">
                    <span className="store-meta-item"><Star size={14} /> {store.rating}</span>
                    <span className="store-meta-item"><Clock size={14} /> {store.delivery_time}</span>
                    {store.distance_km !== null && (
                      <span className="store-meta-item"><Navigation size={14} /> {store.distance_km} km</span>
                    )}
                  </div>
                  <div className="store-card-phone"><Phone size={14} /> {store.phone}</div>
                </div>
                {selectedStore?.id === store.id && <div className="store-selected-badge">Selected</div>}
              </div>
            ))}
          </div>
        </div>
        <div className="store-map-container">
          <div ref={mapRef} className="store-map" data-testid="store-map" />
        </div>
      </div>
    </div>
  );
}

export default StoreSelection;