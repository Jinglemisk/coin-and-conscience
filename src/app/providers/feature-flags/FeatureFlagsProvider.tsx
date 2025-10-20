import { useEffect, useRef, type PropsWithChildren } from 'react';
import type { FeatureFlagValue } from '#config/configTypes';
import { useConfigStore } from '../config';
import { useFeatureFlagsStore } from './featureFlagsStore';

export interface FeatureFlagsProviderProps {
  overrides?: Record<string, FeatureFlagValue>;
}

export const FeatureFlagsProvider = ({ overrides, children }: PropsWithChildren<FeatureFlagsProviderProps>) => {
  const registry = useConfigStore((state) => state.config.featureFlags);
  const syncRegistry = useFeatureFlagsStore((state) => state.syncRegistry);
  const setFlag = useFeatureFlagsStore((state) => state.setFlag);
  const overridesRef = useRef(overrides);

  useEffect(() => {
    overridesRef.current = overrides;
  }, [overrides]);

  useEffect(() => {
    syncRegistry(registry);
    const currentOverrides = overridesRef.current;
    if (!currentOverrides) {
      return;
    }
    for (const [key, value] of Object.entries(currentOverrides)) {
      try {
        setFlag(key, value);
      } catch (error) {
        console.warn(`Failed to apply feature flag override for "${key}".`, error);
      }
    }
  }, [registry, setFlag, syncRegistry]);

  return <>{children}</>;
};
