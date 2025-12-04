import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../UI/Button';
import { Card, CardContent } from '../UI/Card';
import { Truck, MapPin, Package, Trash2, Plus, Play, MoreVertical } from 'lucide-react';
import { Location } from '../../types';

export const LeftPanel: React.FC = () => {
  const { 
    vehicles, 
    jobs, 
    updateVehicle, 
    updateJob, 
    removeJob, 
    runOptimization, 
    isLoading,
    clearAllJobs 
  } = useApp();

  const vehicle = vehicles[0];
  const [activeTab, setActiveTab] = useState<'jobs' | 'vehicle'>('jobs');

  return (
    <div className="w-full h-full flex flex-col bg-white/95 backdrop-blur-sm border-r border-slate-200 shadow-xl overflow-hidden">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white">
        <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
          <Truck className="w-5 h-5 text-blue-600" />
          Fleet Config
        </h2>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('jobs')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${activeTab === 'jobs' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Jobs
          </button>
          <button 
             onClick={() => setActiveTab('vehicle')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${activeTab === 'vehicle' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Vehicle
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        
        {activeTab === 'vehicle' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Depot Location</label>
              <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm">
                <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <input 
                  type="text" 
                  value={vehicle.startLocation.address || "Select on map"}
                  readOnly
                  className="bg-transparent w-full focus:outline-none text-slate-700 truncate"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Drag marker on map to move (Coming Soon)</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Vehicle Capacity</label>
              <div className="flex items-center gap-2">
                  <input 
                    type="number"
                    value={vehicle.capacity}
                    onChange={(e) => updateVehicle({ capacity: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                  <span className="text-xs text-slate-500">units</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'jobs' && (
          <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{jobs.length} Jobs Added</span>
                <button onClick={clearAllJobs} className="text-xs text-red-500 hover:text-red-600 hover:underline">Clear All</button>
            </div>
            
            {jobs.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl">
                    <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">No jobs yet.</p>
                    <p className="text-xs text-slate-400">Double-click on map to add.</p>
                </div>
            ) : (
                jobs.map((job) => (
                <Card key={job.id} className="group hover:border-blue-300 transition-colors">
                    <CardContent className="p-3">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                            <div className="bg-blue-100 text-blue-700 text-xs font-bold w-6 h-6 rounded flex items-center justify-center">
                                {jobs.indexOf(job) + 1}
                            </div>
                            <span className="text-sm font-medium text-slate-800">Job #{job.id}</span>
                        </div>
                        <button 
                            onClick={() => removeJob(job.id)}
                            className="text-slate-300 hover:text-red-500 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                    
                    <div className="text-xs text-slate-500 truncate mb-3 pl-8">
                        {job.location.address}
                    </div>

                    <div className="flex gap-2 pl-8">
                        <div className="flex-1">
                            <label className="block text-[10px] text-slate-400">Load</label>
                            <input 
                                type="number"
                                className="w-full bg-slate-50 border border-slate-200 rounded px-1 py-0.5 text-xs"
                                value={job.deliveryAmount}
                                onChange={(e) => updateJob(job.id, { deliveryAmount: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-[10px] text-slate-400">Service (s)</label>
                            <input 
                                type="number"
                                className="w-full bg-slate-50 border border-slate-200 rounded px-1 py-0.5 text-xs"
                                value={job.serviceTime}
                                onChange={(e) => updateJob(job.id, { serviceTime: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                    </div>
                    </CardContent>
                </Card>
                ))
            )}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <Button 
            variant="primary" 
            className="w-full shadow-blue-200 shadow-lg" 
            size="lg"
            onClick={runOptimization}
            isLoading={isLoading}
            disabled={jobs.length === 0}
        >
          {isLoading ? 'Optimizing...' : 'Optimize Route'}
        </Button>
        <p className="text-[10px] text-center text-slate-400 mt-2">
            Uses simulated solver if backend unavailable
        </p>
      </div>
    </div>
  );
};