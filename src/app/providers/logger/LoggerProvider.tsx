import { useEffect, useMemo, type PropsWithChildren } from 'react';
import type { FeatureFlagValue } from '#config/configTypes';
import type { LoggerOptions } from './loggerTypes';
import { useFeatureFlagValue } from '../feature-flags';
import { useLoggerStore } from './loggerStore';

export interface LoggerProviderProps {
  options?: LoggerOptions;
}

const resolveOptions = (
  options: LoggerOptions | undefined,
  telemetrySink: FeatureFlagValue | undefined,
  debugLogging: FeatureFlagValue | undefined
) => {
  const sinkRequiresBuffer = telemetrySink === 'memory';
  const debugEnabled = debugLogging === true || debugLogging === 'enabled';
  const requestedEnable = options?.enableBuffer ?? true;

  return {
    enableBuffer: sinkRequiresBuffer ? true : requestedEnable,
    maxBufferSize: options?.maxBufferSize ?? 200,
    defaultTags: options?.defaultTags ?? (debugEnabled ? (['debug'] as const) : [])
  } satisfies Required<Pick<LoggerOptions, 'enableBuffer' | 'maxBufferSize' | 'defaultTags'>>;
};

export const LoggerProvider = ({ options, children }: PropsWithChildren<LoggerProviderProps>) => {
  const configure = useLoggerStore((state) => state.configure);
  const telemetrySink = useFeatureFlagValue('telemetrySink');
  const debugLogging = useFeatureFlagValue('debugLogging');

  const resolvedOptions = useMemo(
    () => resolveOptions(options, telemetrySink, debugLogging),
    [options, telemetrySink, debugLogging]
  );

  useEffect(() => {
    configure(resolvedOptions);
  }, [configure, resolvedOptions]);

  return <>{children}</>;
};
