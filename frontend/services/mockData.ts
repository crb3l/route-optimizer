import { OptimizationResult } from '../types';

// Used to simulate backend response if API is unreachable
export const mockOptimizationResponse = (vehicles: any[], jobs: any[]): OptimizationResult => {
  const steps: any[] = [];
  let currentTime = 0;
  let currentLoad = 0;
  
  // Start
  const vehicle = vehicles[0];
  steps.push({
    type: 'start',
    location: [vehicle.startLocation.lng, vehicle.startLocation.lat],
    arrival: currentTime,
    load: [0],
    distance: 0,
    duration: 0
  });

  // Simple TSP-ish mock (just order by index for demo)
  jobs.forEach((job, idx) => {
    currentTime += 600 + Math.random() * 300; // Fake travel time
    currentLoad += job.deliveryAmount;
    steps.push({
      type: 'job',
      location: [job.location.lng, job.location.lat],
      arrival: currentTime,
      load: [currentLoad],
      distance: 2500 + Math.random() * 1000,
      duration: 600,
      jobId: job.id,
      address: job.location.address || `Job Location ${job.id}`
    });
    currentTime += job.serviceTime;
  });

  // End (return to start)
  steps.push({
    type: 'end',
    location: [vehicle.startLocation.lng, vehicle.startLocation.lat],
    arrival: currentTime + 600,
    load: [currentLoad],
    distance: 3000,
    duration: 600
  });

  return {
    code: 0,
    summary: {
      cost: 100,
      totalDistance: steps.reduce((acc, s) => acc + s.distance, 0),
      totalDuration: currentTime,
      totalDelivery: currentLoad,
      unassigned: 0
    },
    routes: [{
      vehicleId: vehicle.id,
      steps: steps,
      totalDistance: steps.reduce((acc, s) => acc + s.distance, 0),
      totalDuration: currentTime
    }]
  };
};