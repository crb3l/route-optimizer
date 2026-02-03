import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { useApp } from '../../context/AppContext';
import { Job, RouteStep } from '../../types';

//used to make a land path instead of air path for routing
import polyline from '@mapbox/polyline';


// Fix for default Leaflet markers in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons
const depotIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const jobIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const activeStepIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to handle map clicks
const MapEvents = () => {
  const { addJob } = useApp();
  useMapEvents({
    dblclick: (e) => {
      addJob({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
};

// Component to fit bounds
const BoundsFitter = ({ points }: { points: L.LatLngExpression[] }) => {
  const map = useMap();

  useEffect(() => {
    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.flyToBounds(bounds, { padding: [50, 50], duration: 1 });
    }
  }, [points, map]);

  return null;
};

export const MapController: React.FC = () => {
  const { vehicles, jobs, result, highlightedStep } = useApp();
  const vehicle = vehicles[0];

  // Decode route coordinates from result if available
  const routePositions = useMemo(() => {
    if (!result || !result.routes[0]) return [];
    // this was before my implementation
    // return result.routes[0].steps.map(step => [step.location[1], step.location[0]] as [number, number]);

    // //my implementation starts now

    // console.log('Full VROOM result:', result);
    // console.log('First step:', result.routes[0].steps[0]);
    // console.log('Second step:', result.routes[0].steps[1]);
    // const positions: [number, number][] = [];

    const route = result.routes[0]; // changesd steps.geomtry with route.gemoetry to see if that is the problem. becuase mabe the whoule route is shown, not the geometry per individual steps
    console.log('Route object:', route);
    console.log('Route has geometry:', !!route.geometry);
    // route.steps.forEach(step => {
    if (route.geometry) {
      try {
        const coords = polyline.decode(route.geometry);
        console.log(`Decoded ${coords.length} coordinates from route geometry`);
        console.log('First coord:', coords[0]);
        // coords.forEach(coord => { positions.push([coord[1], coord[0]]); })
        return coords.map(coord => [coord[0], coord[1]] as [number, number]);
      } catch (error) {
        console.log("Error decoding", error);
      }
    }
    //this is also for steps
    // else {
    //   positions.push([step.location[1], step.location[0]]);
    // }

    // });
    //if no route gemoetry use step geometry
    return result.routes[0].steps.map(step => [step.location[1], step.location[0]] as [number, number]);
    // return positions; //commented because it works with steps.geo not with route.geo
    // const routePositions = useMemo(() => {
    //   if (!result || !result.routes[0]) return [];

    //   console.log('=== DEBUGGING ROUTE POSITIONS ===');
    //   console.log('Total steps:', result.routes[0].steps.length);

    //   const positions: [number, number][] = [];

    //   result.routes[0].steps.forEach((step, index) => {
    //     console.log(`Step ${index}:`, {
    //       type: step.type,
    //       hasGeometry: !!step.geometry,
    //       geometryLength: step.geometry?.length || 0,
    //       location: step.location
    //     });

    //     if (step.geometry) {
    //       try {
    //         const coords = polyline.decode(step.geometry);
    //         console.log(`  Decoded ${coords.length} coordinates`);
    //         console.log(`  First coord:`, coords[0]);
    //         console.log(`  Last coord:`, coords[coords.length - 1]);

    //         coords.forEach(coord => {
    //           positions.push([coord[0], coord[1]]);
    //         });
    //       } catch (error) {
    //         console.error(`  Error decoding geometry:`, error);
    //         positions.push([step.location[1], step.location[0]]);
    //       }
    //     } else {
    //       console.log(`  No geometry, using direct location`);
    //       positions.push([step.location[1], step.location[0]]);
    //     }
    //   });

    //   console.log(`Total positions after processing: ${positions.length}`);
    //   console.log('First 3 positions:', positions.slice(0, 3));
    //   console.log('Last 3 positions:', positions.slice(-3));
    //   console.log('=== END DEBUG ===');

    //   return positions;
  }, [result]);

  const allPoints = useMemo(() => {
    const points: L.LatLngExpression[] = [
      [vehicle.startLocation.lat, vehicle.startLocation.lng]
    ];
    jobs.forEach(j => points.push([j.location.lat, j.location.lng]));
    return points;
  }, [vehicle, jobs]);

  return (
    <MapContainer
      center={[vehicle.startLocation.lat, vehicle.startLocation.lng]}
      zoom={12}
      className="w-full h-full z-0"
      doubleClickZoom={false} // Disable default double click zoom to use for adding jobs
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />

      <MapEvents />
      <BoundsFitter points={allPoints} />

      {/* Depot Marker */}
      <Marker position={[vehicle.startLocation.lat, vehicle.startLocation.lng]} icon={depotIcon}>
        <Popup className="font-sans">
          <div className="font-bold text-blue-800">Vehicle Depot</div>
          <div className="text-xs text-slate-500">{vehicle.startLocation.address}</div>
          <div className="mt-1 text-xs">Capacity: {vehicle.capacity}</div>
        </Popup>
      </Marker>

      {/* Job Markers */}
      {jobs.map((job, idx) => {
        const isHighlighted = result?.routes[0].steps.findIndex(s => s.jobId === job.id) === highlightedStep;
        return (
          <Marker
            key={job.id}
            position={[job.location.lat, job.location.lng]}
            icon={isHighlighted ? activeStepIcon : jobIcon}
          >
            <Tooltip direction="top" offset={[0, -40]} opacity={1} permanent={false}>
              Job #{job.id}
            </Tooltip>
            <Popup className="font-sans">
              <div className="font-bold text-slate-800">Job #{job.id}</div>
              <div className="text-xs text-slate-500 mb-2">{job.location.address}</div>
              <div className="flex justify-between text-xs border-t pt-2">
                <span>Delivery:</span>
                <span className="font-mono font-bold">{job.deliveryAmount}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Service Time:</span>
                <span className="font-mono">{job.serviceTime}s</span>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {/* Route Polyline */}
      {routePositions.length > 0 && (
        <>
          <Polyline
            positions={routePositions}
            pathOptions={{ color: '#3B82F6', weight: 4, opacity: 0.8, lineJoin: 'round' }}
          />
          <Polyline
            positions={routePositions}
            pathOptions={{ color: '#60A5FA', weight: 8, opacity: 0.3 }}
          />
        </>
      )}
    </MapContainer>
  );
};