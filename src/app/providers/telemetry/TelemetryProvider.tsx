import { createContext, useCallback, useContext, useMemo, useRef, type PropsWithChildren } from 'react';
import type { FeatureFlagValue } from '#config/configTypes';
import { logDebug } from '../logger';
import { useFeatureFlagValue } from '../feature-flags';
import type { TelemetryClient, TelemetryEvent, TelemetrySink } from './telemetryTypes';

const TelemetryContext = createContext<TelemetryClient | null>(null);

const generateTelemetryId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `telemetry-${Math.random().toString(36).slice(2)}`;
};

const shouldLogToConsole = (sink: FeatureFlagValue | undefined) => sink !== 'off';
const shouldBufferEvents = (sink: FeatureFlagValue | undefined) => sink === 'memory';

export const TelemetryProvider = ({ children }: PropsWithChildren) => {
  const telemetrySink = useFeatureFlagValue('telemetrySink');
  const debugLogging = useFeatureFlagValue('debugLogging');

  const bufferRef = useRef<TelemetryEvent[]>([]);
  const sinksRef = useRef<Set<TelemetrySink>>(new Set());

  const emit = useCallback(
    (event: TelemetryEvent) => {
      if (shouldLogToConsole(telemetrySink)) {
        console.info(`[telemetry] ${event.name}`, event);
      }

      if (shouldBufferEvents(telemetrySink)) {
        bufferRef.current = [...bufferRef.current, event];
      }

      if (debugLogging === true || debugLogging === 'enabled') {
        logDebug('Telemetry event emitted', { name: event.name, tags: event.tags });
      }

      sinksRef.current.forEach((sink) => sink(event));
    },
    [debugLogging, telemetrySink]
  );

  const track = useCallback(
    (name: string, payload: Record<string, unknown> = {}, tags: readonly string[] = []) => {
      const event: TelemetryEvent = {
        id: generateTelemetryId(),
        name,
        payload,
        tags,
        timestamp: Date.now()
      };
      emit(event);
    },
    [emit]
  );

  const registerSink = useCallback((sink: TelemetrySink) => {
    sinksRef.current.add(sink);
    return () => {
      sinksRef.current.delete(sink);
    };
  }, []);

  const getBuffer = useCallback(() => bufferRef.current, []);

  const flushBuffer = useCallback(() => {
    bufferRef.current = [];
  }, []);

  const client = useMemo<TelemetryClient>(() => ({ emit, track, registerSink, getBuffer, flushBuffer }), [emit, flushBuffer, getBuffer, registerSink]);

  return <TelemetryContext.Provider value={client}>{children}</TelemetryContext.Provider>;
};

export const useTelemetry = () => {
  const ctx = useContext(TelemetryContext);
  if (!ctx) {
    throw new Error('useTelemetry must be used within a TelemetryProvider');
  }
  return ctx;
};
