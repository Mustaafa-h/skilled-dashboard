"use client";

import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function LocationMarker({ position, onLocationSelect }) {
  const [markerPosition, setMarkerPosition] = useState(position);
  const map = useMap();

  useEffect(() => {
    const lat = Number(position.lat);
    const lng = Number(position.lng);
    if (!isNaN(lat) && !isNaN(lng)) {
      const newPos = { lat, lng };
      setMarkerPosition(newPos);
      map.setView([lat, lng], map.getZoom());
    }
  }, [position, map]);

  useMapEvents({
    click(e) {
      const newLatLng = { lat: e.latlng.lat, lng: e.latlng.lng };
      setMarkerPosition(newLatLng);
      if (typeof onLocationSelect === "function") {
        onLocationSelect(newLatLng);
      }
    },
  });

  return markerPosition ? <Marker position={markerPosition} /> : null;
}

export default function MapPicker({ lat = 33.3152, lng = 44.3661, onLocationSelect }) {
  const position = {
    lat: Number(lat) || 33.3152,
    lng: Number(lng) || 44.3661,
  };

  return (
    <div style={{ marginTop: "1rem", width: "100%" }}>
      <MapContainer
        center={[position.lat, position.lng]}
        zoom={13}
        style={{
          height: "300px",
          width: "100%",
          borderRadius: "12px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
        }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LocationMarker position={position} onLocationSelect={onLocationSelect} />
      </MapContainer>
    </div>
  );
}
