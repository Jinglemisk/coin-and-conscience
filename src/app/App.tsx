import {
  ConfigProvider,
  FeatureFlagsProvider,
  LoggerProvider,
  ModifiersProvider,
  PersistenceProvider,
  TelemetryProvider
} from './providers';
import { PhaseOneSurface } from '@/features/time/PhaseOneSurface';
import { TimeController } from '@/features/time/TimeController';
import { InventoryController, InventoryDrawer, InventoryEventBridge } from '@/features/inventory';

const PhaseOnePrototype = () => (
  <>
    <TimeController />
    <InventoryController />
    <InventoryEventBridge />
    <PhaseOneSurface />
    <InventoryDrawer />
  </>
);

export const App = () => (
  <ConfigProvider>
    <FeatureFlagsProvider>
      <LoggerProvider>
        <TelemetryProvider>
          <ModifiersProvider>
            <PersistenceProvider>
              <PhaseOnePrototype />
            </PersistenceProvider>
          </ModifiersProvider>
        </TelemetryProvider>
      </LoggerProvider>
    </FeatureFlagsProvider>
  </ConfigProvider>
);
