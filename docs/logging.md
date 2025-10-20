# Logging Conventions (Phase 0)

## Goals
- Provide a single structured logging API for gameplay systems.
- Always emit to the browser console for quick inspection.
- Optionally retain an in-memory buffer for QA review, controlled by feature flags or provider props.

## Usage
```ts
import { logInfo, logWarn, logError } from '@/app/providers/logger';

logInfo('visitor.transaction.completed', {
  visitorId: data.visitorId,
  itemId: data.itemId,
  goldDelta: data.goldDelta
}, ['commerce']);
```
- `logDebug`, `logInfo`, `logWarn`, and `logError` map to console levels and accept an optional `context` object plus `tags` array.
- Tags should be short nouns (e.g., `['commerce', 'visitor']`) to aid future filtering.
- Context objects should be JSON-serialisable; avoid circular references.

## Buffering
- The `LoggerProvider` enables the buffer by default (max 200 entries). Adjust via provider props: `<LoggerProvider options={{ enableBuffer: false }}>`.
- Feature flags influence behaviour:
  - `telemetrySink = "memory"` forces buffering on (to mirror telemetry debugging).
  - `debugLogging` adds a `debug` tag automatically.
- Accessing the buffer directly is planned for a Phase 1/2 QA panel. Until then, use `useLoggerStore(state => state.buffer)` in dev-only utilities.

## Structured Event Naming
- Use dot-separated domains: `system.domain.action`.
- Examples: `time.phase.transition`, `inventory.restock.complete`, `visitor.haggle.failed`.
- The first segment should match a feature folder when possible, helping cross-reference code paths.

## When to Log
- Phase 0 expects logs for:
  - Phase transitions (once implemented in Phase 1).
  - Inventory and commerce actions (Phase 2+).
  - World events and modifiers (future phases).
- Avoid excessive per-tick logs; prefer lifecycle hooks (phase boundary, visitor arrival, transaction completion).

## Extensibility
- Later phases can add sinks by calling `useLoggerStore.getState().log` or composing within a new provider. Keep log creation centralised in feature-specific helper functions to ensure consistent formatting.
