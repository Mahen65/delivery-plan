// delivery-app/src/components/custom/LocationPickerMap.tsx
// A reusable React-Leaflet component for picking a location on a map.

import  { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'; // NEW: Import useMap
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS

// Fix for default marker icon issues with Webpack/Vite
delete (L.Icon.Default.prototype as { _getIconUrl?: () => string })._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface LocationPickerMapProps {
    initialLat?: number | null;
    initialLon?: number | null;
    onLocationSelect: (lat: number, lon: number) => void;
    height?: string; // e.g., "300px", "40vh"
}

const LocationPickerMap = ({
                               initialLat,
                               initialLon,
                               onLocationSelect,
                               height = '300px', // Default height
                           }: LocationPickerMapProps) => {
    // Use a default initial position if none is provided (e.g., center of a country/city)
    const defaultPosition: [number, number] = [6.9271, 79.8612]; // Colombo, Sri Lanka (example)

    const [position, setPosition] = useState<[number, number] | null>(() => {
        if (initialLat != null && initialLon != null) {
            return [initialLat as number, initialLon as number];
        }
        return null;
    });

    const mapRef = useRef<L.Map | null>(null); // Ref to the map instance

    // NEW: Component to handle initial map setup and updates
    const MapInitializer = () => {
        const map = useMap(); // Get the map instance from context
        mapRef.current = map; // Assign map instance to ref

        useEffect(() => {
            if (initialLat != null && initialLon != null) {
                const lat = initialLat as number;
                const lon = initialLon as number;

                // Update position for marker
                setPosition([lat, lon]);

                // Set map view when initial position changes
                map.setView([lat, lon], map.getZoom());
            } else {
                setPosition(null);
            }
        }, [initialLat, initialLon, map]); // Add map to dependency array

        return null;
    };

    // Component to handle map click events
    const MapClickHandler = () => {
        useMapEvents({
            click(e) {
                setPosition([e.latlng.lat, e.latlng.lng]);
                onLocationSelect(e.latlng.lat, e.latlng.lng);
            },
        });
        return null;
    };

    return (
        <div style={{ height: height, width: '100%', borderRadius: '0.5rem', overflow: 'hidden' }}>
            <MapContainer
                center={position || defaultPosition}
                zoom={position ? 15 : 10}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
        {position && <Marker position={position} />}
        <MapInitializer /> {/* NEW: Render the initializer component */}
        <MapClickHandler />
      </MapContainer>
    </div>
  );
};

export default LocationPickerMap;
