import React from 'react';
import { useApp } from '../../context/AppContext';
import { Clock, Map, Navigation, CheckCircle, Package } from 'lucide-react';
import { RouteStep } from '../../types';

export const RightPanel: React.FC = () => {
  const { result, setHighlightedStep } = useApp();

  if (!result) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm border-l border-slate-200 text-slate-400 p-8 text-center">
        <Navigation className="w-16 h-16 mb-4 opacity-20" />
        <h3 className="font-bold text-slate-600">No Route Generated</h3>
        <p className="text-sm mt-2">Add jobs and click optimize to see directions.</p>
      </div>
    );
  }

  const route = result.routes[0];
  const summary = result.summary;

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  const formatDistance = (meters: number) => {
    return `${(meters / 1000).toFixed(1)} km`;
  };

  const formatTime = (offset: number) => {
    const baseDate = new Date();
    baseDate.setHours(8, 0, 0, 0); // Assume 8 AM start
    const time = new Date(baseDate.getTime() + offset * 1000);
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="w-full h-full flex flex-col bg-white/95 backdrop-blur-sm border-l border-slate-200 shadow-xl overflow-hidden">
      
      {/* Summary Header */}
      <div className="p-6 bg-gradient-to-br from-blue-50 to-white border-b border-blue-100">
        <h2 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Route Optimized
        </h2>
        
        <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded-lg border border-blue-50 shadow-sm">
                <div className="flex items-center gap-2 text-blue-600 mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase">Duration</span>
                </div>
                <span className="text-lg font-bold text-slate-800">{formatDuration(summary.totalDuration)}</span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-blue-50 shadow-sm">
                <div className="flex items-center gap-2 text-blue-600 mb-1">
                    <Map className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase">Distance</span>
                </div>
                <span className="text-lg font-bold text-slate-800">{formatDistance(summary.totalDistance)}</span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-blue-50 shadow-sm col-span-2">
                <div className="flex items-center gap-2 text-blue-600 mb-1">
                    <Package className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase">Total Delivery</span>
                </div>
                <div className="flex justify-between items-end">
                    <span className="text-lg font-bold text-slate-800">{summary.totalDelivery} units</span>
                    <span className="text-xs text-slate-400">{route.steps.length - 2} stops</span>
                </div>
            </div>
        </div>
      </div>

      {/* Steps List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
          <div className="p-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Turn-by-Turn</h3>
              <div className="relative border-l-2 border-slate-200 ml-3 space-y-6 pb-6">
                {route.steps.map((step: RouteStep, index: number) => {
                    const isStart = step.type === 'start';
                    const isEnd = step.type === 'end';
                    
                    return (
                        <div 
                            key={index} 
                            className="relative pl-6 group cursor-pointer"
                            onMouseEnter={() => setHighlightedStep(index)}
                            onMouseLeave={() => setHighlightedStep(null)}
                        >
                            {/* Dot on timeline */}
                            <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm z-10 
                                ${isStart || isEnd ? 'bg-blue-600' : 'bg-slate-400 group-hover:bg-blue-500'} transition-colors`} 
                            />
                            
                            <div className="flex justify-between items-start">
                                <span className="text-xs font-mono text-slate-400 bg-slate-50 px-1 rounded">
                                    {formatTime(step.arrival)}
                                </span>
                            </div>

                            <div className="mt-1">
                                <h4 className={`text-sm font-medium ${isStart || isEnd ? 'text-blue-800' : 'text-slate-700'}`}>
                                    {isStart ? 'Depart from Depot' : isEnd ? 'Return to Depot' : `Delivery #${step.jobId}`}
                                </h4>
                                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                                    {step.address || `Lat: ${step.location[1].toFixed(4)}, Lng: ${step.location[0].toFixed(4)}`}
                                </p>
                            </div>

                            {step.type === 'job' && (
                                <div className="mt-2 flex gap-2">
                                    <span className="text-[10px] px-2 py-0.5 bg-green-50 text-green-700 rounded-full border border-green-100">
                                        Drop: {step.load[0] - (route.steps[index+1]?.load[0] || 0)}
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}
              </div>
          </div>
      </div>
    </div>
  );
};