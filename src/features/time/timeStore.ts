import { create } from 'zustand';
import type { DayPhase } from '#config/configTypes';
import { useConfigStore } from '@/app/providers';

const DAY_PHASE_ORDER: readonly DayPhase[] = ['morning', 'day', 'evening', 'night'];

type PhaseDurationMap = Record<DayPhase, number>;

export interface PhaseTransitionMeta {
  from: DayPhase;
  to: DayPhase;
  tick: number;
  day: number;
  week: number;
  dayOfWeek: number;
}

interface TimeLoopState {
  tick: number;
  day: number;
  week: number;
  dayOfWeek: number;
  phase: DayPhase;
  phaseTick: number;
  dayTick: number;
  phaseDurationsTicks: PhaseDurationMap;
  daysPerWeek: number;
  allowedSpeedMultipliers: ReadonlyArray<number>;
  speedMultiplier: number;
  isPaused: boolean;
  advanceTicks: (deltaTicks: number) => PhaseTransitionMeta[];
  setSpeedMultiplier: (multiplier: number) => void;
  setPaused: (paused: boolean) => void;
  syncFromConfig: () => void;
}

const computePhaseDurations = (): PhaseDurationMap => {
  const config = useConfigStore.getState();
  return DAY_PHASE_ORDER.reduce<PhaseDurationMap>((accumulator, phase) => {
    accumulator[phase] = config.getPhaseDurationTicks(phase);
    return accumulator;
  }, {} as PhaseDurationMap);
};

const getNextPhase = (phase: DayPhase): DayPhase => {
  const currentIndex = DAY_PHASE_ORDER.indexOf(phase);
  const nextIndex = (currentIndex + 1) % DAY_PHASE_ORDER.length;
  return DAY_PHASE_ORDER[nextIndex];
};

const deriveWeekMeta = (day: number, daysPerWeek: number) => {
  const dayIndex = Math.max(0, day - 1);
  const week = Math.floor(dayIndex / daysPerWeek) + 1;
  const dayOfWeek = (dayIndex % daysPerWeek) + 1;
  return { week, dayOfWeek };
};

const configState = useConfigStore.getState();
const initialDaysPerWeek = configState.getDaysPerWeek();
const initialAllowedMultipliers = configState.getSpeedMultipliers();
const initialSpeedMultiplier = configState.getDefaultSpeedMultiplier();

export const useTimeStore = create<TimeLoopState>((set) => ({
  tick: 0,
  day: 1,
  ...deriveWeekMeta(1, initialDaysPerWeek),
  phase: 'morning',
  phaseTick: 0,
  dayTick: 0,
  phaseDurationsTicks: computePhaseDurations(),
  daysPerWeek: initialDaysPerWeek,
  allowedSpeedMultipliers: initialAllowedMultipliers,
  speedMultiplier: initialSpeedMultiplier,
  isPaused: false,
  advanceTicks: (deltaTicks) => {
    if (deltaTicks <= 0) {
      return [];
    }

    const transitions: PhaseTransitionMeta[] = [];

    set((state) => {
      let { tick, day, week, dayOfWeek, phase, phaseTick, dayTick } = state;
      const { phaseDurationsTicks, daysPerWeek } = state;

      for (let i = 0; i < deltaTicks; i += 1) {
        tick += 1;
        phaseTick += 1;
        dayTick += 1;

        const currentPhaseDuration = phaseDurationsTicks[phase];

        if (phaseTick >= currentPhaseDuration) {
          const from = phase;
          const nextPhase = getNextPhase(phase);

          phase = nextPhase;
          phaseTick = 0;

          if (nextPhase === 'morning') {
            day += 1;
            dayTick = 0;
            const meta = deriveWeekMeta(day, daysPerWeek);
            week = meta.week;
            dayOfWeek = meta.dayOfWeek;
          }

          transitions.push({
            from,
            to: nextPhase,
            tick,
            day,
            week,
            dayOfWeek
          });
        }
      }

      return {
        tick,
        day,
        week,
        dayOfWeek,
        phase,
        phaseTick,
        dayTick
      };
    });

    return transitions;
  },
  setSpeedMultiplier: (multiplier) => {
    set((state) => {
      const isAllowed = state.allowedSpeedMultipliers.includes(multiplier);
      return {
        speedMultiplier: isAllowed ? multiplier : state.speedMultiplier
      };
    });
  },
  setPaused: (paused) => {
    set({ isPaused: paused });
  },
  syncFromConfig: () => {
    const config = useConfigStore.getState();
    const nextDaysPerWeek = config.getDaysPerWeek();
    const nextAllowedMultipliers = config.getSpeedMultipliers();
    const defaultMultiplier = config.getDefaultSpeedMultiplier();
    const nextDurations = computePhaseDurations();

    set((state) => {
      const multiplier = nextAllowedMultipliers.includes(state.speedMultiplier)
        ? state.speedMultiplier
        : defaultMultiplier;

      const { week, dayOfWeek } = deriveWeekMeta(state.day, nextDaysPerWeek);

      return {
        phaseDurationsTicks: nextDurations,
        daysPerWeek: nextDaysPerWeek,
        allowedSpeedMultipliers: nextAllowedMultipliers,
        speedMultiplier: multiplier,
        week,
        dayOfWeek
      };
    });
  }
}));
