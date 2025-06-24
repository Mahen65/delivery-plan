// delivery-app/src/pages/DeliveryPage.tsx
// This component handles displaying, adding, and managing delivery packages.
// Now uses a map for coordinate input.

import React, { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import type { Delivery, DeliveryForm } from '../interfaces';
import { getDeliveries, createDelivery } from '../api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import LocationPickerMap from '@/components/custom/LocationPickerMap'; // NEW: Import map component
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';

interface DeliveryPageProps {
    showMessage: (msg: string, type?: 'info' | 'success' | 'error') => void;
    authToken: string;
}

const DeliveryPage: React.FC<DeliveryPageProps> = ({ showMessage, authToken }) => {
    const [deliveries, setDeliveries] = useState<Delivery[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [form, setForm] = useState<DeliveryForm>({
        description: '',
        origin_address: '',
        destination_address: '',
        origin_lat: '', // Now handled by map
        origin_lon: '', // Now handled by map
        destination_lat: '', // Now handled by map
        destination_lon: '', // Now handled by map
        weight_kg: '',
        volume_m3: '',
        delivery_window_start: '',
        delivery_window_end: '',
    });

    const [isOriginMapOpen, setIsOriginMapOpen] = useState(false);
    const [isDestinationMapOpen, setIsDestinationMapOpen] = useState(false);

    useEffect(() => {
        fetchDeliveries();
    }, [authToken]);

    const fetchDeliveries = async () => {
        setLoading(true);
        try {
            const data = await getDeliveries(authToken);
            setDeliveries(data);
            showMessage('Deliveries loaded successfully!', 'info');
        } catch (error: unknown) {
            const err=error as Error;
            console.error('Error fetching deliveries:', err);
            showMessage(`Error fetching deliveries: ${err.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleOriginLocationSelect = (lat: number, lon: number) => {
        setForm(prevForm => ({
            ...prevForm,
            origin_lat: lat.toString(),
            origin_lon: lon.toString(),
        }));
        setIsOriginMapOpen(false); // Close dialog after selection
    };

    const handleDestinationLocationSelect = (lat: number, lon: number) => {
        setForm(prevForm => ({
            ...prevForm,
            destination_lat: lat.toString(),
            destination_lon: lon.toString(),
        }));
        setIsDestinationMapOpen(false); // Close dialog after selection
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Validate coordinates
        if (!form.origin_lat || !form.origin_lon || !form.destination_lat || !form.destination_lon) {
            showMessage('Please select both origin and destination locations on the map.', 'error');
            setLoading(false);
            return;
        }

        try {
            const data = await createDelivery(form, authToken);
            showMessage(`Delivery created: ${data.id}`, 'success');
            setForm({ // Reset form fields
                description: '', origin_address: '', destination_address: '',
                origin_lat: '', origin_lon: '', destination_lat: '', destination_lon: '',
                weight_kg: '', volume_m3: '', delivery_window_start: '', delivery_window_end: '',
            });
            fetchDeliveries(); // Refresh list
        } catch (error: unknown) {
            const err = error as Error;
            console.error('Error creating delivery:', err);
            showMessage(`Error creating delivery: ${err.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <Card className="p-6">
                <CardHeader className="p-0 pb-4">
                    <CardTitle className="text-xl font-semibold text-gray-800">Add New Delivery</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Input type="text" id="description" name="description" value={form.description} onChange={handleChange} placeholder="e.g., Electronics package" />
                        </div>
                        <div>
                            <Label htmlFor="origin_address">Origin Address</Label>
                            <Input type="text" id="origin_address" name="origin_address" value={form.origin_address} onChange={handleChange} placeholder="123 Main St" required />
                        </div>
                        {/* Map Picker for Origin */}
                        <div>
                            <Label>Origin Location (Lat/Lon)</Label>
                            <div className="flex space-x-2">
                                <Input type="text" value={form.origin_lat ? `${form.origin_lat}, ${form.origin_lon}` : 'Select on map'} readOnly placeholder="Select Origin on map" />
                                <Dialog open={isOriginMapOpen} onOpenChange={setIsOriginMapOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline">Pick on Map</Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[800px] w-full h-[500px] p-0 overflow-hidden">
                                        <DialogHeader className="p-4 pb-0">
                                            <DialogTitle>Select Origin Location</DialogTitle>
                                            <DialogDescription>Click on the map to select the origin coordinates.</DialogDescription>
                                        </DialogHeader>
                                        <div className="p-4 pt-0 h-full"> {/* Ensure map container has height */}
                                            {isOriginMapOpen && ( // Only render map when dialog is open
                                                <LocationPickerMap
                                                    initialLat={form.origin_lat ? parseFloat(form.origin_lat) : null}
                                                    initialLon={form.origin_lon ? parseFloat(form.origin_lon) : null}
                                                    onLocationSelect={handleOriginLocationSelect}
                                                    height="400px" // Height for the map within dialog
                                                />
                                            )}
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="destination_address">Destination Address</Label>
                            <Input type="text" id="destination_address" name="destination_address" value={form.destination_address} onChange={handleChange} placeholder="456 Oak Ave" required />
                        </div>
                        {/* Map Picker for Destination */}
                        <div>
                            <Label>Destination Location (Lat/Lon)</Label>
                            <div className="flex space-x-2">
                                <Input type="text" value={form.destination_lat ? `${form.destination_lat}, ${form.destination_lon}` : 'Select on map'} readOnly placeholder="Select Destination on map" />
                                <Dialog open={isDestinationMapOpen} onOpenChange={setIsDestinationMapOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline">Pick on Map</Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[800px] w-full h-[500px] p-0 overflow-hidden">
                                        <DialogHeader className="p-4 pb-0">
                                            <DialogTitle>Select Destination Location</DialogTitle>
                                            <DialogDescription>Click on the map to select the destination coordinates.</DialogDescription>
                                        </DialogHeader>
                                        <div className="p-4 pt-0 h-full"> {/* Ensure map container has height */}
                                            {isDestinationMapOpen && ( // Only render map when dialog is open
                                                <LocationPickerMap
                                                    initialLat={form.destination_lat ? parseFloat(form.destination_lat) : null}
                                                    initialLon={form.destination_lon ? parseFloat(form.destination_lon) : null}
                                                    onLocationSelect={handleDestinationLocationSelect}
                                                    height="400px" // Height for the map within dialog
                                                />
                                            )}
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="weight_kg">Weight (kg)</Label>
                                <Input type="number" step="0.01" id="weight_kg" name="weight_kg" value={form.weight_kg} onChange={handleChange} placeholder="e.g., 2.5" required />
                            </div>
                            <div>
                                <Label htmlFor="volume_m3">Volume (m³)</Label>
                                <Input type="number" step="0.01" id="volume_m3" name="volume_m3" value={form.volume_m3} onChange={handleChange} placeholder="e.g., 0.01" required />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="delivery_window_start">Delivery Window Start</Label>
                            <Input type="datetime-local" id="delivery_window_start" name="delivery_window_start" value={form.delivery_window_start} onChange={handleChange} required />
                        </div>
                        <div>
                            <Label htmlFor="delivery_window_end">Delivery Window End</Label>
                            <Input type="datetime-local" id="delivery_window_end" name="delivery_window_end" value={form.delivery_window_end} onChange={handleChange} required />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Adding...' : 'Add Delivery'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card className="p-6">
                <CardHeader className="p-0 pb-4">
                    <CardTitle className="text-xl font-semibold text-gray-800">All Deliveries</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <p className="text-center text-gray-600">Loading deliveries...</p>
                    ) : deliveries.length === 0 ? (
                        <p className="text-center text-gray-600">No deliveries found. Add one above!</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Assigned Rider</TableHead>
                                        <TableHead>From</TableHead>
                                        <TableHead>To</TableHead>
                                        <TableHead>Weight/Volume</TableHead>
                                        <TableHead>Window</TableHead>
                                        <TableHead>Route (Est. Time/Dist)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {deliveries.map((delivery) => (
                                        <TableRow key={delivery.id}>
                                            <TableCell className="font-medium">{delivery.id}</TableCell>
                                            <TableCell>{delivery.description || 'N/A'}</TableCell>
                                            <TableCell>
                        <span className={`font-medium ${delivery.status === 'assigned' ? 'text-green-600' : 'text-yellow-600'}`}>
                          {delivery.status}
                        </span>
                                            </TableCell>
                                            <TableCell>{delivery.assigned_rider_id || 'N/A'}</TableCell>
                                            <TableCell className="text-sm">
                                                {delivery.origin_address}
                                                <br/>
                                                ({delivery.origin_lat}, {delivery.origin_lon})
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {delivery.destination_address}
                                                <br/>
                                                ({delivery.destination_lat}, {delivery.destination_lon})
                                            </TableCell>
                                            <TableCell className="text-sm">{delivery.weight_kg}kg / {delivery.volume_m3}m³</TableCell>
                                            <TableCell className="text-sm">
                                                {new Date(delivery.delivery_window_start).toLocaleDateString()}
                                                <br />
                                                {new Date(delivery.delivery_window_start).toLocaleTimeString()} - {new Date(delivery.delivery_window_end).toLocaleTimeString()}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {delivery.route_details ? (
                                                    <>
                                                        {delivery.route_details.estimated_time_minutes} mins<br/>
                                                        {delivery.route_details.distance_km} km
                                                    </>
                                                ) : 'N/A'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default DeliveryPage;
