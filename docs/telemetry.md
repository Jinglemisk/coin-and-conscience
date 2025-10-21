# Telemetry Contract (Phase 0)

## Summary
The telemetry provider exposes a lightweight event pipeline that mirrors the logging system but is purpose-built for analytics and QA exports. Phase 0 keeps events in-memory or writes them to the console; later phases can register network/file sinks without altering gameplay features.

## API Surface
```ts
import { useTelemetry } from '@/app/providers/telemetry';

const telemetry = useTelemetry();
telemetry.track('time.phase.transition', {
  from: 'morning',
  to: 'day',
  day: 1
}, ['loop']);
```
- `track(name, payload?, tags?)` creates a timestamped event; IDs are auto-generated.
- `emit(event)` accepts a pre-built object (for advanced cases or batched imports).
- `registerSink(fn)` attaches an additional sink and returns an unregister callback.
- `getBuffer()` and `flushBuffer()` allow tooling to read or reset the in-memory store when the `telemetrySink` flag is set to `"memory"`.

## Sink Modes (feature flags)
- `telemetrySink = "console"` (default): log each event to the console.
- `telemetrySink = "memory"`: retain events in-memory and still log to console.
- `telemetrySink = "off"`: suppress console logging though manual sinks still fire.

## Relationship with Logging
- When the `debugLogging` flag is enabled, every telemetry emission also sends a debug log (`logDebug('Telemetry event emitted', …)`). This keeps both pipelines aligned for QA without duplicating instrumentation in features.

## Emission Guidelines
- Emit when state changes cross meaningful boundaries: phase transitions, visitor lifecycle events, transactions, modifier activation, etc.
- Keep payloads small and serialisable; prefer identifiers over full objects.
- Use consistent tags so future dashboards can filter (e.g., `['commerce']`, `['loop']`).
- Phase 1 introduces `time.tick.batch`, `time.phase.transition`, and `time.phase.snapshot` events. These capture loop cadence, boundaries, and global stat snapshots and should be the canonical signals for QA when reviewing time behaviour.

## Future Work Hooks
- A persistence-backed sink (IndexedDB) can be registered once the persistence provider is implemented.
- Build scripts in `/scripts` can read the buffer via `getBuffer()` to produce QA reports.
- Batch/throttling policies can be layered via a custom sink that enqueues events before forwarding to a service.
