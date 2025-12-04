import { Job, Vehicle, OptimizationResult } from '../types';
import { mockOptimizationResponse } from './mockData';

const API_URL = 'http://localhost:8000';

export const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
    );
    const data = await response.json();
    return data.display_name?.split(',')[0] || 'Unknown Location';
  } catch (error) {
    console.error('Geocoding error:', error);
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
};

export const optimizeRoute = async (vehicles: Vehicle[], jobs: Job[]): Promise<OptimizationResult> => {
  // Transform data to match the expected API payload
  const payload = {
    vehicles: vehicles.map(v => ({
      id: v.id,
      start: [v.startLocation.lng, v.startLocation.lat],
      end: [v.startLocation.lng, v.startLocation.lat], // Return to depot by default
      capacity: [v.capacity]
    })),
    jobs: jobs.map(j => ({
      id: j.id,
      location: [j.location.lng, j.location.lat],
      delivery: [j.deliveryAmount],
      service: j.serviceTime
    }))
  };

  try {
    // Attempt real API call
    const response = await fetch(`${API_URL}/optimize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    return await response.json();
  } catch (error) {
    console.warn('Backend API unreachable, using local mock solver for demonstration.', error);
    // Fallback to mock data for demo purposes if backend is missing
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockOptimizationResponse(vehicles, jobs));
      }, 1500); // Fake delay
    });
  }
};