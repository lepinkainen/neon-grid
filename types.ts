export enum ResourceType {
  ENERGY = 'ENERGY',
  DATA = 'DATA',
  MATS = 'MATS', // Materials
  CREDITS = 'CREDITS'
}

export enum BuildingId {
  SOLAR_FARM = 'SOLAR_FARM',
  DATA_MINER = 'DATA_MINER',
  SYNTH_FACTORY = 'SYNTH_FACTORY',
  MAINFRAME = 'MAINFRAME',
  QUANTUM_RIG = 'QUANTUM_RIG'
}

export interface ResourceCost {
  resource: ResourceType;
  amount: number;
}

export interface BuildingDef {
  id: BuildingId;
  name: string;
  description: string;
  baseCost: ResourceCost[];
  baseProduction: Partial<Record<ResourceType, number>>;
  baseConsumption: Partial<Record<ResourceType, number>>;
  costMultiplier: number;
  flavorText: string;
}

export interface SavedBuildingState {
  level: number;
  active?: boolean; // Added to track if building is toggled on/off
}

export interface GameState {
  resources: Record<ResourceType, number>;
  buildings: Record<BuildingId, SavedBuildingState>;
  lastSaveTime: number;
  logs: LogEntry[];
}

export interface LogEntry {
  id: string;
  timestamp: number;
  message: string;
  type: 'info' | 'alert' | 'system' | 'ai';
}