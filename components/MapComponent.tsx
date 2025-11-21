"use client";

import "leaflet/dist/leaflet.css";

import { useEffect, useState } from 'react';
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
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        map.invalidateSize();
      });
    });
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

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-full h-full bg-gray-100 animate-pulse" />;
  }

  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={15}
      scrollWheelZoom={false}
      className="h-full w-full"
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
