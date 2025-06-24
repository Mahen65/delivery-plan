// delivery-app/src/pages/RiderPage.tsx
// This component handles displaying, adding, and managing riders.
// Now uses a map for current location input.

import { useState, useEffect,type ChangeEvent, type FormEvent } from 'react';
import type { Rider, RiderForm } from '../interfaces';
import { getRiders, createRider } from '../api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import LocationPickerMap from '@/components/custom/LocationPickerMap'; // NEW: Import map component
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';


interface RiderPageProps {
    showMessage: (msg: string, type?: 'info' | 'success' | 'error') => void;
    authToken: string;
}

const RiderPage = ({ showMessage, authToken }:RiderPageProps) => {
    const [riders, setRiders] = useState<Rider[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [form, setForm] = useState<RiderForm>({
        name: '',
        contact_number: '',
        vehicle_type: 'motorcycle',
        capacity_weight_kg: '',
        capacity_volume_m3: '',
        current_location_lat: '', // Now handled by map
        current_location_lon: '', // Now handled by map
        is_available: true,
        shift_start: '',
        shift_end: '',
    });

    const [isLocationMapOpen, setIsLocationMapOpen] = useState(false);

    useEffect(() => {
        fetchRiders();
    }, [authToken]);

    const fetchRiders = async () => {
        setLoading(true);
        try {
            const data = await getRiders(authToken);
            setRiders(data);
            showMessage('Riders loaded successfully!', 'info');
        } catch (error: unknown) {
            const err = error as Error;
            console.error('Error fetching riders:', err);
            showMessage(`Error fetching riders: ${err.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setForm({
            ...form,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleLocationSelect = (lat: number, lon: number) => {
        setForm(prevForm => ({
            ...prevForm,
            current_location_lat: lat.toString(),
            current_location_lon: lon.toString(),
        }));
        setIsLocationMapOpen(false); // Close dialog after selection
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Validate coordinates for rider (optional, but good practice if required)
        if (form.current_location_lat === '' || form.current_location_lon === '') {
            // This is now optional as per API design, so no validation needed unless specified otherwise.
            // If you make it required, add:
            // showMessage('Please select the current location on the map.', 'error');
            // setLoading(false);
            // return;
        }

        try {
            const data = await createRider(form, authToken);
            showMessage(`Rider created: ${data.id}`, 'success');
            setForm({ // Reset form fields
                name: '', contact_number: '', vehicle_type: 'motorcycle',
                capacity_weight_kg: '', capacity_volume_m3: '',
                current_location_lat: '', current_location_lon: '',
                is_available: true, shift_start: '', shift_end: '',
            });
            fetchRiders(); // Refresh list
        } catch (error: unknown) {
            const err = error as Error;
            console.error('Error creating rider:', err);
            showMessage(`Error creating rider: ${err.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <Card className="p-6">
                <CardHeader className="p-0 pb-4">
                    <CardTitle className="text-xl font-semibold text-gray-800">Add New Rider</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="name">Name</Label>
                            <Input type="text" id="name" name="name" value={form.name} onChange={handleChange} placeholder="John Doe" required />
                        </div>
                        <div>
                            <Label htmlFor="contact_number">Contact Number</Label>
                            <Input type="text" id="contact_number" name="contact_number" value={form.contact_number} onChange={handleChange} placeholder="+94771234567" required />
                        </div>
                        <div>
                            <Label htmlFor="vehicle_type">Vehicle Type</Label>
                            <select name="vehicle_type" id="vehicle_type" value={form.vehicle_type} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                <option value="motorcycle">Motorcycle</option>
                                <option value="car">Car</option>
                                <option value="van">Van</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="capacity_weight_kg">Capacity Weight (kg)</Label>
                                <Input type="number" step="0.01" id="capacity_weight_kg" name="capacity_weight_kg" value={form.capacity_weight_kg} onChange={handleChange} placeholder="e.g., 10.0" required />
                            </div>
                            <div>
                                <Label htmlFor="capacity_volume_m3">Capacity Volume (m³)</Label>
                                <Input type="number" step="0.01" id="capacity_volume_m3" name="capacity_volume_m3" value={form.capacity_volume_m3} onChange={handleChange} placeholder="e.g., 0.1" required />
                            </div>
                        </div>
                        {/* Map Picker for Current Location */}
                        <div>
                            <Label>Current Location (Lat/Lon - Optional)</Label>
                            <div className="flex space-x-2">
                                <Input type="text" value={form.current_location_lat ? `${form.current_location_lat}, ${form.current_location_lon}` : 'Select on map (Optional)'} readOnly placeholder="Select current location on map" />
                                <Dialog open={isLocationMapOpen} onOpenChange={setIsLocationMapOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline">Pick on Map</Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[800px] w-full h-[500px] p-0 overflow-hidden">
                                        <DialogHeader className="p-4 pb-0">
                                            <DialogTitle>Select Current Location</DialogTitle>
                                            <DialogDescription>Click on the map to select the rider's current coordinates.</DialogDescription>
                                        </DialogHeader>
                                        <div className="p-4 pt-0 h-full">
                                            {isLocationMapOpen && ( // Only render map when dialog is open
                                                <LocationPickerMap
                                                    initialLat={form.current_location_lat ? parseFloat(form.current_location_lat) : null}
                                                    initialLon={form.current_location_lon ? parseFloat(form.current_location_lon) : null}
                                                    onLocationSelect={handleLocationSelect}
                                                    height="400px"
                                                />
                                            )}
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>

                        <label className="flex items-center space-x-2 text-gray-700">
                            <input type="checkbox" name="is_available" checked={form.is_available} onChange={handleChange} className="form-checkbox h-4 w-4 text-blue-600 rounded" />
                            <span>Is Available</span>
                        </label>
                        <div>
                            <Label htmlFor="shift_start">Shift Start (Optional)</Label>
                            <Input type="datetime-local" id="shift_start" name="shift_start" value={form.shift_start} onChange={handleChange} />
                        </div>
                        <div>
                            <Label htmlFor="shift_end">Shift End (Optional)</Label>
                            <Input type="datetime-local" id="shift_end" name="shift_end" value={form.shift_end} onChange={handleChange} />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Adding...' : 'Add Rider'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card className="p-6">
                <CardHeader className="p-0 pb-4">
                    <CardTitle className="text-xl font-semibold text-gray-800">All Riders</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <p className="text-center text-gray-600">Loading riders...</p>
                    ) : riders.length === 0 ? (
                        <p className="text-center text-gray-600">No riders found. Add one above!</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead>Vehicle</TableHead>
                                        <TableHead>Capacity</TableHead>
                                        <TableHead>Location</TableHead>
                                        <TableHead>Availability</TableHead>
                                        <TableHead>Shift</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {riders.map((rider) => (
                                        <TableRow key={rider.id}>
                                            <TableCell className="font-medium">{rider.id}</TableCell>
                                            <TableCell>{rider.name}</TableCell>
                                            <TableCell>{rider.contact_number}</TableCell>
                                            <TableCell>{rider.vehicle_type}</TableCell>
                                            <TableCell className="text-sm">{rider.capacity_weight_kg}kg / {rider.capacity_volume_m3}m³</TableCell>
                                            <TableCell className="text-sm">
                                                {rider.current_location_lat !== undefined && rider.current_location_lon !== undefined && rider.current_location_lat !== null && rider.current_location_lon !== null
                                                    ? `(${rider.current_location_lat}, ${rider.current_location_lon})`
                                                    : 'N/A'
                                                }
                                            </TableCell>
                                            <TableCell>
                        <span className={`font-medium ${rider.is_available ? 'text-green-600' : 'text-red-600'}`}>
                          {rider.is_available ? 'Available' : 'Not Available'}
                        </span>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {rider.shift_start && rider.shift_end ? (
                                                    <>
                                                        {new Date(rider.shift_start).toLocaleDateString()}<br/>
                                                        {new Date(rider.shift_start).toLocaleTimeString()} - {new Date(rider.shift_end).toLocaleTimeString()}
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

export default RiderPage;
