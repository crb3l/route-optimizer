export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface Vehicle {
  id: number;
  startLocation: Location;
  endLocation?: Location;
  capacity: number;
}

export interface Job {
  id: number;
  location: Location;
  deliveryAmount: number;
  serviceTime: number; // in seconds
}

export type StepType = 'start' | 'job' | 'end';

export interface RouteStep {
  type: StepType;
  location: [number, number]; // [lon, lat] for API consistency, but we usually use {lat, lng} for Leaflet
  arrival: number; // timestamp or offset
  duration: number;
  distance: number;
  load: number[];
  jobId?: number;
  address?: string;
}

export interface Route {
  vehicleId: number;
  steps: RouteStep[];
  totalDistance: number;
  totalDuration: number;
}

export interface OptimizationSummary {
  cost: number;
  totalDistance: number;
  totalDuration: number;
  totalDelivery: number;
  unassigned: number;
}

export interface OptimizationResult {
  code: number;
  summary: OptimizationSummary;
  routes: Route[];
}

export interface MapViewState {
  center: [number, number];
  zoom: number;
}