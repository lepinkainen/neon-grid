import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, BuildingId, ResourceType, SavedBuildingState, LogEntry } from '../types';
import { INITIAL_RESOURCES, BUILDING_DEFINITIONS, TICK_RATE_MS, AUTO_SAVE_INTERVAL, MANUAL_CLICK_REWARD } from '../constants';

const LOCAL_STORAGE_KEY = 'neon_grid_save_v1';

export const useGameEngine = () => {
  const [resources, setResources] = useState<Record<ResourceType, number>>(INITIAL_RESOURCES);
  const [buildings, setBuildings] = useState<Record<BuildingId, SavedBuildingState>>({
    [BuildingId.SOLAR_FARM]: { level: 0 },
    [BuildingId.DATA_MINER]: { level: 0 },
    [BuildingId.SYNTH_FACTORY]: { level: 0 },
    [BuildingId.MAINFRAME]: { level: 0 },
    [BuildingId.QUANTUM_RIG]: { level: 0 },
  });
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [offlineGains, setOfflineGains] = useState<Record<ResourceType, number> | null>(null);
  
  // Refs for values needed inside intervals to avoid stale closures without excessive re-renders
  const resourcesRef = useRef(resources);
  const buildingsRef = useRef(buildings);

  useEffect(() => {
    resourcesRef.current = resources;
  }, [resources]);

  useEffect(() => {
    buildingsRef.current = buildings;
  }, [buildings]);

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now(),
      message,
      type
    };
    setLogs(prev => [newLog, ...prev].slice(0, 50)); // Keep last 50 logs
  }, []);

  const calculateProduction = (currentBuildings: Record<BuildingId, SavedBuildingState>) => {
    const production: Record<ResourceType, number> = {
      [ResourceType.ENERGY]: 0,
      [ResourceType.DATA]: 0,
      [ResourceType.MATS]: 0,
      [ResourceType.CREDITS]: 0,
    };
    
    const consumption: Record<ResourceType, number> = { ...production };

    Object.values(BuildingId).forEach((id) => {
      const bId = id as BuildingId;
      const level = currentBuildings[bId].level;
      if (level > 0) {
        const def = BUILDING_DEFINITIONS[bId];
        
        // Add production
        Object.entries(def.baseProduction).forEach(([res, amount]) => {
            // Exponential growth curve for higher levels to make it interesting
            // Or simple linear: level * amount. Let's go linear for simplicity.
            production[res as ResourceType] += (amount || 0) * level;
        });

        // Add consumption
        Object.entries(def.baseConsumption).forEach(([res, amount]) => {
            consumption[res as ResourceType] += (amount || 0) * level;
        });
      }
    });

    return { production, consumption };
  };

  // Save Function
  const saveGame = useCallback(() => {
    const state: GameState = {
      resources: resourcesRef.current,
      buildings: buildingsRef.current,
      logs: [], // Don't save logs to save space
      lastSaveTime: Date.now()
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  }, []);

  // Load & Offline Progress
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed: GameState = JSON.parse(saved);
        setBuildings(parsed.buildings);
        
        // Calculate Offline Progress
        const now = Date.now();
        const secondsOffline = (now - parsed.lastSaveTime) / 1000;
        
        if (secondsOffline > 5) {
          const { production, consumption } = calculateProduction(parsed.buildings);
          const gained: Record<string, number> = {};

          // Simple logic: If we have net negative, we don't produce. 
          // A more complex system would drain buffers. Here we check pure rates.
          
          // First check if we can afford consumption
          // For this MVP, we assume if you are offline, you have average throughput.
          // We will calculate Net Rate per second.
          
          Object.values(ResourceType).forEach(type => {
             const net = (production[type] || 0) - (consumption[type] || 0);
             // We only grant offline progress if the net is positive. 
             // If negative, we assume the building stopped working.
             if (net > 0) {
                const amount = net * secondsOffline;
                gained[type] = amount;
                parsed.resources[type] = (parsed.resources[type] || 0) + amount;
             }
          });
          
          setResources(parsed.resources);
          setOfflineGains(gained as Record<ResourceType, number>);
          addLog(`SYSTEM: Resumed session. Offline duration: ${secondsOffline.toFixed(0)}s`, 'system');
        } else {
           setResources(parsed.resources);
           addLog("SYSTEM: Session restored.", 'system');
        }
      } catch (e) {
        console.error("Save file corrupted", e);
        addLog("ERROR: Save file corrupted. Resetting.", 'alert');
      }
    } else {
      addLog("SYSTEM: New session initialized.", 'system');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Game Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setResources(prev => {
        const { production, consumption } = calculateProduction(buildingsRef.current);
        const next = { ...prev };
        
        // We need to check if we have enough resources for consumption
        // If not, production for that dependent building should fail.
        // To keep it simple for this demo: We calculate global net. 
        // If net is negative, we subtract until 0.
        
        Object.values(ResourceType).forEach(type => {
            const prod = production[type] || 0;
            const cons = consumption[type] || 0;
            let newVal = prev[type] + prod - cons;
            if (newVal < 0) newVal = 0;
            next[type] = newVal;
        });

        return next;
      });
    }, TICK_RATE_MS);

    const saveInterval = setInterval(saveGame, AUTO_SAVE_INTERVAL);

    return () => {
      clearInterval(interval);
      clearInterval(saveInterval);
    };
  }, [saveGame]);

  const upgradeBuilding = (id: BuildingId) => {
    const b = buildings[id];
    const def = BUILDING_DEFINITIONS[id];
    
    // Calculate Cost: Base * (Multiplier ^ Level)
    const getCost = (base: number) => Math.floor(base * Math.pow(def.costMultiplier, b.level));
    
    // Check affordability
    const canAfford = def.baseCost.every(c => resources[c.resource] >= getCost(c.amount));

    if (!canAfford) {
      addLog(`INSUFFICIENT RESOURCES FOR ${def.name}`, 'alert');
      return;
    }

    // Deduct Resources
    setResources(prev => {
      const next = { ...prev };
      def.baseCost.forEach(c => {
        next[c.resource] -= getCost(c.amount);
      });
      return next;
    });

    // Level Up
    setBuildings(prev => ({
      ...prev,
      [id]: { level: prev[id].level + 1 }
    }));
    
    addLog(`UPGRADE: ${def.name} upgraded to Level ${b.level + 1}`, 'info');
  };

  const manualGather = () => {
    setResources(prev => {
      const next = { ...prev };
      Object.entries(MANUAL_CLICK_REWARD).forEach(([r, amt]) => {
        next[r as ResourceType] += amt;
      });
      return next;
    });
  };

  const resetGame = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    window.location.reload();
  };

  return {
    resources,
    buildings,
    logs,
    offlineGains,
    upgradeBuilding,
    manualGather,
    resetGame,
    addLog,
    setOfflineGains // To clear modal
  };
};
