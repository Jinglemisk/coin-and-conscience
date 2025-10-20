import { create } from 'zustand';
import type { FeatureFlagDefinition, FeatureFlagRegistry, FeatureFlagValue } from '#config/configTypes';

type FeatureFlagValues = Record<string, FeatureFlagValue>;

type FeatureFlagsState = {
  registry: FeatureFlagRegistry;
  values: FeatureFlagValues;
  setFlag: (key: string, value: FeatureFlagValue) => void;
  resetFlag: (key: string) => void;
  resetAll: () => void;
  syncRegistry: (registry: FeatureFlagRegistry) => void;
};

const toRegistryEntries = (registry: FeatureFlagRegistry) =>
  Object.entries(registry) as Array<[string, FeatureFlagDefinition]>;

const extractDefaults = (registry: FeatureFlagRegistry): FeatureFlagValues =>
  Object.fromEntries(
    toRegistryEntries(registry).map(([key, definition]) => [key, definition.defaultValue])
  );

const validateValue = (definition: FeatureFlagDefinition, value: FeatureFlagValue) => {
  if (!definition.allowedValues.includes(value)) {
    throw new Error(
      `Value "${String(value)}" is not allowed for feature flag "${definition.key}".`
    );
  }
};

export const useFeatureFlagsStore = create<FeatureFlagsState>((set, get) => ({
  registry: {},
  values: {},
  setFlag: (key, value) => {
    const { registry } = get();
    const definition = registry[key];
    if (!definition) {
      throw new Error(`Unknown feature flag: ${key}`);
    }
    validateValue(definition, value);
    set((state) => ({
      values: {
        ...state.values,
        [key]: value
      }
    }));
  },
  resetFlag: (key) => {
    const { registry } = get();
    const definition = registry[key];
    if (!definition) {
      return;
    }
    set((state) => ({
      values: {
        ...state.values,
        [key]: definition.defaultValue
      }
    }));
  },
  resetAll: () => {
    const defaults = extractDefaults(get().registry);
    set({ values: defaults });
  },
  syncRegistry: (registry) => {
    set((state) => {
      const defaults = extractDefaults(registry);
      const nextValues: FeatureFlagValues = { ...defaults };

      for (const [key, value] of Object.entries(state.values)) {
        const definition = registry[key];
        if (!definition) {
          continue;
        }
        if (definition.allowedValues.includes(value)) {
          nextValues[key] = value;
        }
      }

      return {
        registry,
        values: nextValues
      };
    });
  }
}));

export const useFeatureFlagValue = (key: string) =>
  useFeatureFlagsStore((state) => state.values[key] ?? state.registry[key]?.defaultValue);
