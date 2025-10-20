export type ModifierScope = 'global' | 'economy' | 'reputation' | 'danger' | 'inventory' | 'visitors';

export interface ModifierEffect {
  scope: ModifierScope;
  description: string;
  /** Scalar applied to additive adjustments (e.g., +10% gold earned). */
  multiplier?: number;
  /** Flat adjustment applied after multipliers (e.g., +2 reputation per sale). */
  delta?: number;
}

export interface ModifierDefinition {
  id: string;
  label: string;
  description: string;
  effects: readonly ModifierEffect[];
  expiresOnCycle?: number;
}

export interface ModifiersState {
  active: readonly ModifierDefinition[];
}
