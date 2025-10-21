import { create } from 'zustand';
import type { DayPhase } from '#config/configTypes';
import type { PhaseTransitionMeta } from '@/features/time/timeStore';

export interface GlobalStats {
  gold: number;
  reputation: number;
  danger: number;
  heat: number;
  partySize: number;
}

export interface PhaseSnapshot {
  id: string;
  completedPhase: DayPhase;
  tick: number;
  day: number;
  week: number;
  dayOfWeek: number;
  recordedAt: number;
  stats: GlobalStats;
}

interface GlobalStatsState {
  stats: GlobalStats;
  snapshots: PhaseSnapshot[];
  updateStats: (partial: Partial<GlobalStats>) => void;
  recordPhaseSnapshot: (transition: PhaseTransitionMeta) => PhaseSnapshot;
  reset: () => void;
}

const INITIAL_STATS: GlobalStats = Object.freeze({
  gold: 0,
  reputation: 0,
  danger: 0,
  heat: 0,
  partySize: 0
});

const createSnapshotId = (transition: PhaseTransitionMeta) =>
  `${transition.tick}-${transition.from}-${transition.to}`;

export const useGlobalStatsStore = create<GlobalStatsState>((set, get) => ({
  stats: { ...INITIAL_STATS },
  snapshots: [],
  updateStats: (partial) => {
    set((state) => ({
      stats: { ...state.stats, ...partial }
    }));
  },
  recordPhaseSnapshot: (transition) => {
    const stats = get().stats;

    const snapshot: PhaseSnapshot = {
      id: createSnapshotId(transition),
      completedPhase: transition.from,
      tick: transition.tick,
      day: transition.day,
      week: transition.week,
      dayOfWeek: transition.dayOfWeek,
      recordedAt: Date.now(),
      stats: { ...stats }
    };

    set((state) => ({
      snapshots: [...state.snapshots, snapshot]
    }));

    return snapshot;
  },
  reset: () => {
    set({
      stats: { ...INITIAL_STATS },
      snapshots: []
    });
  }
}));
