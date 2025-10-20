import { useCallback } from 'react';
import type { DayPhase, DayPhaseDurations, FeatureFlagDefinition } from '#config/configTypes';
import {
  ConfigProvider,
  FeatureFlagsProvider,
  LoggerProvider,
  ModifiersProvider,
  PersistenceProvider,
  TelemetryProvider,
  useConfigStore,
  useFeatureFlagsStore,
  useLoggerStore,
  useTelemetry
} from './providers';

const asPhaseEntries = (durations: DayPhaseDurations) =>
  Object.entries(durations) as Array<[DayPhase, number]>;

const asFlagEntries = (registry: Record<string, FeatureFlagDefinition>) =>
  Object.entries(registry) as Array<[string, FeatureFlagDefinition]>;

const PrototypeStatus = () => {
  const ticks = useConfigStore((state) => state.config.ticks);
  const phaseDurations = useConfigStore((state) => state.config.dayPhaseDurations);
  const featureFlags = useFeatureFlagsStore((state) => state.values);
  const registry = useFeatureFlagsStore((state) => state.registry);
  const log = useLoggerStore((state) => state.log);
  const telemetry = useTelemetry();

  const emitTelemetry = useCallback(() => {
    telemetry.track('prototype.button_click', { source: 'status-panel' }, ['dev']);
  }, [telemetry]);

  const handleLogSample = useCallback(() => {
    log('info', 'Logger pipeline is active', { ticks }, ['prototype']);
    emitTelemetry();
  }, [emitTelemetry, log, ticks]);

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '1.5rem', lineHeight: 1.6 }}>
      <h1>Coin &amp; Conscience — Phase 0 Skeleton</h1>
      <section>
        <h2>Timekeeping</h2>
        <p>Ticks per second: {ticks.ticksPerSecond}</p>
        <p>Max ticks per frame: {ticks.maxTicksPerFrame}</p>
        <ul>
          {asPhaseEntries(phaseDurations).map(([phase, seconds]) => (
            <li key={phase}>
              {phase}: {seconds} seconds
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Feature Flags</h2>
        <ul>
          {Object.keys(registry).length === 0 && <li>No feature flag registry loaded.</li>}
          {asFlagEntries(registry).map(([key, definition]) => (
            <li key={key}>
              <strong>{definition.label}</strong> — current value: {String(featureFlags[key] ?? definition.defaultValue)}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Diagnostics</h2>
        <button onClick={handleLogSample} type="button">
          Emit sample log &amp; telemetry
        </button>
      </section>
    </main>
  );
};

export const App = () => (
  <ConfigProvider>
    <FeatureFlagsProvider>
      <LoggerProvider>
        <TelemetryProvider>
          <ModifiersProvider>
            <PersistenceProvider>
              <PrototypeStatus />
            </PersistenceProvider>
          </ModifiersProvider>
        </TelemetryProvider>
      </LoggerProvider>
    </FeatureFlagsProvider>
  </ConfigProvider>
);
