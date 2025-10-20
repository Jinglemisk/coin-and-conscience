export type PersistenceStrategy = 'indexedDb' | 'sessionStorage' | 'off';

export interface PersistenceSnapshot {
  id: string;
  createdAt: number;
  description?: string;
  payload: unknown;
}

export interface PersistenceClient {
  saveSnapshot: (snapshot: PersistenceSnapshot) => Promise<void>;
  loadSnapshot: (id: string) => Promise<PersistenceSnapshot | null>;
  deleteSnapshot: (id: string) => Promise<void>;
  listSnapshots: () => Promise<PersistenceSnapshot[]>;
  setStrategy: (strategy: PersistenceStrategy) => void;
  getStrategy: () => PersistenceStrategy;
}
