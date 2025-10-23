import { useEffect } from 'react';
import { useConfigStore } from '@/app/providers';
import { useInventoryStore } from './inventoryStore';

export const InventoryController = () => {
  const syncFromConfig = useInventoryStore((state) => state.syncFromConfig);

  useEffect(() => {
    const unsubscribe = useConfigStore.subscribe(() => {
      syncFromConfig();
    });

    syncFromConfig();

    return unsubscribe;
  }, [syncFromConfig]);

  return null;
};
