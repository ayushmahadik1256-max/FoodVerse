import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import { Restaurant, Address } from '../../types';
import { calculateDistanceKm, formatDistance } from '../../utils/distance';
import { useAppStore } from '../../store/useAppStore';
import {
  MapPin,
  Navigation,
  Star,
  Clock,
  Bike,
  Compass,
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
  ArrowRight,
  RotateCw,
} from 'lucide-react';

interface RestaurantDiscoveryMapProps {
  restaurants: Restaurant[];
  onSelectRestaurant: (restaurantId: string) => void;
  className?: string;
}

// Map cuisine to representative emoji
function getCuisineEmoji(cuisines: string[]): string {
  const c = cuisines.join(' ').toLowerCase();
  if (c.includes('burger')) return '🍔';
  if (c.includes('pizza') || c.includes('italian')) return '🍕';
  if (c.includes('sushi') || c.includes('ramen') || c.includes('asian') || c.includes('japanese')) return '🍜';
  if (c.includes('taco') || c.includes('mexican')) return '🌮';
  if (c.includes('bakery') || c.includes('donut') || c.includes('dessert')) return '🍩';
  if (c.includes('biryani')) return '🍛';
  if (c.includes('curry') || c.includes('tandoor') || c.includes('north indian')) return '🥘';
  if (c.includes('dosa') || c.includes('south indian')) return '🥞';
  if (c.includes('chaat') || c.includes('mithai')) return '🥨';
  return '🍽️';
}

