import type {
  DangerThresholds,
  DayPhaseDurations,
  EconomyConfig,
  FeatureFlagDefinition,
  FeatureFlagRegistry,
  GameConfig,
  TaxConfig,
  TimeConfig
} from './configTypes';

const ticks: TimeConfig = {
  ticksPerSecond: 10,
  maxTicksPerFrame: 120
};

const dayPhaseDurations: DayPhaseDurations = {
  morning: 120,
  day: 420,
  evening: 120,
  night: 90
};

const economy: EconomyConfig = {
  baseSellMarkup: 1.15,
  baseBuyMarkdown: 0.85,
  dailyUpgradeCostScalar: 1.0,
  permanentUpgradeCostScalar: 1.2,
  restockCostScalar: 1.0
};

const taxes: TaxConfig = {
  dailyOperatingCost: 25,
  weeklyTribute: 150,
  localAuthorityTax: 0
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
  danger,
  featureFlags
};

Object.freeze(gameConfig);
Object.freeze(gameConfig.featureFlags);

export type { GameConfig };
