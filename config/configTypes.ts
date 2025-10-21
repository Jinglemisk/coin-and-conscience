export type DayPhase = 'morning' | 'day' | 'evening' | 'night' | 'weekend';

export interface TimeConfig {
  /** How many game ticks elapse per real-time second. */
  ticksPerSecond: number;
  /** Global cap to prevent runaway simulation update cycles. */
  maxTicksPerFrame: number;
  /** Number of in-game days that comprise a week. */
  daysPerWeek: number;
  /** Allow-list of multipliers for accelerating or pausing time during QA sessions. */
  speedMultipliers: readonly number[];
  /** Default multiplier applied when the loop boots. */
  defaultSpeedMultiplier: number;
}

export type DayPhaseDurations = Record<DayPhase, number>;

export interface EconomyConfig {
  /** Baseline markup applied when the player sells to visitors. */
  baseSellMarkup: number;
  /** Baseline markdown applied when the player buys from visitors. */
  baseBuyMarkdown: number;
  /** Multiplier for daily upgrade pricing. */
  dailyUpgradeCostScalar: number;
  /** Multiplier for permanent upgrade pricing. */
  permanentUpgradeCostScalar: number;
  /** Restock cost adjustment factor controlled by modifiers/upgrades. */
  restockCostScalar: number;
  /** Player's starting bankroll at the beginning of a run. */
  startingGold: number;
}

export interface TaxConfig {
  /** Daily upkeep paid during evening. */
  dailyOperatingCost: number;
  /** Weekly tithe or tax due after day five. */
  weeklyTribute: number;
  /** Optional adjustable levy representing the local lord. */
  localAuthorityTax: number;
}

export interface InventoryConfig {
  /** Maximum total carry weight before upgrades or modifiers apply. */
  baseWeightLimit: number;
  /** Default number of items surfaced during a restock cycle. */
  restockBatchSize: number;
}

export interface DangerThresholds {
  /** Soft warning level to surface UI cues. */
  warning: number;
  /** Critical level where severe events begin firing. */
  critical: number;
  /** Hard fail-state trigger. */
  gameOver: number;
}

export type FeatureFlagValue = boolean | number | string;

export type FeatureFlagStage = 'prototype' | 'qa' | 'release';

export interface FeatureFlagDefinition<V extends FeatureFlagValue = FeatureFlagValue> {
  key: string;
  label: string;
  description: string;
  /** Default runtime value when no overrides are supplied. */
  defaultValue: V;
  /** Allow-list of values to keep toggles predictable. */
  allowedValues: readonly V[];
  stage: FeatureFlagStage;
  /** Feature groups used for filtering in future dashboards. */
  tags: readonly string[];
  /** Whether changing the flag requires a reload to fully apply. */
  requiresReload: boolean;
}

export type FeatureFlagRegistry = Record<string, FeatureFlagDefinition>;

export interface GameConfig {
  version: string;
  ticks: TimeConfig;
  dayPhaseDurations: DayPhaseDurations;
  economy: EconomyConfig;
  taxes: TaxConfig;
  inventory: InventoryConfig;
  danger: DangerThresholds;
  featureFlags: FeatureFlagRegistry;
}
