import { useEffect, useRef } from 'react';
import { useConfigStore, useLoggerStore, useTelemetry } from '@/app/providers';
import { useGlobalStatsStore } from '@/features/stats/globalStatsStore';
import { useTimeStore } from './timeStore';

const EPSILON = 0.0001;

export const TimeController = () => {
  const ticksPerSecond = useConfigStore((state) => state.config.ticks.ticksPerSecond);
  const maxTicksPerFrame = useConfigStore((state) => state.config.ticks.maxTicksPerFrame);
  const syncFromConfig = useTimeStore((state) => state.syncFromConfig);
  const advanceTicks = useTimeStore((state) => state.advanceTicks);
  const isPaused = useTimeStore((state) => state.isPaused);
  const speedMultiplier = useTimeStore((state) => state.speedMultiplier);
  const logEvent = useLoggerStore((state) => state.log);
  const telemetry = useTelemetry();
  const recordSnapshot = useGlobalStatsStore((state) => state.recordPhaseSnapshot);

  const settingsRef = useRef({ isPaused, speedMultiplier });
  const rafRef = useRef<number>();
  const lastTimestampRef = useRef<number | null>(null);
  const tickCarryRef = useRef(0);

  useEffect(() => {
    settingsRef.current = { isPaused, speedMultiplier };
  }, [isPaused, speedMultiplier]);

  useEffect(() => {
    // Keep loop timings in sync with HMR/config updates.
    const unsubscribe = useConfigStore.subscribe(() => {
      syncFromConfig();
    });

    // Ensure initial sync in case config changed before mount.
    syncFromConfig();

    return unsubscribe;
  }, [syncFromConfig]);

  useEffect(() => {
    const runFrame = (timestamp: number) => {
      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = timestamp;
      }

      const deltaMs = timestamp - lastTimestampRef.current;
      lastTimestampRef.current = timestamp;

      const { isPaused: paused, speedMultiplier: multiplier } = settingsRef.current;
      const effectiveMultiplier = paused ? 0 : multiplier;

      if (effectiveMultiplier > EPSILON) {
        const ticksPerMillisecond = (ticksPerSecond * effectiveMultiplier) / 1000;
        const accumulated = tickCarryRef.current + deltaMs * ticksPerMillisecond;
        const requestedTicks = Math.floor(accumulated);
        const ticksToRun = Math.min(requestedTicks, maxTicksPerFrame);
        tickCarryRef.current = accumulated - ticksToRun;

        if (ticksToRun > 0) {
          const transitions = advanceTicks(ticksToRun);

          telemetry.track(
            'time.tick.batch',
            {
              ticksRan: ticksToRun,
              effectiveMultiplier,
              frameDurationMs: deltaMs,
              totalTicks: useTimeStore.getState().tick
            },
            ['loop']
          );

          transitions.forEach((transition) => {
            const snapshot = recordSnapshot(transition);

            logEvent(
              'info',
              'time.phase.transition',
              {
                from: transition.from,
                to: transition.to,
                day: transition.day,
                week: transition.week,
                dayOfWeek: transition.dayOfWeek,
                tick: transition.tick,
                snapshot: snapshot.stats
              },
              ['loop']
            );

            telemetry.track(
              'time.phase.transition',
              {
                from: transition.from,
                to: transition.to,
                day: transition.day,
                week: transition.week,
                dayOfWeek: transition.dayOfWeek,
                tick: transition.tick
              },
              ['loop']
            );

            telemetry.track(
              'time.phase.snapshot',
              {
                phase: snapshot.completedPhase,
                day: snapshot.day,
                week: snapshot.week,
                dayOfWeek: snapshot.dayOfWeek,
                tick: snapshot.tick,
                ...snapshot.stats
              },
              ['loop']
            );
          });
        }
      }

      if (effectiveMultiplier <= EPSILON) {
        tickCarryRef.current = 0;
      }

      rafRef.current = requestAnimationFrame(runFrame);
    };

    rafRef.current = requestAnimationFrame(runFrame);

    return () => {
      if (rafRef.current !== undefined) {
        cancelAnimationFrame(rafRef.current);
      }
      lastTimestampRef.current = null;
      tickCarryRef.current = 0;
    };
  }, [advanceTicks, ticksPerSecond, maxTicksPerFrame, logEvent, telemetry, recordSnapshot]);

  return null;
};
