import React from 'react';
import { BuildingId, SavedBuildingState } from '../types';
import { BUILDING_DEFINITIONS } from '../constants';

interface BuildingCardProps {
  id: BuildingId;
  data: SavedBuildingState;
  onUpgrade: (id: BuildingId) => void;
  onToggle: (id: BuildingId) => void;
  canAfford: boolean;
}

const BuildingCard: React.FC<BuildingCardProps> = ({ id, data, onUpgrade, onToggle, canAfford }) => {
  const def = BUILDING_DEFINITIONS[id];
  const isUnlocked = data.level > 0;
  const isActive = data.active !== false; // Default true if undefined
  
  const getCost = (base: number) => Math.floor(base * Math.pow(def.costMultiplier, data.level));

  return (
    <div className="relative group perspective-1000 h-full">
      {/* Wireframe Card Container */}
      <div className={`
        h-full flex flex-col justify-between
        p-4 transition-all duration-300
        ${isUnlocked 
          ? (isActive 
              ? 'bg-slate-950/90 border-2 border-slate-700 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:-translate-y-1' 
              : 'bg-slate-950/90 border-2 border-red-900/50 grayscale hover:grayscale-0 hover:border-red-500')
          : 'bg-slate-950/50 border border-dashed border-slate-800 opacity-80 hover:opacity-100 hover:border-slate-600'}
      `}>
        
        {/* Header */}
        <div className="flex justify-between items-start mb-2 border-b border-slate-800 pb-2">
          <div>
            <h3 className={`${isUnlocked ? (isActive ? 'text-cyan-400' : 'text-red-900') : 'text-slate-500'} font-bold text-lg tracking-wider uppercase`}>
              {def.name}
            </h3>
            <div className="text-slate-500 text-xs flex items-center gap-2">
              STATUS: <span className={isUnlocked ? (isActive ? "text-green-400" : "text-red-500 animate-pulse") : "text-yellow-600"}>
                {isUnlocked ? (isActive ? `ACTIVE [LVL ${data.level}]` : "OFFLINE") : "BLUEPRINT READY"}
              </span>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-1">
             <div className="text-[10px] text-slate-600 border border-slate-800 px-1">ID: {id.split('_')[0]}</div>
             {isUnlocked && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onToggle(id); }}
                  className={`text-[10px] px-2 py-0.5 border font-bold uppercase tracking-wider transition-colors ${isActive ? 'border-green-500 text-green-400 hover:bg-green-500 hover:text-black' : 'border-red-500 text-red-400 hover:bg-red-500 hover:text-black'}`}
                >
                  {isActive ? 'PWR: ON' : 'PWR: OFF'}
                </button>
             )}
          </div>
        </div>

        {/* Description & Production */}
        <div className="mb-4 flex-grow">
          <p className="text-slate-400 text-xs mb-3 font-mono leading-relaxed">
            {def.description}
          </p>
          
          <div className={`space-y-1 ${(!isUnlocked || !isActive) ? 'opacity-50' : ''}`}>
             {Object.entries(def.baseProduction).map(([res, amt]) => (
               <div key={res} className="flex justify-between text-xs">
                 <span className="text-green-500/80">OUTPUT ({res})</span>
                 <span className="text-green-400">+{((amt as number || 0) * Math.max(1, data.level)).toFixed(1)}/s</span>
               </div>
             ))}
             {Object.entries(def.baseConsumption).map(([res, amt]) => (
               <div key={res} className="flex justify-between text-xs">
                 <span className="text-red-500/80">INPUT ({res})</span>
                 <span className="text-red-400">-{((amt as number || 0) * Math.max(1, data.level)).toFixed(1)}/s</span>
               </div>
             ))}
          </div>
        </div>

        {/* Upgrade Button */}
        <button
          onClick={() => onUpgrade(id)}
          disabled={!canAfford}
          className={`
            w-full py-3 px-4 text-xs font-bold uppercase tracking-widest
            border border-dashed transition-all duration-200
            flex flex-col items-center justify-center gap-1
            ${canAfford 
              ? (isUnlocked 
                  ? 'border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 active:bg-cyan-500/20' 
                  : 'border-yellow-500 text-yellow-400 hover:bg-yellow-500/10 active:bg-yellow-500/20 animate-pulse')
              : 'border-slate-700 text-slate-600 cursor-not-allowed bg-slate-900'}
          `}
        >
          <span>{isUnlocked ? 'Upgrade System' : 'Construct System'}</span>
          <div className="flex flex-wrap justify-center gap-2 mt-1">
            {def.baseCost.map(c => (
              <span key={c.resource} className={canAfford ? (isUnlocked ? 'text-cyan-300' : 'text-yellow-300') : 'text-slate-700'}>
                {getCost(c.amount)} {c.resource}
              </span>
            ))}
          </div>
        </button>
        
        {/* Decorative Corner Flairs */}
        {isUnlocked && isActive && (
          <>
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-500/50 -mt-0.5 -ml-0.5"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-cyan-500/50 -mt-0.5 -mr-0.5"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-cyan-500/50 -mb-0.5 -ml-0.5"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-500/50 -mb-0.5 -mr-0.5"></div>
          </>
        )}
      </div>
    </div>
  );
};

export default BuildingCard;