"use client";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useState, useEffect } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function LocationMarker({ onSelect, initialPosition }) {
    const [position, setPosition] = useState(initialPosition);

    useMapEvents({
        click(e) {
            setPosition(e.latlng);
            onSelect(e.latlng);
        },
    });

    return position ? <Marker position={position} /> : null;
}

export default function MapPicker({ onLocationSelect, initialPosition = { lat: 33.3152, lng: 44.3661 } }) {
    const [position, setPosition] = useState(initialPosition);

    useEffect(() => {
        if (initialPosition.lat && initialPosition.lng) {
            setPosition(initialPosition);
            onLocationSelect(initialPosition);
        }
    }, []);

    return (
        <MapContainer
            center={[position.lat, position.lng]}
            zoom={12}
            style={{
                height: "300px",
                width: "100%",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 0 10px rgba(0,0,0,0.3)",
                marginTop: "1rem"
            }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker onSelect={onLocationSelect} initialPosition={position} />
        </MapContainer>
    );
}
