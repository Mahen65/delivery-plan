// delivery-app/src/api.ts
// Centralized API functions for interacting with the FastAPI backend.
// Now handles JWT authentication.

import type { Delivery, Rider, PlanningResult, DeliveryForm, RiderForm, UserCreate, LoginRequest, Token, UserResponse } from './interfaces';

// Base URL for your FastAPI backend
// During local development (browser access), use localhost and the mapped port.
// When running inside Docker Compose (container-to-container), use the service name and internal port.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api/v1';

// Generic API call helper with optional token
async function callApi<T>(
    endpoint: string,
    method: string,
    body?: unknown,
    token?: string // NEW: Optional token parameter
): Promise<T> {
    const fullUrl = `${API_BASE_URL}${endpoint}`;

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`; // Add Authorization header if token is provided
    }

    const requestOptions: RequestInit = {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    };

    console.log('--- API Request Debugging ---');
    console.log('Full URL:', fullUrl);
    console.log('Method:', method);
    console.log('Headers:', headers); // Log headers including Authorization
    console.log('Body:', body ? JSON.stringify(body, null, 2) : 'No body');
    console.log('--- End API Request Debugging ---');

    try {
        const response = await fetch(fullUrl, requestOptions);

        if (!response.ok) {
            const errorData = await response.json();
            let errorMessage = 'An unknown error occurred.';

            if (errorData.detail) {
                if (Array.isArray(errorData.detail) && errorData.detail.length > 0) {
                    errorMessage = errorData.detail
                        .map((e: unknown) => {
                            if (typeof e === 'object' && e !== null && 'msg' in e) {
                                return (e as { msg: string }).msg;
                            }
                            return 'Unknown error';
                        })
                        .join(', ');
                } else if (typeof errorData.detail === 'string') {
                    errorMessage = errorData.detail;
                } else {
                    errorMessage = JSON.stringify(errorData.detail);
                }
            }

            throw new Error(errorMessage);
        }

        if (response.status === 204) {
            return {} as T;
        }

        return response.json();
    } catch (error: unknown) {
        const err = error as Error;
        console.error('Fetch operation failed:', err);
        throw new Error(`Network error or fetch failed: ${err.message}`);
    }
}

// --- AUTHENTICATION API FUNCTIONS ---
export const registerUser = (userData: UserCreate): Promise<UserResponse> =>
    callApi<UserResponse>('/auth/register', 'POST', userData);

export const loginUser = (credentials: LoginRequest): Promise<Token> =>
    callApi<Token>('/auth/login', 'POST', credentials);

export const getCurrentUser = (token: string): Promise<UserResponse> =>
    callApi<UserResponse>('/auth/me', 'GET', undefined, token); // Pass token for protected endpoint

// --- DELIVERY API FUNCTIONS (NOW REQUIRE TOKEN) ---
export const getDeliveries = (token: string): Promise<Delivery[]> =>
    callApi<Delivery[]>('/deliveries', 'GET', undefined, token);

export const createDelivery = (deliveryForm: DeliveryForm, token: string): Promise<Delivery> => {
    const payload = {
        ...deliveryForm,
        weight_kg: parseFloat(deliveryForm.weight_kg),
        volume_m3: parseFloat(deliveryForm.volume_m3),
        origin_lat: parseFloat(deliveryForm.origin_lat),
        origin_lon: parseFloat(deliveryForm.origin_lon),
        destination_lat: parseFloat(deliveryForm.destination_lat),
        destination_lon: parseFloat(deliveryForm.destination_lon),
        delivery_window_start: new Date(deliveryForm.delivery_window_start).toISOString(),
        delivery_window_end: new Date(deliveryForm.delivery_window_end).toISOString(),
    };
    return callApi<Delivery>('/deliveries', 'POST', payload, token);
};

// --- RIDER API FUNCTIONS (NOW REQUIRE TOKEN) ---
export const getRiders = (token: string): Promise<Rider[]> =>
    callApi<Rider[]>('/riders', 'GET', undefined, token);

export const createRider = (riderForm: RiderForm, token: string): Promise<Rider> => {
    const current_location_lat = riderForm.current_location_lat ? parseFloat(riderForm.current_location_lat) : null;
    const current_location_lon = riderForm.current_location_lon ? parseFloat(riderForm.current_location_lon) : null;
    const shift_start = riderForm.shift_start ? new Date(riderForm.shift_start).toISOString() : null;
    const shift_end = riderForm.shift_end ? new Date(riderForm.shift_end).toISOString() : null;

    const payload = {
        ...riderForm,
        capacity_weight_kg: parseFloat(riderForm.capacity_weight_kg),
        capacity_volume_m3: parseFloat(riderForm.capacity_volume_m3),
        current_location_lat: current_location_lat,
        current_location_lon: current_location_lon,
        shift_start: shift_start,
        shift_end: shift_end,
    };
    return callApi<Rider>('/riders', 'POST', payload, token);
};

// --- PLANNING API FUNCTION (NOW REQUIRES TOKEN) ---
export const runPlanningAgent = (token: string): Promise<PlanningResult> =>
    callApi<PlanningResult>('/deliveries/assign_and_plan', 'POST', undefined, token);
