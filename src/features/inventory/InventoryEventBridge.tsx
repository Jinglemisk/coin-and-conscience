import { useEffect } from 'react';
import { useLoggerStore, useTelemetry } from '@/app/providers';
import { useInventoryStore } from './inventoryStore';
import { subscribeToInventoryEvents } from './inventoryEvents';

const INVENTORY_TAGS = ['inventory'] as const;

export const InventoryEventBridge = () => {
  const log = useLoggerStore((state) => state.log);
  const telemetry = useTelemetry();

  useEffect(() => {
    const unsubscribe = subscribeToInventoryEvents((event) => {
      switch (event.type) {
        case 'inventory.itemAdded': {
          const { item, weightBefore, weightAfter, source, metadata } = event;
          log(
            'info',
            'inventory.item.added',
            {
              itemId: item.templateId,
              name: item.template.name,
              source,
              weightBefore,
              weightAfter,
              tagSummary: metadata?.tagSummary ?? [],
              quality: item.template.quality,
              scarcity: item.template.scarcity
            },
            INVENTORY_TAGS
          );
          break;
        }
        case 'inventory.itemAddRejected': {
          const { template, weightBefore, weightLimit, source } = event;
          log(
            'warn',
            'inventory.item.rejected',
            {
              templateId: template.id,
              name: template.name,
              weightBefore,
              weightLimit,
              source,
              reason: event.reason
            },
            INVENTORY_TAGS
          );
          telemetry.track(
            'inventory.capacityExceeded',
            {
              templateId: template.id,
              weightBefore,
              weightLimit,
              source
            },
            INVENTORY_TAGS
          );
          break;
        }
        case 'inventory.itemRemoved': {
          const { item, weightBefore, weightAfter, metadata, source } = event;
          log(
            'info',
            'inventory.item.removed',
            {
              itemId: item.templateId,
              name: item.template.name,
              source,
              weightBefore,
              weightAfter,
              reason: metadata?.reason ?? null
            },
            INVENTORY_TAGS
          );

          if (metadata?.reason === 'consume' || source === 'consume') {
            telemetry.track(
              'inventory.itemConsumed',
              {
                itemId: item.templateId,
                name: item.template.name,
                weightAfter,
                reason: metadata?.reason ?? 'consume'
              },
              INVENTORY_TAGS
            );
          }
          break;
        }
        case 'inventory.itemRemoveFailed': {
          const { instanceId, reason, source } = event;
          log(
            'warn',
            'inventory.item.removeFailed',
            {
              instanceId,
              reason,
              source
            },
            INVENTORY_TAGS
          );
          break;
        }
        case 'inventory.restockCompleted': {
          const { added, rejected, batchId, source } = event;
          const { totalWeight, remainingCapacity } = useInventoryStore.getState();

          log(
            'info',
            'inventory.restock.completed',
            {
              batchId,
              source,
              addedCount: added.length,
              rejectedCount: rejected.length,
              totalWeight,
              remainingCapacity
            },
            INVENTORY_TAGS
          );

          telemetry.track(
            'inventory.restocked',
            {
              batchId,
              source,
              addedCount: added.length,
              rejectedCount: rejected.length,
              totalWeight,
              remainingCapacity
            },
            INVENTORY_TAGS
          );
          break;
        }
        case 'inventory.tagRevealed': {
          const { item, tag } = event;
          log(
            'info',
            'inventory.tag.revealed',
            {
              itemId: item.templateId,
              name: item.template.name,
              tag: tag.key,
              revealedBy: tag.revealedBy ?? 'unknown'
            },
            INVENTORY_TAGS
          );
          telemetry.track(
            'inventory.tagRevealed',
            {
              itemId: item.templateId,
              name: item.template.name,
              tag: tag.key,
              revealedBy: tag.revealedBy ?? 'unknown'
            },
            INVENTORY_TAGS
          );
          break;
        }
        default:
          break;
      }
    });

    return unsubscribe;
  }, [log, telemetry]);

  return null;
};
