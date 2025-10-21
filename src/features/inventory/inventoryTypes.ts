import type { ItemTagKey, ItemTagReveal, ItemTagVisibility, ItemTemplate } from '@/data/items';

export type InventoryEventSource = 'manual' | 'restock' | 'reward' | 'consume';

export interface InventoryItemTagState {
  key: ItemTagKey;
  visibility: ItemTagVisibility;
  revealOn?: ItemTagReveal;
  revealedAt?: number;
  revealedBy?: string;
}

export interface InventoryItem {
  instanceId: string;
  templateId: string;
  template: ItemTemplate;
  tags: readonly InventoryItemTagState[];
  addedAt: number;
  source: InventoryEventSource;
}

export interface InventoryAddOptions {
  source?: InventoryEventSource;
  batchId?: string;
}

export interface InventoryRemoveOptions {
  source?: InventoryEventSource;
  reason?: 'consume' | 'discard' | 'sale';
}

export interface InventoryRestockOptions {
  templates?: readonly ItemTemplate[];
  batchId?: string;
  source?: Extract<InventoryEventSource, 'restock' | 'reward'>;
}

export type InventoryMutationFailureReason = 'capacityExceeded' | 'itemNotFound';

export interface InventoryMutationResult {
  success: boolean;
  item?: InventoryItem;
  reason?: InventoryMutationFailureReason;
  weightBefore: number;
  weightAfter: number;
  weightLimit: number;
  source: InventoryEventSource;
  metadata?: Record<string, unknown>;
}

export interface InventoryBatchResult {
  added: readonly InventoryItem[];
  rejected: readonly {
    template: ItemTemplate;
    reason: InventoryMutationFailureReason;
    weightBefore: number;
    weightAfter: number;
  }[];
  batchId?: string;
  source: InventoryEventSource;
}

export interface InventoryTagRevealResult {
  success: boolean;
  item?: InventoryItem;
  tag?: InventoryItemTagState;
  alreadyRevealed: boolean;
  source: string;
}

export interface InventoryStateSnapshot {
  items: readonly InventoryItem[];
  totalWeight: number;
  weightLimit: number;
}

export interface InventoryComputedState {
  totalWeight: number;
  weightLimit: number;
  remainingCapacity: number;
}

export interface InventoryState extends InventoryComputedState {
  items: readonly InventoryItem[];
  restockBatchSize: number;
}
