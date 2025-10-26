import type {
  DangerThresholds,
  DayPhaseDurations,
  EconomyConfig,
  FeatureFlagDefinition,
  FeatureFlagRegistry,
  GameConfig,
  InventoryConfig,
  TaxConfig,
  TimeConfig,
  VisitorConfig
} from './configTypes';

const ticks: TimeConfig = {
  ticksPerSecond: 10,
  maxTicksPerFrame: 120,
  daysPerWeek: 5,
  speedMultipliers: [0, 0.5, 1, 2, 4],
  defaultSpeedMultiplier: 1
};

const dayPhaseDurations: DayPhaseDurations = {
  morning: 5,
  day: 60,
  evening: 5,
  night: 5,
  weekend: 45
};

const economy: EconomyConfig = {
  baseSellMarkup: 1.15,
  baseBuyMarkdown: 0.85,
  dailyUpgradeCostScalar: 1.0,
  permanentUpgradeCostScalar: 1.2,
  restockCostScalar: 1,
  startingGold: 500
};

const taxes: TaxConfig = {
  dailyOperatingCost: 25,
  weeklyTribute: 150,
  localAuthorityTax: 0
};

const inventory: InventoryConfig = {
  baseWeightLimit: 120,
  restockBatchSize: 8
};

const visitors: VisitorConfig = {
  dayPhaseArrivalIntervalSeconds: 2,
  maxQueueDepth: 1,
  basePatienceTicks: 150,
  patienceDrainPerInteraction: 12,
  idlePatienceDrainPerTick: 0.5,
  baseSatisfaction: 60,
  talkSatisfactionDelta: 5,
  needFulfilledSatisfactionDelta: 15,
  refusePenalty: -60,
  talkTimeCostSeconds: 2
};

const danger: DangerThresholds = {
  warning: 40,
  critical: 75,
  gameOver: 100
};

const featureFlags: FeatureFlagRegistry = {
  haggle: {
    key: 'haggle',
    label: 'Haggling Interactions',
    description: 'Enable the haggling flow during visitor commerce interactions.',
    defaultValue: false,
    allowedValues: [false, true] as const,
    stage: 'prototype',
    tags: ['commerce', 'interaction'],
    requiresReload: false
  } satisfies FeatureFlagDefinition<boolean>,
  travel: {
    key: 'travel',
    label: 'Regional Travel',
    description: 'Allow the player to travel to alternate regions during the weekend phase.',
    defaultValue: false,
    allowedValues: [false, true] as const,
    stage: 'prototype',
    tags: ['world', 'restock'],
    requiresReload: true
  } satisfies FeatureFlagDefinition<boolean>,
  worldEvents: {
    key: 'worldEvents',
    label: 'Dynamic World Events',
    description: 'Toggle the pool of world and nightly events driven by reputation and danger.',
    defaultValue: false,
    allowedValues: [false, true] as const,
    stage: 'prototype',
    tags: ['events', 'world'],
    requiresReload: false
  } satisfies FeatureFlagDefinition<boolean>,
  telemetrySink: {
    key: 'telemetrySink',
    label: 'Telemetry Sink Mode',
    description: 'Route telemetry events to the chosen sink: console, in-memory buffer, or disable entirely.',
    defaultValue: 'console',
    allowedValues: ['console', 'memory', 'off'] as const,
    stage: 'qa',
    tags: ['telemetry', 'qa'],
    requiresReload: false
  } satisfies FeatureFlagDefinition<'console' | 'memory' | 'off'>,
  persistenceMode: {
    key: 'persistenceMode',
    label: 'Persistence Strategy',
    description: 'Switch between full IndexedDB snapshots, lightweight session storage, or disabling persistence.',
    defaultValue: 'indexedDb',
    allowedValues: ['indexedDb', 'sessionStorage', 'off'] as const,
    stage: 'prototype',
    tags: ['persistence'],
    requiresReload: true
  } satisfies FeatureFlagDefinition<'indexedDb' | 'sessionStorage' | 'off'>,
  debugLogging: {
    key: 'debugLogging',
    label: 'Verbose Debug Logging',
    description: 'Emit additional development-time diagnostics for visitor flows and pricing.',
    defaultValue: false,
    allowedValues: [false, true] as const,
    stage: 'prototype',
    tags: ['logging', 'qa'],
    requiresReload: false
  } satisfies FeatureFlagDefinition<boolean>,
  advancedVisitors: {
    key: 'advancedVisitors',
    label: 'Advanced Visitor Archetypes',
    description: 'Enable additional visitor archetypes beyond the default adventurer party.',
    defaultValue: false,
    allowedValues: [false, true] as const,
    stage: 'qa',
    tags: ['visitors'],
    requiresReload: false
  } satisfies FeatureFlagDefinition<boolean>
};

export const gameConfig: GameConfig = {
  version: '0.0.1',
  ticks,
  dayPhaseDurations,
  economy,
  taxes,
  inventory,
  visitors,
  danger,
  featureFlags
};

Object.freeze(gameConfig);
Object.freeze(gameConfig.featureFlags);

export type { GameConfig };
