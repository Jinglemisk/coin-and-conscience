import { create } from 'zustand';
import type { DayPhase, VisitorConfig } from '#config/configTypes';
import { useConfigStore } from '@/app/providers';
import { useTimeStore } from '@/features/time/timeStore';
import { createPhaseThreeVisitor } from './visitorContent';
import type {
  VisitorActionLogEntry,
  VisitorAdvanceContext,
  VisitorDepartureReason,
  VisitorInstance
} from './types';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const createLogId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `visitor-log-${Math.random().toString(36).slice(2)}`;
};

const createLogEntry = (
  action: VisitorActionLogEntry['action'],
  summary: string,
  satisfactionAfter: number
): VisitorActionLogEntry => ({
  id: createLogId(),
  action,
  summary,
  timestamp: Date.now(),
  satisfactionAfter
});

export interface VisitorAdvanceResult {
  spawned?: VisitorInstance;
  timedOut?: VisitorInstance;
  promoted?: VisitorInstance;
}

export interface VisitorInteractionResult {
  visitor: VisitorInstance;
  satisfaction: number;
  satisfactionDelta: number;
  remainingPatience: number;
  dialogueLine?: string | null;
  departureReason?: VisitorDepartureReason;
}

interface VisitorStoreState {
  config: VisitorConfig;
  activeVisitor: VisitorInstance | null;
  queue: VisitorInstance[];
  spawnIntervalTicks: number;
  ticksUntilNextSpawn: number;
  maxQueueDepth: number;
  talkTimeCostTicks: number;
  idlePatienceDrainPerTick: number;
  patienceDrainPerInteraction: number;
  talkSatisfactionDelta: number;
  refusePenalty: number;
  needFulfilledSatisfactionDelta: number;
  syncFromConfig: () => void;
  resetForPhase: (phase: DayPhase) => void;
  advanceTime: (deltaTicks: number, context: VisitorAdvanceContext) => VisitorAdvanceResult;
  talk: () => VisitorInteractionResult | null;
  offer: () => VisitorInteractionResult | null;
  refuse: () => VisitorInteractionResult | null;
}

const deriveInitialState = () => {
  const configStore = useConfigStore.getState();
  const visitorConfig = configStore.getVisitorConfig();
  const spawnIntervalTicks = configStore.getVisitorArrivalIntervalTicks();
  const talkTimeCostTicks = configStore.getVisitorTalkTimeCostTicks();

  return {
    config: visitorConfig,
    activeVisitor: null,
    queue: [] as VisitorInstance[],
    spawnIntervalTicks,
    ticksUntilNextSpawn: spawnIntervalTicks,
    maxQueueDepth: visitorConfig.maxQueueDepth,
    talkTimeCostTicks,
    idlePatienceDrainPerTick: visitorConfig.idlePatienceDrainPerTick,
    patienceDrainPerInteraction: visitorConfig.patienceDrainPerInteraction,
    talkSatisfactionDelta: visitorConfig.talkSatisfactionDelta,
    refusePenalty: visitorConfig.refusePenalty,
    needFulfilledSatisfactionDelta: visitorConfig.needFulfilledSatisfactionDelta
  } satisfies Omit<VisitorStoreState, 'syncFromConfig' | 'resetForPhase' | 'advanceTime' | 'talk' | 'offer' | 'refuse'>;
};

