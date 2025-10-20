export type DayPhase = 'morning' | 'day' | 'evening' | 'night';

export interface TimeConfig {
  /** How many game ticks elapse per real-time second. */
  ticksPerSecond: number;
  /** Global cap to prevent runaway simulation update cycles. */
  maxTicksPerFrame: number;
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
}

export interface TaxConfig {
  /** Daily upkeep paid during evening. */
  dailyOperatingCost: number;
  /** Weekly tithe or tax due after day five. */
  weeklyTribute: number;
  /** Optional adjustable levy representing the local lord. */
  localAuthorityTax: number;
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
  danger: DangerThresholds;
  featureFlags: FeatureFlagRegistry;
}
