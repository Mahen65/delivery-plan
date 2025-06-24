// delivery-app/src/interfaces.ts
// Defines shared TypeScript interfaces for data structures used throughout the application.
// Now includes interfaces for User authentication and management.

export interface Delivery {
    id: number;
    description?: string;
    origin_address: string;
    destination_address: string;
    origin_lat: number;
    origin_lon: number;
    destination_lat: number;
    destination_lon: number;
    weight_kg: number;
    volume_m3: number;
    delivery_window_start: string; // ISO string
    delivery_window_end: string;   // ISO string
    status: string;
    assigned_rider_id?: number | null;
    route_details?: {
        estimated_time_minutes: number;
        distance_km: number;
        waypoints: [number, number][]; // Array of [lat, lon]
    } | null;
    created_at: string;
    updated_at: string;
}

export interface Rider {
    id: number;
    name: string;
    contact_number: string;
    vehicle_type: string;
    capacity_weight_kg: number;
    capacity_volume_m3: number;
    current_location_lat?: number | null;
    current_location_lon?: number | null;
    is_available: boolean;
    shift_start?: string | null; // ISO string
    shift_end?: string | null;   // ISO string
    created_at: string;
    updated_at: string;
}

export interface PlanningResult {
    assignments: Array<{
        delivery_id: number;
        rider_id: number;
        reason: string;
        route_details: {
            estimated_time_minutes: number;
            distance_km: number;
            waypoints: [number, number][];
        };
    }>;
    unassigned_deliveries: number[];
    message: string;
}

// Interfaces for form data, which might have string types for number inputs
export interface DeliveryForm {
    description: string;
    origin_address: string;
    destination_address: string;
    origin_lat: string;
    origin_lon: string;
    destination_lat: string;
    destination_lon: string;
    weight_kg: string;
    volume_m3: string;
    delivery_window_start: string;
    delivery_window_end: string;
}

export interface RiderForm {
    name: string;
    contact_number: string;
    vehicle_type: string;
    capacity_weight_kg: string;
    capacity_volume_m3: string;
    current_location_lat: string;
    current_location_lon: string;
    is_available: boolean;
    shift_start: string;
    shift_end: string;
}

// --- NEW USER AUTHENTICATION INTERFACES ---

export interface UserCreate {
    email: string;
    password: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface Token {
    access_token: string;
    token_type: string;
}

export interface UserResponse {
    id: number;
    email: string;
    is_active: boolean;
    is_superuser: boolean;
    created_at: string; // ISO string
    updated_at?: string | null; // ISO string
}
