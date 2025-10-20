import { useEffect, type PropsWithChildren } from 'react';
import type { GameConfig } from '#config/configTypes';
import { useConfigStore } from './configStore';

export interface ConfigProviderProps {
  configOverride?: GameConfig;
}

export const ConfigProvider = ({ configOverride, children }: PropsWithChildren<ConfigProviderProps>) => {
  const refreshConfig = useConfigStore((state) => state.refreshConfig);

  useEffect(() => {
    if (configOverride) {
      refreshConfig(configOverride);
    }
  }, [configOverride, refreshConfig]);

  return <>{children}</>;
};
