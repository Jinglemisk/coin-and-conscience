import { useEffect, useRef } from 'react';
import { useConfigStore, useLoggerStore, useTelemetry } from '@/app/providers';
import { useTimeStore } from '@/features/time/timeStore';
import { useVisitorStore } from './visitorStore';

export const VisitorArrivalManager = () => {
  const syncFromConfig = useVisitorStore((state) => state.syncFromConfig);
  const resetForPhase = useVisitorStore((state) => state.resetForPhase);
  const advanceTime = useVisitorStore((state) => state.advanceTime);
  const logEvent = useLoggerStore((state) => state.log);
  const telemetry = useTelemetry();

  const lastTickRef = useRef(useTimeStore.getState().tick);
  const lastPhaseRef = useRef(useTimeStore.getState().phase);

  useEffect(() => {
    const unsubscribe = useConfigStore.subscribe(() => {
      syncFromConfig();
    });

    syncFromConfig();

    return unsubscribe;
  }, [syncFromConfig]);

  useEffect(() => {
    const unsubscribe = useTimeStore.subscribe((state) => {
      const { tick, phase } = state;
      const previousTick = lastTickRef.current;
      const previousPhase = lastPhaseRef.current;

      if (phase !== previousPhase) {
        resetForPhase(phase);
        logEvent(
          'info',
          'visitor.phaseTransition',
          {
            from: previousPhase,
            to: phase,
            tick
          },
          ['visitors']
        );
        telemetry.track(
          'visitor.phase.transition',
          {
            from: previousPhase,
            to: phase,
            tick
          },
          ['visitors']
        );
        lastPhaseRef.current = phase;
      }

      const deltaTicks = tick - previousTick;
      if (deltaTicks > 0) {
        const events = advanceTime(deltaTicks, { phase, tick });

        if (events.spawned) {
          logEvent(
            'info',
            'visitor.spawned',
            {
              visitorId: events.spawned.id,
              templateId: events.spawned.templateId,
              honesty: events.spawned.honesty,
              tick,
              queueLength: useVisitorStore.getState().queue.length
            },
            ['visitors']
          );
          telemetry.track(
            'visitor.spawned',
            {
              visitorId: events.spawned.id,
              templateId: events.spawned.templateId,
              honesty: events.spawned.honesty,
              tick
            },
            ['visitors']
          );
        }

        if (events.promoted) {
          logEvent(
            'info',
            'visitor.promoted',
            {
              visitorId: events.promoted.id,
              templateId: events.promoted.templateId,
              tick
            },
            ['visitors']
          );
          telemetry.track(
            'visitor.promoted',
            {
              visitorId: events.promoted.id,
              templateId: events.promoted.templateId,
              tick
            },
            ['visitors']
          );
        }

        if (events.timedOut) {
          logEvent(
            'warn',
            'visitor.timedOut',
            {
              visitorId: events.timedOut.id,
              templateId: events.timedOut.templateId,
              tick,
              satisfaction: events.timedOut.satisfaction
            },
            ['visitors']
          );
          telemetry.track(
            'visitor.timedOut',
            {
              visitorId: events.timedOut.id,
              templateId: events.timedOut.templateId,
              tick
            },
            ['visitors']
          );
        }
      }

      lastTickRef.current = tick;
    });

    return unsubscribe;
  }, [advanceTime, logEvent, resetForPhase, telemetry]);

  return null;
};
