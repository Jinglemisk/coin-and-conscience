import { createContext, useContext, useMemo, useRef, type PropsWithChildren } from 'react';
import type { PersistenceClient, PersistenceSnapshot, PersistenceStrategy } from './persistenceTypes';
import { useFeatureFlagValue } from '../feature-flags';

const PersistenceContext = createContext<PersistenceClient | null>(null);

const resolveStrategy = (flagValue: unknown): PersistenceStrategy => {
  if (flagValue === 'sessionStorage') {
    return 'sessionStorage';
  }
  if (flagValue === 'off') {
    return 'off';
  }
  return 'indexedDb';
};

export const PersistenceProvider = ({ children }: PropsWithChildren) => {
  const flagValue = useFeatureFlagValue('persistenceMode');
  const strategyRef = useRef<PersistenceStrategy>(resolveStrategy(flagValue));

  strategyRef.current = resolveStrategy(flagValue);

  const client = useMemo<PersistenceClient>(() => ({
    async saveSnapshot(snapshot: PersistenceSnapshot) {
      console.info('[persistence] save snapshot (stub)', snapshot);
    },
    async loadSnapshot(id: string) {
      console.info('[persistence] load snapshot (stub)', { id });
      return null;
    },
    async deleteSnapshot(id: string) {
      console.info('[persistence] delete snapshot (stub)', { id });
    },
    async listSnapshots() {
      console.info('[persistence] list snapshots (stub)');
      return [];
    },
    setStrategy(strategy: PersistenceStrategy) {
      strategyRef.current = strategy;
    },
    getStrategy() {
      return strategyRef.current;
    }
  }), []);

  return <PersistenceContext.Provider value={client}>{children}</PersistenceContext.Provider>;
};

export const usePersistence = () => {
  const ctx = useContext(PersistenceContext);
  if (!ctx) {
    throw new Error('usePersistence must be used within a PersistenceProvider');
  }
  return ctx;
};
