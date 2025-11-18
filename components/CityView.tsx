import React from 'react';
import { BuildingId, SavedBuildingState } from '../types';

interface CityViewProps {
  buildings: Record<BuildingId, SavedBuildingState>;
  visibleBuildingIds: BuildingId[];
}

// Configuration for grid placement
// Grid is 360x360. Center is 180, 180.
// We use percentages for 'left' and 'top' to be responsive within the grid container.
const BUILDING_CONFIG: Record<BuildingId, { left: string; top: string; color: string; zOffset: number }> = {
  [BuildingId.MAINFRAME]: { left: '50%', top: '50%', color: 'text-green-500', zOffset: 0 },
  [BuildingId.SOLAR_FARM]: { left: '20%', top: '20%', color: 'text-yellow-400', zOffset: 0 },
  [BuildingId.DATA_MINER]: { left: '80%', top: '20%', color: 'text-cyan-400', zOffset: 0 },
  [BuildingId.SYNTH_FACTORY]: { left: '80%', top: '80%', color: 'text-fuchsia-400', zOffset: 0 },
  [BuildingId.QUANTUM_RIG]: { left: '20%', top: '80%', color: 'text-purple-500', zOffset: 0 },
};

const CityView: React.FC<CityViewProps> = ({ buildings, visibleBuildingIds }) => {
  
  // Helper to render a wireframe building "stack"
  const renderBuilding = (id: BuildingId) => {
    // Only render if visible in the progression
    if (!visibleBuildingIds.includes(id)) return null;

    const config = BUILDING_CONFIG[id];
    const level = buildings[id].level;
    const isActive = level > 0 && buildings[id].active !== false; // Must be level > 0 AND active
    const isBuilt = level > 0;
    
    // Determine visual height (number of plates) based on level
    // Cap at 5 plates for visuals
    const plateCount = isBuilt ? Math.min(5, Math.ceil(level / 2) + 1) : 1;
    
    // Outline style for inactive buildings
    const opacityClass = isActive ? 'opacity-100' : 'opacity-30 grayscale';
    
    return (
      <div 
        key={id}
        className={`iso-building-container ${config.color} ${opacityClass}`}
        style={{ 
          left: config.left, 
          top: config.top, 
          marginLeft: '-30px', // Half of width (60px)
          marginTop: '-30px',  // Half of height
        }}
      >
        {/* Base Plate */}
        <div className="iso-plate" style={{ transform: 'translateZ(0px)' }}></div>
        
        {/* Stacked Plates for 3D effect */}
        {isBuilt && Array.from({ length: plateCount }).map((_, idx) => (
          <div 
            key={idx} 
            className="iso-plate" 
            style={{ 
              transform: `translateZ(${(idx + 1) * 15}px)`,
              width: `${100 - (idx * 10)}%`, // Taper effect
              height: `${100 - (idx * 10)}%`,
              left: `${idx * 5}%`,
              top: `${idx * 5}%`
            }}
          />
        ))}
        
        {/* Label (Floating above) */}
        {isBuilt && (
          <div 
            className={`absolute text-[8px] px-1 border border-current whitespace-nowrap ${isActive ? 'bg-black/60' : 'bg-red-900/60 text-red-200 border-red-500'}`}
            style={{ 
              transform: `translateZ(${plateCount * 15 + 20}px) rotateZ(-45deg) rotateX(-60deg)`, 
              left: '50%', 
              top: '50%' 
            }}
          >
            {isActive ? `LVL ${level}` : 'OFFLINE'}
          </div>
        )}
      </div>
    );
  };

  // Helper to render connection lines and resource packets
  const renderConnection = (id: BuildingId) => {
    if (id === BuildingId.MAINFRAME) return null; // Mainframe doesn't connect to itself
    if (!visibleBuildingIds.includes(id)) return null; // Hide connections for hidden buildings

    const config = BUILDING_CONFIG[id];
    const center = BUILDING_CONFIG[BuildingId.MAINFRAME];
    const level = buildings[id].level;
    const isActive = level > 0 && buildings[id].active !== false;
    
    const x1 = parseFloat(config.left);
    const y1 = parseFloat(config.top);
    const x2 = parseFloat(center.left);
    const y2 = parseFloat(center.top);
    
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy); // in percent
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    return (
      <div 
        key={`conn-${id}`}
        className={`connection-line ${config.color}`}
        style={{
          left: config.left,
          top: config.top,
          width: `${dist}%`,
          transform: `rotate(${angle}deg)`,
          zIndex: -1,
          opacity: level > 0 ? (isActive ? 0.5 : 0.1) : 0.1
        }}
      >
        {/* The moving packet only if active */}
        {isActive && (
          <div className="resource-packet" style={{ animationDuration: `${Math.max(0.5, 3 - level * 0.1)}s` }} />
        )}
      </div>
    );
  };

  return (
    <div className="w-full h-[400px] relative city-viewport border-b-2 border-slate-800 bg-slate-950/50 shrink-0">
      
      {/* UI Overlay for aesthetics */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <div className="text-xs text-slate-500 font-mono">SECTOR_VIEW: <span className="text-cyan-400 animate-pulse">LIVE</span></div>
        <div className="text-[10px] text-slate-600">GRID_ROTATION: 45°</div>
      </div>

      {/* The 3D Scene */}
      <div className="iso-grid">
        
        {/* Render Connections First (Background layer) */}
        {Object.values(BuildingId).map(id => renderConnection(id))}

        {/* Render Buildings */}
        {Object.values(BuildingId).map(id => renderBuilding(id))}
        
        {/* Center pulsing aura for Mainframe, only if visible and active */}
        {visibleBuildingIds.includes(BuildingId.MAINFRAME) && (
          <div 
            className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border transition-colors duration-500 ${buildings[BuildingId.MAINFRAME].active !== false ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/10 bg-transparent'}`}
            style={{ transform: 'translateZ(1px)' }}
          ></div>
        )}
      </div>
    </div>
  );
};

export default CityView;