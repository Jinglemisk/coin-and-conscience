import type { DayPhase } from '#config/configTypes';
import { useVisitorStore } from './visitorStore';
import { useTimeStore } from '@/features/time/timeStore';

interface VisitorSmokeResult {
  spawnTick: number;
  talk?: unknown;
  offer?: unknown;
  refuse?: unknown;
}

const DAY_PHASE: DayPhase = 'day';

const runPhaseThreeSmoke = (): VisitorSmokeResult => {
  const visitorStore = useVisitorStore.getState();
  const timeState = useTimeStore.getState();
  const spawnInterval = Math.max(1, visitorStore.spawnIntervalTicks);
  const context = { phase: DAY_PHASE, tick: timeState.tick };

  const initialEvents = visitorStore.advanceTime(spawnInterval, context);
  const activeAfterSpawn = useVisitorStore.getState().activeVisitor;

  const talkResult = visitorStore.talk();
  const offerResult = visitorStore.offer();

  visitorStore.advanceTime(spawnInterval, context);
  const refuseResult = visitorStore.refuse();

  const summary: VisitorSmokeResult = {
    spawnTick: initialEvents.spawned ? context.tick : timeState.tick,
    talk: talkResult,
    offer: offerResult,
    refuse: refuseResult
  };

  if (!initialEvents.spawned && !activeAfterSpawn) {
    console.warn('[visitors.qa] Expected visitor spawn during smoke test but none materialised. Ensure the day phase is active.');
  }

  console.group('[visitors.qa] Phase 3 smoke test');
  console.info('spawned', initialEvents.spawned);
  console.info('talk', talkResult);
  console.info('offer', offerResult);
  console.info('refuse', refuseResult);
  console.groupEnd();

  return summary;
};

export const registerVisitorDebugApi = () => {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const api = {
    runPhase3Smoke: runPhaseThreeSmoke
  } as const;

  Object.defineProperty(window, '__debugVisitors', {
    value: api,
    writable: false,
    configurable: true
  });

  return () => {
    if ('__debugVisitors' in window) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete (window as Record<string, unknown>).__debugVisitors;
    }
  };
};
