import type {
  InventoryBatchResult,
  InventoryEventSource,
  InventoryItem,
  InventoryItemTagState,
  InventoryMutationFailureReason
} from './inventoryTypes';
import type { ItemTemplate } from '@/data/items';

export type InventoryEvent =
  | {
      type: 'inventory.itemAdded';
      item: InventoryItem;
      weightBefore: number;
      weightAfter: number;
      source: InventoryEventSource;
      timestamp: number;
      metadata?: Record<string, unknown>;
    }
  | {
      type: 'inventory.itemAddRejected';
      template: ItemTemplate;
      weightBefore: number;
      weightAfter: number;
      weightLimit: number;
      reason: InventoryMutationFailureReason;
      source: InventoryEventSource;
      timestamp: number;
    }
  | {
      type: 'inventory.itemRemoved';
      item: InventoryItem;
      weightBefore: number;
      weightAfter: number;
      source: InventoryEventSource;
      timestamp: number;
      metadata?: Record<string, unknown>;
    }
  | {
      type: 'inventory.itemRemoveFailed';
      instanceId: string;
      reason: InventoryMutationFailureReason;
      source: InventoryEventSource;
      timestamp: number;
    }
  | ({
      type: 'inventory.restockCompleted';
      timestamp: number;
    } & InventoryBatchResult)
  | {
      type: 'inventory.tagRevealed';
      item: InventoryItem;
      tag: InventoryItemTagState;
      source: string;
      timestamp: number;
    };

export type InventoryEventListener = (event: InventoryEvent) => void;

const listeners = new Set<InventoryEventListener>();

export const publishInventoryEvent = (event: InventoryEvent) => {
  listeners.forEach((listener) => listener(event));
};

export const subscribeToInventoryEvents = (listener: InventoryEventListener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