export const useVisitorStore = create<VisitorStoreState>((set, get) => ({
  ...deriveInitialState(),
  syncFromConfig: () => {
    const configStore = useConfigStore.getState();
    const nextConfig = configStore.getVisitorConfig();
    const spawnIntervalTicks = configStore.getVisitorArrivalIntervalTicks();
    const talkTimeCostTicks = configStore.getVisitorTalkTimeCostTicks();

    set((state) => ({
      ...state,
      config: nextConfig,
      spawnIntervalTicks,
      talkTimeCostTicks,
      ticksUntilNextSpawn: spawnIntervalTicks,
      maxQueueDepth: nextConfig.maxQueueDepth,
      idlePatienceDrainPerTick: nextConfig.idlePatienceDrainPerTick,
      patienceDrainPerInteraction: nextConfig.patienceDrainPerInteraction,
      talkSatisfactionDelta: nextConfig.talkSatisfactionDelta,
      refusePenalty: nextConfig.refusePenalty,
      needFulfilledSatisfactionDelta: nextConfig.needFulfilledSatisfactionDelta
    }));
  },
  resetForPhase: (phase) => {
    if (phase === 'day') {
      return;
    }

    set((state) => ({
      ...state,
      activeVisitor: null,
      queue: [],
      ticksUntilNextSpawn: state.spawnIntervalTicks
    }));
  },
  advanceTime: (deltaTicks, context) => {
    if (deltaTicks <= 0) {
      return {};
    }

    const events: VisitorAdvanceResult = {};

    set((state) => {
      const nextQueue = [...state.queue];
      let nextActive = state.activeVisitor ? { ...state.activeVisitor } : null;
      let ticksUntilNextSpawn = state.ticksUntilNextSpawn;
      let stateChanged = false;

      if (context.phase !== 'day') {
        if (ticksUntilNextSpawn !== state.spawnIntervalTicks) {
          ticksUntilNextSpawn = state.spawnIntervalTicks;
          stateChanged = true;
        }

        if (!stateChanged) {
          return state;
        }

        return {
          ...state,
          ticksUntilNextSpawn
        };
      }

      ticksUntilNextSpawn -= deltaTicks;
      while (ticksUntilNextSpawn <= 0) {
        if (!nextActive) {
          const spawned = createPhaseThreeVisitor(state.config, context.tick);
          nextActive = spawned;
          events.spawned = spawned;
          stateChanged = true;
        } else if (nextQueue.length < state.maxQueueDepth) {
          const spawned = createPhaseThreeVisitor(state.config, context.tick);
          nextQueue.push(spawned);
          events.spawned = spawned;
          stateChanged = true;
        } else {
          // Queue is saturated; pause spawning until a slot is freed.
          ticksUntilNextSpawn = state.spawnIntervalTicks;
          break;
        }

        ticksUntilNextSpawn += state.spawnIntervalTicks;
      }

      if (!stateChanged && ticksUntilNextSpawn !== state.ticksUntilNextSpawn) {
        stateChanged = true;
      }

      if (nextActive) {
        const patienceLoss = state.idlePatienceDrainPerTick * deltaTicks;
        if (patienceLoss > 0) {
          const patienceAfter = Math.max(0, nextActive.patience - patienceLoss);
          if (patienceAfter <= 0) {
            const timeoutLog = createLogEntry('timeout', 'Visitor ran out of patience while waiting.', 0);
            const departedVisitor: VisitorInstance = {
              ...nextActive,
              patience: 0,
              departureReason: 'timeout',
              log: [...nextActive.log, timeoutLog]
            };
            events.timedOut = departedVisitor;
            nextActive = null;
            stateChanged = true;
          } else if (patienceAfter !== nextActive.patience) {
            nextActive = {
              ...nextActive,
              patience: patienceAfter
            };
            stateChanged = true;
          }
        }
      }

      if (!nextActive && nextQueue.length > 0) {
        const promoted = nextQueue.shift()!;
        nextActive = promoted;
        events.promoted = promoted;
        stateChanged = true;
      }

      if (!stateChanged) {
        return state;
      }

      return {
        ...state,
        activeVisitor: nextActive,
        queue: nextQueue,
        ticksUntilNextSpawn
      };
    });

    return events;
  },
  talk: () => {
    let result: VisitorInteractionResult | null = null;

    set((state) => {
      const active = state.activeVisitor;
      if (!active) {
        return state;
      }

      const line = active.dialogueLines[Math.min(active.talkCursor, active.dialogueLines.length - 1)] ?? null;
      const nextCursor = active.dialogueLines.length === 0
        ? active.talkCursor
        : Math.min(active.talkCursor + 1, active.dialogueLines.length - 1);
      const satisfactionDelta = active.talkCursor === 0 ? state.talkSatisfactionDelta : 0;
      const satisfactionAfter = clamp(active.satisfaction + satisfactionDelta, 0, 100);
      const patienceCost = state.patienceDrainPerInteraction + state.idlePatienceDrainPerTick * state.talkTimeCostTicks;
      const patienceAfter = Math.max(0, active.patience - patienceCost);

      const logEntry = createLogEntry('talk', line ?? 'Talked with the visitor.', satisfactionAfter);

      const updatedVisitor: VisitorInstance = {
        ...active,
        satisfaction: satisfactionAfter,
        patience: patienceAfter,
        talkCursor: nextCursor,
        lastInteractionTick: useTimeStore.getState().tick,
        log: [...active.log, logEntry]
      };

      if (patienceAfter <= 0) {
        updatedVisitor.departureReason = 'timeout';
        const nextQueue = [...state.queue];
        const nextActive = nextQueue.shift() ?? null;
        result = {
          visitor: updatedVisitor,
          satisfaction: satisfactionAfter,
          satisfactionDelta,
          remainingPatience: patienceAfter,
          dialogueLine: line,
          departureReason: 'timeout'
        };
        return {
          ...state,
          activeVisitor: nextActive,
          queue: nextQueue
        };
      }

      result = {
        visitor: updatedVisitor,
        satisfaction: satisfactionAfter,
        satisfactionDelta,
        remainingPatience: patienceAfter,
        dialogueLine: line
      };

      return {
        ...state,
        activeVisitor: updatedVisitor
      };
    });

    return result;
  },
  offer: () => {
    let result: VisitorInteractionResult | null = null;

    set((state) => {
      const active = state.activeVisitor;
      if (!active) {
        return state;
      }

      const satisfactionDelta = state.needFulfilledSatisfactionDelta;
      const satisfactionAfter = clamp(active.satisfaction + satisfactionDelta, 0, 100);
      const patienceAfter = Math.max(0, active.patience - state.patienceDrainPerInteraction);

      const logEntry = createLogEntry('offer', 'Completed placeholder sale interaction.', satisfactionAfter);

      const departedVisitor: VisitorInstance = {
        ...active,
        satisfaction: satisfactionAfter,
        patience: patienceAfter,
        departureReason: 'completed',
        lastInteractionTick: useTimeStore.getState().tick,
        log: [...active.log, logEntry]
      };

      const nextQueue = [...state.queue];
      const nextActive = nextQueue.shift() ?? null;

      result = {
        visitor: departedVisitor,
        satisfaction: satisfactionAfter,
        satisfactionDelta,
        remainingPatience: patienceAfter,
        departureReason: 'completed'
      };

      return {
        ...state,
        activeVisitor: nextActive,
        queue: nextQueue
      };
    });

    return result;
  },
  refuse: () => {
    let result: VisitorInteractionResult | null = null;

    set((state) => {
      const active = state.activeVisitor;
      if (!active) {
        return state;
      }

      const satisfactionDelta = state.refusePenalty;
      const satisfactionAfter = clamp(active.satisfaction + satisfactionDelta, 0, 100);

      const logEntry = createLogEntry('refuse', 'Player refused service.', satisfactionAfter);

      const departedVisitor: VisitorInstance = {
        ...active,
        satisfaction: satisfactionAfter,
        patience: 0,
        departureReason: 'refused',
        lastInteractionTick: useTimeStore.getState().tick,
        log: [...active.log, logEntry]
      };

      const nextQueue = [...state.queue];
      const nextActive = nextQueue.shift() ?? null;

      result = {
        visitor: departedVisitor,
        satisfaction: satisfactionAfter,
        satisfactionDelta,
        remainingPatience: 0,
        departureReason: 'refused'
      };

      return {
        ...state,
        activeVisitor: nextActive,
        queue: nextQueue
      };
    });

    return result;
  }
}));