export const RestaurantDiscoveryMap: React.FC<RestaurantDiscoveryMapProps> = ({
  restaurants,
  onSelectRestaurant,
  className = '',
}) => {
  const { currentUser } = useAppStore();

  // User location reference (defaults to user's primary address in Indiranagar Bengaluru)
  const defaultAddress: Address = useMemo(() => {
    return (
      currentUser.addresses.find((a) => a.isDefault) ||
      currentUser.addresses[0] || {
        id: 'default_loc',
        label: 'Home',
        street: 'Shivaji Chowk, Main Road',
        city: 'Islampur',
        state: 'Maharashtra',
        zip: '415409',
        lat: 17.0585,
        lng: 74.3108,
      }
    );
  }, [currentUser.addresses]);

  const [selectedAddress, setSelectedAddress] = useState<Address>(defaultAddress);
  const [maxRadiusKm, setMaxRadiusKm] = useState<number | null>(null); // null = all
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const restaurantMarkersRef = useRef<Map<string, L.Marker>>(new Map());

  // User coordinates
  const userCoords: [number, number] = useMemo(() => {
    return [selectedAddress.lat, selectedAddress.lng];
  }, [selectedAddress]);

  // Compute distances for each restaurant from active user coordinates
  const restaurantsWithDistance = useMemo(() => {
    return restaurants
      .map((restaurant) => {
        const [rLat, rLng] = restaurant.location.coordinates;
        const distance = calculateDistanceKm(userCoords[0], userCoords[1], rLat, rLng);
        return {
          ...restaurant,
          distanceKm: distance,
        };
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [restaurants, userCoords]);

  // Filter by proximity radius if active
  const filteredByRadius = useMemo(() => {
    if (maxRadiusKm === null) return restaurantsWithDistance;
    return restaurantsWithDistance.filter((r) => r.distanceKm <= maxRadiusKm);
  }, [restaurantsWithDistance, maxRadiusKm]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: userCoords,
        zoom: 13,
        zoomControl: false, // will add custom position
      });

      // Position zoom controls in top right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Clean OpenStreetMap Carto-style or OSM tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersGroupRef.current = markersGroup;
      mapInstanceRef.current = map;

      // Invalidate size to ensure clean rendering on initial display
      setTimeout(() => {
        map.invalidateSize();
      }, 150);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map markers when user location or filtered restaurants change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = markersGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();
    restaurantMarkersRef.current.clear();

    const allPoints: L.LatLngExpression[] = [];

    // 1. User Location Marker (Pulsing Radar Pin)
    const userDivIcon = L.divIcon({
      className: 'custom-user-location-marker',
      html: `
        <div style="position: relative; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; inset: 0; border-radius: 9999px; background-color: rgba(249, 115, 22, 0.35); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: relative; width: 28px; height: 28px; border-radius: 9999px; background: linear-gradient(135deg, #ea580c, #f97316); border: 2.5px solid #ffffff; box-shadow: 0 4px 12px rgba(234,88,12,0.5); display: flex; align-items: center; justify-content: center; color: white; font-size: 13px;">
            📍
          </div>
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 19],
    });

    const userMarker = L.marker(userCoords, { icon: userDivIcon })
      .bindPopup(
        `<div style="font-family: inherit; padding: 2px;">
          <div style="font-size: 11px; font-weight: 700; color: #ea580c; text-transform: uppercase; letter-spacing: 0.5px;">Your Location</div>
          <div style="font-size: 13px; font-weight: 700; color: #1c1917; margin-top: 2px;">${selectedAddress.label}: ${selectedAddress.street}</div>
          <div style="font-size: 11px; color: #78716c;">${selectedAddress.city}</div>
        </div>`
      )
      .addTo(group);

    userMarkerRef.current = userMarker;
    allPoints.push(userCoords);

    // 2. Restaurant Markers
    filteredByRadius.forEach((restaurant) => {
      const [rLat, rLng] = restaurant.location.coordinates;
      const emoji = getCuisineEmoji(restaurant.cuisines);
      const isSelected = selectedRestaurantId === restaurant.id;

      const restDivIcon = L.divIcon({
        className: 'custom-restaurant-pin',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'}; transition: transform 0.2s ease;">
            <!-- Rating pill on top -->
            <div style="background-color: #1c1917; color: #ffffff; font-size: 10px; font-weight: 800; padding: 1px 6px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); margin-bottom: 2px; display: flex; align-items: center; gap: 2px; white-space: nowrap;">
              <span>${restaurant.rating}</span><span style="color: #f59e0b;">★</span>
            </div>
            <!-- Pin Head -->
            <div style="width: 36px; height: 36px; border-radius: 12px; background: ${
              isSelected ? 'linear-gradient(135deg, #f97316, #ea580c)' : '#ffffff'
            }; border: 2px solid ${
          isSelected ? '#ffffff' : '#e7e5e4'
        }; box-shadow: 0 6px 16px rgba(0,0,0,0.18); display: flex; align-items: center; justify-content: center; font-size: 18px;">
              ${emoji}
            </div>
            <!-- Pin Pointer -->
            <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 6px solid ${
              isSelected ? '#ea580c' : '#ffffff'
            }; margin-top: -1px;"></div>
          </div>
        `,
        iconSize: [44, 52],
        iconAnchor: [22, 50],
        popupAnchor: [0, -48],
      });

      const popupHtml = `
        <div style="min-width: 220px; font-family: inherit;">
          <div style="position: relative; height: 90px; border-radius: 12px; overflow: hidden; margin-bottom: 8px;">
            <img src="${restaurant.image}" alt="${restaurant.name}" style="width: 100%; height: 100%; object-fit: cover;" />
            <div style="position: absolute; top: 6px; right: 6px; background: rgba(0,0,0,0.75); color: #fff; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 6px;">
              ${formatDistance(restaurant.distanceKm)} away
            </div>
          </div>
          <div style="font-size: 14px; font-weight: 800; color: #1c1917; line-height: 1.2;">
            ${restaurant.name}
          </div>
          <div style="font-size: 11px; color: #78716c; margin-top: 2px;">
            ${restaurant.cuisines.slice(0, 2).join(', ')} • ₹${restaurant.priceForTwo} for two
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 8px; font-size: 11px; color: #44403c;">
            <span style="font-weight: 700; color: #ea580c;">🛵 ${restaurant.deliveryTime} mins</span>
            <span>Delivery: ₹${restaurant.deliveryFee}</span>
          </div>
          <button id="map-order-btn-${restaurant.id}" style="width: 100%; margin-top: 10px; padding: 7px 12px; background: #ea580c; color: white; border: none; border-radius: 10px; font-size: 12px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 10px rgba(234,88,12,0.3);">
            View Menu & Order →
          </button>
        </div>
      `;

      const marker = L.marker([rLat, rLng], { icon: restDivIcon })
        .bindPopup(popupHtml, { maxWidth: 260 })
        .addTo(group);

      marker.on('click', () => {
        setSelectedRestaurantId(restaurant.id);
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`map-order-btn-${restaurant.id}`);
        if (btn) {
          btn.onclick = () => {
            onSelectRestaurant(restaurant.id);
          };
        }
      });

      restaurantMarkersRef.current.set(restaurant.id, marker);
      allPoints.push([rLat, rLng]);
    });

    // Fit bounds if we have points, but don't over-zoom
    if (allPoints.length > 1) {
      const bounds = L.latLngBounds(allPoints);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [filteredByRadius, userCoords, selectedRestaurantId, selectedAddress, onSelectRestaurant]);

  // Fly to restaurant when selected in side panel
  const handleSelectFromList = (restaurant: Restaurant & { distanceKm: number }) => {
    setSelectedRestaurantId(restaurant.id);
    const map = mapInstanceRef.current;
    if (map) {
      const [rLat, rLng] = restaurant.location.coordinates;
      map.flyTo([rLat, rLng], 15, { duration: 0.8 });
      const marker = restaurantMarkersRef.current.get(restaurant.id);
      if (marker) {
        marker.openPopup();
      }
    }
  };

  // Center on user location
  const handleCenterUser = () => {
    const map = mapInstanceRef.current;
    if (map) {
      map.flyTo(userCoords, 14, { duration: 0.8 });
      if (userMarkerRef.current) {
        userMarkerRef.current.openPopup();
      }
    }
  };

  // Browser Geolocation
  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const newAddress: Address = {
          id: 'gps_loc',
          label: 'Other',
          street: 'Current GPS Location',
          city: selectedAddress.city || 'Islampur',
          state: 'Maharashtra',
          zip: '415409',
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setSelectedAddress(newAddress);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([pos.coords.latitude, pos.coords.longitude], 14);
        }
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation error:', err.message);
        // Fallback gracefully without alert
      },
      { timeout: 8000 }
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 1. Proximity Filter Header & Location Bar */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-4 sm:p-5 border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: User Reference Point */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
            <Compass className="w-5 h-5 animate-spin" style={{ animationDuration: '12s' }} />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs text-stone-400 font-semibold uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5 text-orange-500" />
              <span>Proximity Origin</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <select
                value={selectedAddress.id}
                onChange={(e) => {
                  const addr = currentUser.addresses.find((a) => a.id === e.target.value);
                  if (addr) setSelectedAddress(addr);
                }}
                className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 bg-stone-100 dark:bg-stone-800 px-2.5 py-1 rounded-xl border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
              >
                {currentUser.addresses.map((addr) => (
                  <option key={addr.id} value={addr.id}>
                    {addr.label}: {addr.street} ({addr.city})
                  </option>
                ))}
              </select>

              <button
                onClick={handleUseGPS}
                disabled={isLocating}
                title="Use Current Device GPS Location"
                className="p-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-orange-50 dark:hover:bg-orange-950/40 text-stone-600 dark:text-stone-300 hover:text-orange-500 transition-colors border border-stone-200 dark:border-stone-700"
              >
                <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin text-orange-500' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Distance Radius Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-stone-400 font-semibold mr-1 flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Radius:</span>
          </span>

          <button
            onClick={() => setMaxRadiusKm(null)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              maxRadiusKm === null
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            All ({restaurantsWithDistance.length})
          </button>

          <button
            onClick={() => setMaxRadiusKm(2)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              maxRadiusKm === 2
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            &lt; 2 km (Walking)
          </button>

          <button
            onClick={() => setMaxRadiusKm(5)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              maxRadiusKm === 5
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            &lt; 5 km (Fast Delivery)
          </button>

          <button
            onClick={() => setMaxRadiusKm(10)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              maxRadiusKm === 10
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            &lt; 10 km (Citywide)
          </button>
        </div>
      </div>

      {/* 2. Interactive Map + Synchronized Proximity Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Map Viewport Area (7 cols on desktop) */}
        <div className="lg:col-span-7 xl:col-span-8 relative h-[380px] sm:h-[480px] lg:h-[600px] rounded-3xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-xl bg-stone-100 dark:bg-stone-900">
          {/* Leaflet Mount */}
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Floating Controls on Map */}
          <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2">
            <button
              onClick={handleCenterUser}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white/95 dark:bg-stone-900/95 backdrop-blur-md shadow-lg border border-stone-200 dark:border-stone-700 text-xs font-bold text-stone-800 dark:text-stone-200 hover:bg-orange-50 dark:hover:bg-stone-800 active:scale-95 transition-all"
            >
              <Navigation className="w-3.5 h-3.5 text-orange-500" />
              <span>Center on Me</span>
            </button>
          </div>

          {/* Floating Legend / Stats badge */}
          <div className="absolute bottom-4 left-4 z-[400] bg-white/95 dark:bg-stone-900/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-lg text-[11px] font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping" />
              <span>{filteredByRadius.length} Kitchens on Map</span>
            </div>
            <span className="text-stone-300 dark:text-stone-700">|</span>
            <span className="text-stone-400">Click pins to inspect</span>
          </div>
        </div>

        {/* Proximity-ranked Restaurant List Panel (5 cols on desktop) */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col h-[380px] sm:h-[480px] lg:h-[600px] rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
          {/* List Header */}
          <div className="p-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-stone-50/70 dark:bg-stone-800/40">
            <div>
              <h3 className="font-extrabold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <span>Nearby Kitchens</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
                  Sorted by Distance
                </span>
              </h3>
              <p className="text-[11px] text-stone-400">
                Tap to fly to location on Leaflet map
              </p>
            </div>
            <span className="text-xs font-bold text-stone-500 dark:text-stone-400">
              {filteredByRadius.length} results
            </span>
          </div>

          {/* List Items Scroll Area */}
          <div className="flex-1 overflow-y-auto divide-y divide-stone-100 dark:divide-stone-800 p-2 space-y-1">
            {filteredByRadius.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center text-stone-400">
                <Compass className="w-10 h-10 mb-2 text-stone-300 dark:text-stone-700" />
                <p className="text-xs font-bold text-stone-600 dark:text-stone-300">
                  No restaurants within {maxRadiusKm} km
                </p>
                <p className="text-[11px] text-stone-400 mt-1">
                  Try expanding your radius filter to &lt; 5 km or All distances.
                </p>
                <button
                  onClick={() => setMaxRadiusKm(null)}
                  className="mt-3 px-3.5 py-1.5 rounded-xl bg-orange-500 text-white font-bold text-xs"
                >
                  Show All Kitchens
                </button>
              </div>
            ) : (
              filteredByRadius.map((restaurant) => {
                const isSelected = selectedRestaurantId === restaurant.id;
                const emoji = getCuisineEmoji(restaurant.cuisines);

                return (
                  <div
                    key={restaurant.id}
                    onClick={() => handleSelectFromList(restaurant)}
                    className={`p-3 rounded-2xl cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-orange-50/80 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/80 shadow-sm'
                        : 'hover:bg-stone-50 dark:hover:bg-stone-800/50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Thumbnail with cuisine badge */}
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-stone-200 dark:border-stone-700">
                        <img
                          src={restaurant.image}
                          alt={restaurant.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-1 left-1 w-5 h-5 rounded-md bg-black/60 backdrop-blur-xs flex items-center justify-center text-xs">
                          {emoji}
                        </div>
                      </div>

                      {/* Content info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="font-extrabold text-xs text-stone-900 dark:text-stone-100 truncate">
                            {restaurant.name}
                          </h4>
                          <span className="flex items-center gap-0.5 text-[11px] font-black text-amber-500 shrink-0">
                            <Star className="w-3 h-3 fill-amber-500" />
                            <span>{restaurant.rating}</span>
                          </span>
                        </div>

                        <div className="text-[11px] text-stone-400 truncate mt-0.5">
                          {restaurant.cuisines.slice(0, 2).join(', ')}
                        </div>

                        {/* Distance & Delivery Stats */}
                        <div className="flex items-center gap-2 mt-1 text-[11px]">
                          <span className="font-black text-orange-600 dark:text-orange-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>{formatDistance(restaurant.distanceKm)}</span>
                          </span>
                          <span className="text-stone-300 dark:text-stone-700">•</span>
                          <span className="text-stone-500 dark:text-stone-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{restaurant.deliveryTime}m</span>
                          </span>
                          <span className="text-stone-300 dark:text-stone-700">•</span>
                          <span className="text-stone-500 dark:text-stone-400">
                            ₹{restaurant.deliveryFee} fee
                          </span>
                        </div>
                      </div>

                      {/* View Menu CTA */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectRestaurant(restaurant.id);
                        }}
                        title="Open Kitchen Menu"
                        className="p-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white shadow-sm transition-transform active:scale-95 shrink-0"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
