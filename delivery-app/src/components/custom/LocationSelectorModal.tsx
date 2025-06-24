// delivery-app/src/components/custom/LocationSelectorModal.tsx
// This component provides a modal to select a location purely from a Leaflet map.
// It allows clicking on the map to set a marker and confirm the coordinates,
// with a mock address derived from the coordinates.

import  { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Don't forget Leaflet's CSS
import L from 'leaflet';

// Fix for default Leaflet icon issues with Webpack/React
delete (L.Icon.Default.prototype as { _getIconUrl?: () => string })._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface Location {
    address: string;
    lat: number;
    lon: number;
}

interface LocationSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectLocation: (location: Location) => void;
    title: string;
    description: string;
    // Optional initial location to center the map on
    initialLocation?: { lat: number; lon: number };
}

const DEFAULT_CENTER: L.LatLngTuple = [6.9271, 79.8612]; // Colombo, Sri Lanka
const DEFAULT_ZOOM = 12;
const SELECTED_ZOOM = 15; // Zoom in when a specific location is active

// Main LocationSelectorModal component
const LocationSelectorModal = ({
                                   isOpen,
                                   onClose,
                                   onSelectLocation,
                                   title,
                                   description,
                                   initialLocation,
                               }: LocationSelectorModalProps) => {
    // State for the position of the marker on the map
    const [markerPosition, setMarkerPosition] = useState<L.LatLngTuple | null>(null);
    // State for the selected location (including mock address)
    const [selectedLocationOutput, setSelectedLocationOutput] = useState<Location | null>(null);

    // Ref to hold the Leaflet map instance for imperative control
    const mapRef = useRef<L.Map | null>(null);

    // Effect to initialize marker and map view when modal opens or initialLocation changes
    useEffect(() => {
        if (isOpen) {
            if (initialLocation && initialLocation.lat != null && initialLocation.lon != null) {
                const latLng: L.LatLngTuple = [initialLocation.lat, initialLocation.lon];
                setMarkerPosition(latLng);
                // Create a mock address for the initial location if it exists
                setSelectedLocationOutput({
                    address: `Lat: ${initialLocation.lat.toFixed(4)}, Lon: ${initialLocation.lon.toFixed(4)}`,
                    lat: initialLocation.lat,
                    lon: initialLocation.lon,
                });
                // If mapRef.current is already set, update the view immediately
                if (mapRef.current) {
                    mapRef.current.setView(latLng, SELECTED_ZOOM);
                }
            } else {
                setMarkerPosition(null);
                setSelectedLocationOutput(null);
                // If mapRef.current is already set, reset the view immediately
                if (mapRef.current) {
                    mapRef.current.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
                }
            }
        }
    }, [isOpen, initialLocation]); // Depend on isOpen and initialLocation

    // Component to handle map clicks and provide map instance
    const MapClickHandlerAndInitializer = () => {
        const map = useMap(); // Get the map instance from context
        mapRef.current = map; // Assign map instance to ref

        // This useEffect ensures the map view is set after the map instance is available
        // and whenever initialLocation changes (e.g., dialog opens with new coords)
        useEffect(() => {
            if (initialLocation && initialLocation.lat != null && initialLocation.lon != null) {
                map.setView([initialLocation.lat, initialLocation.lon], SELECTED_ZOOM);
            } else {
                map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
            }
        }, [map, initialLocation]); // Depend on map and initialLocation

        useMapEvents({
            click(e) {
                const newLat = e.latlng.lat;
                const newLon = e.latlng.lng;
                setMarkerPosition([newLat, newLon]);
                // Mock address from coordinates
                const mockAddress = `Selected: Lat ${newLat.toFixed(4)}, Lon ${newLon.toFixed(4)}`;
                setSelectedLocationOutput({ address: mockAddress, lat: newLat, lon: newLon });
            },
        });

        return null; // This component does not render anything visible
    };

    const handleConfirmSelection = () => {
        if (selectedLocationOutput) {
            onSelectLocation(selectedLocationOutput);
            onClose(); // Close the modal after selection
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px] w-[95%] h-[80vh] flex flex-col p-6 rounded-lg shadow-xl">
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle className="text-2xl font-bold text-gray-800">{title}</DialogTitle>
                    <DialogDescription className="text-gray-600 mb-4">{description}</DialogDescription>
                    {selectedLocationOutput && (
                        <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-md text-sm mb-4">
                            <p className="font-semibold">Current Selection:</p>
                            <p>{selectedLocationOutput.address}</p>
                            <p>Lat: {selectedLocationOutput.lat.toFixed(6)}, Lon: {selectedLocationOutput.lon.toFixed(6)}</p>
                        </div>
                    )}
                </DialogHeader>

                {/* Map Area */}
                <div className="flex-grow rounded-lg overflow-hidden border border-gray-300 shadow-inner">
                    <MapContainer
                        center={initialLocation ? [initialLocation.lat, initialLocation.lon] : DEFAULT_CENTER}
                        zoom={initialLocation ? SELECTED_ZOOM : DEFAULT_ZOOM}
                        scrollWheelZoom={true}
                        className="w-full h-full"
                        style={{ minHeight: '100%', minWidth: '100%' }} // Ensure map fills container
                    >
                        <TileLayer
                            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {markerPosition && (
                            <Marker position={markerPosition}>
                                <Popup>
                                    <b>Selected Location</b><br/>
                                    Lat: {markerPosition[0].toFixed(4)}, Lon: {markerPosition[1].toFixed(4)}
                                </Popup>
                            </Marker>
                        )}
                        <MapClickHandlerAndInitializer />
                    </MapContainer>
                </div>

                {/* Action Buttons */}
                <div className="flex-shrink-0 mt-4 pt-4 border-t border-gray-200 flex justify-end space-x-2">
                    <Button type="button" onClick={onClose} variant="ghost" className="bg-gray-100 text-gray-800 hover:bg-gray-200">
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleConfirmSelection}
                        disabled={!selectedLocationOutput}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        Confirm Selection
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default LocationSelectorModal;
