import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

interface LeafletMapProps {
  center: [number, number];
  zoom?: number;
  restaurantLocation?: [number, number];
  restaurantName?: string;
  deliveryLocation?: [number, number];
  deliveryAddress?: string;
  courierLocation?: [number, number];
  courierName?: string;
  interactive?: boolean;
  className?: string;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  center,
  zoom = 14,
  restaurantLocation,
  restaurantName = 'Restaurant',
  deliveryLocation,
  deliveryAddress = 'Delivery Destination',
  courierLocation,
  courierName = 'Courier Rohan',
  interactive = true,
  className = 'h-72 w-full rounded-2xl overflow-hidden',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Fix default marker icon assets for Leaflet in bundlers
    delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center,
        zoom,
        zoomControl: interactive,
        dragging: interactive,
        scrollWheelZoom: false,
      });

      // OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers and route polyline when locations change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = markersRef.current;
    if (!map || !group) return;

    group.clearLayers();
    const latLngs: L.LatLngExpression[] = [];

    // Restaurant marker (Red foodie pin)
    if (restaurantLocation) {
      const restIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `<div style="background-color: #dc2626; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(220,38,38,0.5); border: 2px solid #ffffff; font-size: 16px;">🍴</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });
      const m = L.marker(restaurantLocation, { icon: restIcon })
        .bindPopup(`<strong>${restaurantName}</strong><br/>Kitchen Dispatch`)
        .addTo(group);
      latLngs.push(restaurantLocation);
    }

    // Delivery Address marker (Green Home pin)
    if (deliveryLocation) {
      const destIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `<div style="background-color: #10b981; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(16,185,129,0.5); border: 2px solid #ffffff; font-size: 16px;">🏠</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });
      L.marker(deliveryLocation, { icon: destIcon })
        .bindPopup(`<strong>Your Address</strong><br/>${deliveryAddress}`)
        .addTo(group);
      latLngs.push(deliveryLocation);
    }

    // Courier marker (Red delivery scooter pin)
    if (courierLocation) {
      const courierIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `<div style="background-color: #e11d48; width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(225,29,72,0.6); border: 3px solid #ffffff; font-size: 18px; animation: pulse 2s infinite;">🛵</div>`,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      });
      L.marker(courierLocation, { icon: courierIcon })
        .bindPopup(`<strong>${courierName}</strong><br/>Live Courier Location`)
        .addTo(group);
      latLngs.push(courierLocation);
    }

    // Connect with Route Polyline
    if (latLngs.length > 1) {
      const polyline = L.polyline(latLngs, {
        color: '#dc2626',
        weight: 4,
        opacity: 0.8,
        dashArray: '8, 8',
      }).addTo(group);

      map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
    } else if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, restaurantLocation, deliveryLocation, courierLocation, restaurantName, deliveryAddress, courierName]);

  return (
    <div className={`relative ${className} z-0 shadow-inner border border-stone-200 dark:border-stone-800`}>
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};
