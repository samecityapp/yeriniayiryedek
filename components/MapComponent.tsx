"use client";

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function MapResizer() {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => clearTimeout(timer);
  }, [map]);

  return null;
}

interface MapComponentProps {
  latitude: number;
  longitude: number;
  address?: string;
}

export default function MapComponent({ latitude, longitude, address }: MapComponentProps) {
  const [mounted, setMounted] = useState(false);
  const [cssLoaded, setCssLoaded] = useState(false);

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = '';

    link.onload = () => {
      setCssLoaded(true);
      setTimeout(() => setMounted(true), 50);
    };

    document.head.appendChild(link);

    return () => {
      if (link.parentNode) {
        document.head.removeChild(link);
      }
    };
  }, []);

  if (!mounted || !cssLoaded) {
    return <div className="w-full h-full bg-gray-100 animate-pulse" />;
  }

  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={15}
      scrollWheelZoom={false}
      style={{ height: '100%', width: '100%', position: 'absolute', top: 0, left: 0 }}
      attributionControl={false}
    >
      <MapResizer />
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      <Marker position={[latitude, longitude]}>
        {address && (
          <Popup>
            <div className="text-sm font-medium">{address}</div>
          </Popup>
        )}
      </Marker>
    </MapContainer>
  );
}
