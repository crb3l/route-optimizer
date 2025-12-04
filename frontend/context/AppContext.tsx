import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Job, Vehicle, OptimizationResult, Location } from '../types';
import { optimizeRoute, reverseGeocode } from '../services/api';

interface AppContextType {
  vehicles: Vehicle[];
  jobs: Job[];
  result: OptimizationResult | null;
  isLoading: boolean;
  highlightedStep: number | null;
  addJob: (location: Location) => Promise<void>;
  updateJob: (id: number, updates: Partial<Job>) => void;
  removeJob: (id: number) => void;
  updateVehicle: (updates: Partial<Vehicle>) => void;
  runOptimization: () => Promise<void>;
  clearAllJobs: () => void;
  setHighlightedStep: (stepIdx: number | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial Romania Center
const DEFAULT_DEPOT: Location = {
  lat: 44.4268,
  lng: 26.1025,
  address: "Bucharest, Romania"
};

export const AppProvider = ({ children }: { children?: ReactNode }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([{
    id: 1,
    startLocation: DEFAULT_DEPOT,
    capacity: 100
  }]);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedStep, setHighlightedStep] = useState<number | null>(null);

  const addJob = useCallback(async (location: Location) => {
    // If no address provided, try to fetch it
    let address = location.address;
    if (!address) {
       address = await reverseGeocode(location.lat, location.lng);
    }

    const newJob: Job = {
      id: Date.now(), // simple unique id
      location: { ...location, address },
      deliveryAmount: 10,
      serviceTime: 300
    };

    setJobs(prev => [...prev, newJob]);
    // Invalidate previous results when data changes
    setResult(null);
  }, []);

  const updateJob = useCallback((id: number, updates: Partial<Job>) => {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, ...updates } : j));
    setResult(null);
  }, []);

  const removeJob = useCallback((id: number) => {
    setJobs(prev => prev.filter(j => j.id !== id));
    setResult(null);
  }, []);

  const updateVehicle = useCallback((updates: Partial<Vehicle>) => {
    setVehicles(prev => prev.map(v => v.id === 1 ? { ...v, ...updates } : v));
    setResult(null);
  }, []);

  const clearAllJobs = useCallback(() => {
    setJobs([]);
    setResult(null);
  }, []);

  const runOptimization = useCallback(async () => {
    if (jobs.length === 0) return;
    setIsLoading(true);
    try {
      const data = await optimizeRoute(vehicles, jobs);
      setResult(data);
    } catch (e) {
      console.error(e);
      // In a real app, handle error toast here
    } finally {
      setIsLoading(false);
    }
  }, [vehicles, jobs]);

  return (
    <AppContext.Provider value={{
      vehicles,
      jobs,
      result,
      isLoading,
      highlightedStep,
      addJob,
      updateJob,
      removeJob,
      updateVehicle,
      runOptimization,
      clearAllJobs,
      setHighlightedStep
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};