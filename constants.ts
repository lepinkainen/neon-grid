import { BuildingDef, BuildingId, ResourceType } from "./types";

export const TICK_RATE_MS = 1000; // 1 second ticks
export const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

export const INITIAL_RESOURCES: Record<ResourceType, number> = {
  [ResourceType.ENERGY]: 0,
  [ResourceType.DATA]: 0,
  [ResourceType.MATS]: 0,
  [ResourceType.CREDITS]: 0,
};

// Initial helper to get resources started
export const MANUAL_CLICK_REWARD: Record<ResourceType, number> = {
  [ResourceType.ENERGY]: 10,
  [ResourceType.DATA]: 1,
  [ResourceType.MATS]: 0,
  [ResourceType.CREDITS]: 0,
};

export const BUILDING_DEFINITIONS: Record<BuildingId, BuildingDef> = {
  [BuildingId.SOLAR_FARM]: {
    id: BuildingId.SOLAR_FARM,
    name: "Neon Solar Array",
    description: "Harvests ambient neon radiation to produce Energy.",
    baseCost: [{ resource: ResourceType.DATA, amount: 10 }],
    baseProduction: { [ResourceType.ENERGY]: 5 },
    baseConsumption: {},
    costMultiplier: 1.5,
    flavorText: "Grid power stabilized."
  },
  [BuildingId.DATA_MINER]: {
    id: BuildingId.DATA_MINER,
    name: "Bit Scraper",
    description: "Scrapes the net for raw Data. Consumes Energy.",
    baseCost: [{ resource: ResourceType.ENERGY, amount: 50 }, { resource: ResourceType.DATA, amount: 25 }],
    baseProduction: { [ResourceType.DATA]: 3 },
    baseConsumption: { [ResourceType.ENERGY]: 2 },
    costMultiplier: 1.4,
    flavorText: "Packet interception active."
  },
  [BuildingId.SYNTH_FACTORY]: {
    id: BuildingId.SYNTH_FACTORY,
    name: "Matter Synth",
    description: "Synthesizes physical Materials from Energy and Data.",
    baseCost: [{ resource: ResourceType.ENERGY, amount: 200 }, { resource: ResourceType.DATA, amount: 100 }],
    baseProduction: { [ResourceType.MATS]: 1 },
    baseConsumption: { [ResourceType.ENERGY]: 10, [ResourceType.DATA]: 5 },
    costMultiplier: 1.6,
    flavorText: "Matter printing sequence initiated."
  },
  [BuildingId.MAINFRAME]: {
    id: BuildingId.MAINFRAME,
    name: "Core Mainframe",
    description: "Processes Data and Materials into tradeable Credits.",
    baseCost: [{ resource: ResourceType.MATS, amount: 50 }, { resource: ResourceType.DATA, amount: 500 }],
    baseProduction: { [ResourceType.CREDITS]: 1 },
    baseConsumption: { [ResourceType.DATA]: 20, [ResourceType.MATS]: 0.5 },
    costMultiplier: 1.8,
    flavorText: "Ledger updated."
  },
  [BuildingId.QUANTUM_RIG]: {
    id: BuildingId.QUANTUM_RIG,
    name: "Quantum Rig",
    description: "High-tier processor. Massive Energy drain for massive Credits.",
    baseCost: [{ resource: ResourceType.CREDITS, amount: 1000 }, { resource: ResourceType.MATS, amount: 200 }],
    baseProduction: { [ResourceType.CREDITS]: 50 },
    baseConsumption: { [ResourceType.ENERGY]: 500 },
    costMultiplier: 2.0,
    flavorText: "Reality decrypted."
  }
};
