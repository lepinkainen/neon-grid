import React, { useMemo, useState } from 'react';
import { useGameEngine } from './hooks/useGameEngine';
import ResourceDisplay from './components/ResourceDisplay';
import BuildingCard from './components/BuildingCard';
import LogTerminal from './components/LogTerminal';
import OfflineModal from './components/OfflineModal';
import CityView from './components/CityView';
import { BUILDING_DEFINITIONS, MANUAL_CLICK_REWARD } from './constants';
import { BuildingId, ResourceType } from './types';
import { generateSystemLog } from './services/geminiService';

function App() {
  const { 
    resources, 
    buildings, 
    logs, 
    offlineGains, 
    upgradeBuilding,
    toggleBuilding, 
    manualGather, 
    resetGame, 
    addLog,
    setOfflineGains
  } = useGameEngine();

  const [analyzing, setAnalyzing] = useState(false);

  // Calculate current net rates for display
  const currentRates = useMemo(() => {
    const rates: Record<ResourceType, number> = {
      [ResourceType.ENERGY]: 0,
      [ResourceType.DATA]: 0,
      [ResourceType.MATS]: 0,
      [ResourceType.CREDITS]: 0,
    };

    Object.values(BuildingId).forEach(id => {
      const b = buildings[id as BuildingId];
      const def = BUILDING_DEFINITIONS[id as BuildingId];
      // Check active state
      if (b.level > 0 && b.active !== false) {
        Object.entries(def.baseProduction).forEach(([r, amt]) => {
          rates[r as ResourceType] += (amt || 0) * b.level;
        });
        Object.entries(def.baseConsumption).forEach(([r, amt]) => {
          rates[r as ResourceType] -= (amt || 0) * b.level;
        });
      }
    });
    return rates;
  }, [buildings]);

  // Determine which buildings are unlocked/visible
  const visibleBuildingIds = useMemo(() => {
    const allIds = Object.values(BuildingId);
    const visible: BuildingId[] = [];
    for (const id of allIds) {
      visible.push(id);
      // If this building hasn't been built yet, stop here (it's the "next" one)
      // but still include it in the list so user can see/buy it.
      if (buildings[id].level === 0) {
        break;
      }
    }
    return visible;
  }, [buildings]);

  const handleAIAnalysis = async () => {
    if (analyzing) return;
    setAnalyzing(true);
    addLog("SYSTEM: Initializing AI Diagnostic...", "system");
    const message = await generateSystemLog({ resources, buildings, logs: [], lastSaveTime: 0 });
    addLog(message, "ai");
    setAnalyzing(false);
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background Grid Animation Wrapper */}
      <div className="cyber-grid"></div>
      
      {/* Modals */}
      {offlineGains && <OfflineModal gains={offlineGains} onClose={() => setOfflineGains(null)} />}

      {/* Sticky Header */}
      <ResourceDisplay resources={resources} rates={currentRates} />

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col md:flex-row overflow-hidden h-[calc(100vh-80px)]">
        
        {/* Left Col: Visualization & Buildings */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          
          {/* The new City Visualization */}
          <CityView buildings={buildings} visibleBuildingIds={visibleBuildingIds} />

          <div className="p-6 max-w-5xl mx-auto w-full">
            {/* Introduction / Manual Gather Area */}
            <div className="mb-8 p-6 border-2 border-dashed border-slate-800 bg-slate-950/50 rounded flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2 glitch-text" title="NEON_GRID_PROTOCOL">NEON_GRID_PROTOCOL</h1>
                <p className="text-slate-400 text-sm max-w-lg">
                  Establish infrastructure. Convert energy to data. Synthesize reality.
                  <br/>
                  <span className="text-xs text-slate-600">v1.1.0 - PROTOCOL OVERRIDE ENABLED</span>
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <button 
                  onClick={manualGather}
                  className="bg-cyan-900/20 hover:bg-cyan-500 hover:text-black text-cyan-400 border border-cyan-500 px-6 py-4 text-lg font-bold transition-all active:scale-95 shadow-[0_0_20px_rgba(6,182,212,0.2)] uppercase tracking-widest"
                >
                  Initialize Spark
                </button>
                <div className="text-[10px] text-center text-slate-500">
                  +{MANUAL_CLICK_REWARD[ResourceType.ENERGY]} Energy / +{MANUAL_CLICK_REWARD[ResourceType.DATA]} Data
                </div>
              </div>
            </div>

            {/* Building Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
              {visibleBuildingIds.map((id) => {
                 const def = BUILDING_DEFINITIONS[id];
                 // Affordability Check
                 const canAfford = def.baseCost.every(c => {
                    const cost = Math.floor(c.amount * Math.pow(def.costMultiplier, buildings[id].level));
                    return resources[c.resource] >= cost;
                 });

                 return (
                   <BuildingCard 
                     key={id} 
                     id={id} 
                     data={buildings[id]} 
                     onUpgrade={upgradeBuilding}
                     onToggle={toggleBuilding}
                     canAfford={canAfford}
                   />
                 );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Sidebar (Logs & System) */}
        <aside className="w-full md:w-80 flex flex-col border-l-2 border-slate-800 bg-slate-950 z-20 shadow-xl shrink-0 h-64 md:h-auto">
          <div className="flex-grow overflow-hidden">
             <LogTerminal logs={logs} />
          </div>
          
          {/* System Controls */}
          <div className="p-4 border-t-2 border-slate-800 bg-slate-900/50">
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleAIAnalysis}
                disabled={analyzing}
                className="w-full border border-fuchsia-500/50 text-fuchsia-400 text-xs py-2 hover:bg-fuchsia-900/20 uppercase tracking-wider flex items-center justify-center gap-2"
              >
                {analyzing ? (
                  <span className="animate-pulse">Processing...</span>
                ) : (
                  <>
                    <span>◆</span> Run NetRunner AI Analysis
                  </>
                )}
              </button>

              <div className="flex gap-2">
                <button 
                  onClick={resetGame}
                  className="flex-1 border border-red-900 text-red-900 text-[10px] py-2 hover:bg-red-900 hover:text-red-100 transition-colors uppercase"
                >
                  Hard Reset
                </button>
                <div className="flex-1 border border-slate-800 text-slate-600 text-[10px] py-2 flex items-center justify-center uppercase cursor-help" title="Progress auto-saves every 30s">
                  Auto-Save Active
                </div>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default App;