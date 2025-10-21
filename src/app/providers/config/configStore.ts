import { create } from 'zustand';
import { gameConfig } from '#config/gameConfig';
import type { DayPhase, GameConfig } from '#config/configTypes';

interface ConfigState {
  config: GameConfig;
  refreshConfig: (nextConfig?: GameConfig) => void;
  secondsToTicks: (seconds: number) => number;
  ticksToSeconds: (ticks: number) => number;
  getPhaseDurationSeconds: (phase: DayPhase) => number;
  getPhaseDurationTicks: (phase: DayPhase) => number;
  getDaysPerWeek: () => number;
  getSpeedMultipliers: () => ReadonlyArray<number>;
  getDefaultSpeedMultiplier: () => number;
  getInventoryBaseWeightLimit: () => number;
  getInventoryRestockBatchSize: () => number;
}

const createDerivedHelpers = (config: GameConfig) => ({
  secondsToTicks: (seconds: number) => Math.round(seconds * config.ticks.ticksPerSecond),
  ticksToSeconds: (ticks: number) => ticks / config.ticks.ticksPerSecond,
  getPhaseDurationSeconds: (phase: DayPhase) => config.dayPhaseDurations[phase],
  getPhaseDurationTicks: (phase: DayPhase) =>
    Math.round(config.dayPhaseDurations[phase] * config.ticks.ticksPerSecond),
  getDaysPerWeek: () => config.ticks.daysPerWeek,
  getSpeedMultipliers: () => config.ticks.speedMultipliers,
  getDefaultSpeedMultiplier: () => config.ticks.defaultSpeedMultiplier,
  getInventoryBaseWeightLimit: () => config.inventory.baseWeightLimit,
  getInventoryRestockBatchSize: () => config.inventory.restockBatchSize
});

const baseConfig = Object.freeze(gameConfig);

export const useConfigStore = create<ConfigState>((set, get) => ({
  config: baseConfig,
  refreshConfig: (nextConfig) => {
    const config = nextConfig ?? baseConfig;
    set({
      config,
      ...createDerivedHelpers(config)
    });
  },
  ...createDerivedHelpers(baseConfig)
}));

if (import.meta.hot) {
  import.meta.hot.accept('#config/gameConfig.ts', (module) => {
    if (!module?.gameConfig) {
      return;
    }
    useConfigStore.getState().refreshConfig(module.gameConfig);
  });
}
