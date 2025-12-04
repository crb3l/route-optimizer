import React, { useState } from 'react';
import { LeftPanel } from './Sidebar/LeftPanel';
import { RightPanel } from './Sidebar/RightPanel';
import { MapController } from './Map/MapController';
import { Menu, X, Settings } from 'lucide-react';

export const Layout: React.FC = () => {
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  
  // Mobile handlers
  const toggleLeft = () => setLeftOpen(!leftOpen);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100">
        {/* Top Navbar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-50 shadow-sm flex-shrink-0">
            <div className="flex items-center gap-3">
                <button onClick={toggleLeft} className="lg:hidden p-2 hover:bg-slate-100 rounded-md">
                    <Menu className="w-5 h-5 text-slate-600" />
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-blue-200 shadow-md">
                        R
                    </div>
                    <span className="font-bold text-slate-800 text-lg tracking-tight">Route<span className="text-blue-600">Optimizer</span></span>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-200">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    System Ready
                </div>
                <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                    <Settings className="w-5 h-5" />
                </button>
            </div>
        </header>

        {/* Main Workspace */}
        <div className="flex-1 flex overflow-hidden relative">
            
            {/* Left Sidebar - Configuration */}
            <aside 
                className={`${leftOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 absolute lg:relative z-20 w-80 h-full transition-transform duration-300 ease-in-out`}
            >
                <LeftPanel />
                {/* Mobile close button */}
                <button 
                    onClick={() => setLeftOpen(false)} 
                    className={`lg:hidden absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg border border-slate-200 ${!leftOpen && 'hidden'}`}
                >
                    <X className="w-4 h-4" />
                </button>
            </aside>

            {/* Center Map */}
            <main className="flex-1 relative z-10 bg-slate-200">
                 {/* Map Toggle Controls for Desktop */}
                 <div className="absolute top-4 left-4 z-[400] hidden lg:block">
                    {!leftOpen && (
                        <button 
                            onClick={() => setLeftOpen(true)}
                            className="bg-white p-2 rounded-lg shadow-md hover:bg-slate-50 border border-slate-200"
                        >
                            <Menu className="w-5 h-5 text-slate-600" />
                        </button>
                    )}
                 </div>
                <MapController />
            </main>

            {/* Right Sidebar - Results */}
            <aside 
                className={`${rightOpen ? 'translate-x-0' : 'translate-x-full'} absolute right-0 lg:relative z-20 w-80 h-full transition-transform duration-300 ease-in-out`}
            >
                 {/* Toggle Handle (Visible when closed) */}
                 {!rightOpen && (
                     <button 
                        onClick={() => setRightOpen(true)}
                        className="absolute top-4 -left-12 bg-white p-2 rounded-l-lg shadow-md border-y border-l border-slate-200 z-50"
                     >
                        <Menu className="w-5 h-5 text-slate-600" />
                     </button>
                 )}
                <RightPanel />
            </aside>
            
            {/* Right Toggle (Visible when open) */}
             {rightOpen && (
                 <button 
                    onClick={() => setRightOpen(false)}
                    className="absolute top-4 right-[20rem] lg:right-[20rem] bg-white p-1.5 rounded-l-lg shadow-md border-y border-l border-slate-200 z-[30] text-slate-400 hover:text-slate-600"
                 >
                    <X className="w-4 h-4" />
                 </button>
             )}
        </div>
    </div>
  );
};