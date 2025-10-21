import { create } from 'zustand';
import { useConfigStore } from '@/app/providers';
import type { ItemTagKey, ItemTemplate } from '@/data/items';
import { publishInventoryEvent } from './inventoryEvents';
import type {
  InventoryAddOptions,
  InventoryEventSource,
  InventoryItem,
  InventoryItemTagState,
  InventoryMutationResult,
  InventoryRemoveOptions,
  InventoryState,
  InventoryTagRevealResult
} from './inventoryTypes';

const generateInstanceId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `inventory-${Math.random().toString(36).slice(2)}`;

const instantiateTags = (template: ItemTemplate): readonly InventoryItemTagState[] => {
  const timestamp = Date.now();
  return template.tags.map((tag) => ({
    key: tag.key,
    visibility: tag.visibility,
    revealOn: tag.revealOn,
    revealedAt: tag.visibility === 'revealed' ? timestamp : undefined,
    revealedBy: tag.visibility === 'revealed' ? 'template' : undefined
  }));
};

const instantiateItem = (template: ItemTemplate, source: InventoryEventSource): InventoryItem => ({
  instanceId: generateInstanceId(),
  templateId: template.id,
  template,
  tags: instantiateTags(template),
  addedAt: Date.now(),
  source
});

const clampCapacity = (limit: number, totalWeight: number) => Math.max(0, Number((limit - totalWeight).toFixed(2)));

const configSnapshot = useConfigStore.getState();
const initialWeightLimit = configSnapshot.getInventoryBaseWeightLimit();
const initialRestockBatchSize = configSnapshot.getInventoryRestockBatchSize();

interface InventoryStoreState extends InventoryState {
  addItem: (template: ItemTemplate, options?: InventoryAddOptions) => InventoryMutationResult;
  removeItem: (instanceId: string, options?: InventoryRemoveOptions) => InventoryMutationResult;
  revealTag: (instanceId: string, tagKey: ItemTagKey, source: string) => InventoryTagRevealResult;
  syncFromConfig: () => void;
  reset: () => void;
}

export const useInventoryStore = create<InventoryStoreState>((set, get) => ({
  items: [],
  totalWeight: 0,
  weightLimit: initialWeightLimit,
  remainingCapacity: initialWeightLimit,
  restockBatchSize: initialRestockBatchSize,
  addItem: (template, options) => {
    const state = get();
    const source: InventoryEventSource = options?.source ?? 'manual';
    const weightBefore = state.totalWeight;
    const nextWeight = Number((weightBefore + template.weight).toFixed(2));

    if (nextWeight > state.weightLimit) {
      const rejection = {
        type: 'inventory.itemAddRejected' as const,
        template,
        weightBefore,
        weightAfter: weightBefore,
        weightLimit: state.weightLimit,
        reason: 'capacityExceeded' as const,
        source,
        timestamp: Date.now()
      };
      publishInventoryEvent(rejection);
      return {
        success: false,
        reason: 'capacityExceeded',
        weightBefore,
        weightAfter: weightBefore,
        weightLimit: state.weightLimit,
        source
      };
    }

    const item = instantiateItem(template, source);
    const tagSummary = item.tags.map((tag) => ({
      key: tag.key,
      visibility: tag.visibility,
      revealOn: tag.revealOn
    }));

    const metadata = {
      tagSummary,
      ...(options?.metadata ?? {})
    };

    set((current) => {
      const totalWeight = Number((current.totalWeight + template.weight).toFixed(2));
      return {
        items: [...current.items, item],
        totalWeight,
        remainingCapacity: clampCapacity(current.weightLimit, totalWeight)
      };
    });

    const weightAfter = Number((get().totalWeight).toFixed(2));

    publishInventoryEvent({
      type: 'inventory.itemAdded',
      item,
      weightBefore,
      weightAfter,
      source,
      timestamp: Date.now(),
      metadata
    });

    return {
      success: true,
      item,
      weightBefore,
      weightAfter,
      weightLimit: get().weightLimit,
      source,
      metadata
    };
  },
  removeItem: (instanceId, options) => {
    const state = get();
    const source: InventoryEventSource = options?.source ?? 'manual';
    const target = state.items.find((item) => item.instanceId === instanceId);

    if (!target) {
      publishInventoryEvent({
        type: 'inventory.itemRemoveFailed',
        instanceId,
        reason: 'itemNotFound',
        source,
        timestamp: Date.now()
      });

      return {
        success: false,
        reason: 'itemNotFound',
        weightBefore: state.totalWeight,
        weightAfter: state.totalWeight,
        weightLimit: state.weightLimit,
        source
      };
    }

    const weightBefore = state.totalWeight;
    const weightAfter = Number((weightBefore - target.template.weight).toFixed(2));

    set((current) => {
      const filtered = current.items.filter((item) => item.instanceId !== instanceId);
      return {
        items: filtered,
        totalWeight: weightAfter,
        remainingCapacity: clampCapacity(current.weightLimit, weightAfter)
      };
    });

    publishInventoryEvent({
      type: 'inventory.itemRemoved',
      item: target,
      weightBefore,
      weightAfter,
      source,
      timestamp: Date.now(),
      metadata: options?.reason ? { reason: options.reason } : undefined
    });

    return {
      success: true,
      item: target,
      weightBefore,
      weightAfter,
      weightLimit: get().weightLimit,
      source,
      metadata: options?.reason ? { reason: options.reason } : undefined
    };
  },
  revealTag: (instanceId, tagKey, source) => {
    const state = get();
    const item = state.items.find((entry) => entry.instanceId === instanceId);

    if (!item) {
      return {
        success: false,
        alreadyRevealed: false,
        source
      };
    }

    const tag = item.tags.find((entryTag) => entryTag.key === tagKey);
    if (!tag) {
      return {
        success: false,
        alreadyRevealed: false,
        source
      };
    }

    if (tag.visibility === 'revealed') {
      return {
        success: true,
        item,
        tag,
        alreadyRevealed: true,
        source
      };
    }

    const timestamp = Date.now();
    const nextTag: InventoryItemTagState = {
      ...tag,
      visibility: 'revealed',
      revealedAt: timestamp,
      revealedBy: source
    };

    const nextItem: InventoryItem = {
      ...item,
      tags: item.tags.map((tagState) => (tagState.key === tagKey ? nextTag : tagState))
    };

    set((current) => ({
      items: current.items.map((entry) => (entry.instanceId === instanceId ? nextItem : entry))
    }));

    publishInventoryEvent({
      type: 'inventory.tagRevealed',
      item: nextItem,
      tag: nextTag,
      source,
      timestamp
    });

    return {
      success: true,
      item: nextItem,
      tag: nextTag,
      alreadyRevealed: false,
      source
    };
  },
  syncFromConfig: () => {
    const config = useConfigStore.getState();
    const nextLimit = config.getInventoryBaseWeightLimit();
    const nextBatch = config.getInventoryRestockBatchSize();

    set((current) => ({
      weightLimit: nextLimit,
      restockBatchSize: nextBatch,
      remainingCapacity: clampCapacity(nextLimit, current.totalWeight)
    }));
  },
  reset: () => {
    const config = useConfigStore.getState();
    const weightLimit = config.getInventoryBaseWeightLimit();
    const restockBatchSize = config.getInventoryRestockBatchSize();

    set({
      items: [],
      totalWeight: 0,
      weightLimit,
      restockBatchSize,
      remainingCapacity: weightLimit
    });
  }
}));
