# Coin & Conscience — Architecture Brief (Phase 1)

## Repository Layout (Phase 1 snapshot)
```
coin-and-conscience/
├─ config/
│  ├─ configTypes.ts         # Shared config + feature flag type system
│  └─ gameConfig.ts          # Canonical tuning values + feature flag registry
├─ src/
│  ├─ app/
│  │  ├─ App.tsx             # Phase 1 prototype surface and provider graph
│  │  └─ providers/
│  │     ├─ config/          # Config store + provider (Zustand)
│  │     ├─ feature-flags/   # Config-driven flag registry + overrides
│  │     ├─ logger/          # Structured logging pipeline (console + buffer)
│  │     ├─ telemetry/       # Telemetry contract + sink routing
│  │     ├─ modifiers/       # Global modifier registry scaffold
│  │     └─ persistence/     # Persistence strategy stub wired to flags
│  ├─ features/
│  │  ├─ time/               # Tick engine, QA controls, HUD surface
│  │  └─ stats/              # Global stats store + phase snapshots
│  └─ main.tsx               # React bootstrap entry
├─ docs/                     # Living documentation (specs, phases, briefs)
├─ index.html                # Vite entry document
├─ package.json              # React + Vite + Zustand toolchain
├─ tsconfig*.json            # TypeScript compiler settings
└─ vite.config.ts            # Vite config with @ / #config aliases
```

`features/time` now owns the simulation loop and UI scaffolding while `features/stats` centralises global meters for later gameplay systems.

## Timekeeping & Tick Strategy
- Global tick rate is defined in `config/gameConfig.ts` (`ticksPerSecond`, `maxTicksPerFrame`, `daysPerWeek`). QA speed controls are also centralised there via `speedMultipliers` and the `defaultSpeedMultiplier` so the loop never depends on ad-hoc constants.
- Conversions (`secondsToTicks`, `ticksToSeconds`, `getPhaseDuration*`, `getDaysPerWeek`) live in the `useConfigStore` derived helpers so later systems (time controller, visitor pacing, economy) fetch consistent math from one place.
- Day phase lengths are stored as seconds in config to keep authoring human-readable; helpers expose both raw seconds and tick equivalents. The time store keeps per-phase tick counts in sync with Vite HMR.
- `features/time/timeStore.ts` holds the authoritative loop state (tick counter, phase, day/week metadata, QA speed selection). A companion `TimeController` component wraps `requestAnimationFrame`, applies the active multiplier, respects pauses, caps work to `maxTicksPerFrame`, and accumulates fractional tick debt so sub-frame timing keeps the loop advancing smoothly.
- The controller emits structured logs (`time.phase.transition`, `time.snapshot.export`) and telemetry events (`time.tick.batch`, `time.phase.transition`, `time.phase.snapshot`) so QA can inspect cadence and boundaries in real time.

- **Config Store (Zustand):** single source of truth for tuning knobs. The store accepts Vite HMR updates by re-importing `gameConfig` and rehydrating derived helpers. Any component or store can consume the same hook without prop-drilling.
- **Feature Flags Store:** consumes the config’s registry, generates defaults, validates overrides, and supports non-boolean flag values (e.g., selecting a telemetry sink or persistence strategy). Flags update reactively with config HMR and can be overridden per provider instance to support QA scenarios.
- **Time Store (`useTimeStore`):** colocated with the loop, tracks ticks, phases, day/week counters, QA speed selection, and exposes `advanceTicks/syncFromConfig` actions. All time-aware features will subscribe here instead of polling config directly.
- **Global Stats Store (`useGlobalStatsStore`):** minimal placeholder for gold/reputation/danger/heat/party size. Each phase transition records an immutable snapshot so future systems (economy, visitors) can compare deltas.
- **Logger Provider:** wraps the structured logging store, merging provider options with feature-flag-driven behaviour. Logs always hit `console.*`; the in-memory buffer is toggled by flag or provider props and exposes size limits for future UI tooling.
- **Telemetry Provider:** exposes a `track/emit` contract, routes to console, buffers events when requested, piggybacks logger debug traces, and supports registering additional sinks (future IndexedDB/export scripts).
- **Modifiers Provider:** maintains a scoped list of active global modifiers. Later systems can query/filter effects without directly mutating each other, keeping difficulty tweaks centralized.
- **Persistence Provider:** stub client with a strategy selector (indexedDb/session/off) driven by feature flags. Real storage hooks will replace the console-log stubs in the persistence phase without altering consumers.

Providers are composed in `App.tsx` in the order: Config → Feature Flags → Logger → Telemetry → Modifiers → Persistence → UI. This top-level composition mirrors the dependency graph (flags need config, logger/telemetry read flags, persistence/modifiers depend on both).

## Persistence Boundaries
- The groundwork from Phase 0 still applies: the `PersistenceClient` stub covers save/load/delete/list and strategy switching. Phase 1 did not introduce storage, but the snapshot export hook in the loop surface is ready to route through future persistence adapters.
- Persistence strategy continues to derive from the `persistenceMode` feature flag, giving QA an immediate way to disable storage when debugging.

## Hot Reload Strategy
- Vite HMR is the default dev workflow.
- `useConfigStore` registers `import.meta.hot.accept` on `gameConfig.ts`. When values change, the store swaps in the new object and recomputes derived helpers; consumers automatically re-render with updated data.
- Feature flags sync through the provider so registry changes (new flags, altered defaults) propagate without restarting dev server.
- Other providers rely on reactive flags/config values, so no additional HMR hooks are required.

## Future System Integration Notes
- Visitor, economy, and event systems will live in isolated `features/*` folders and consume providers via hooks, ensuring each domain can be tested independently.
- The time store should remain the single source of truth for cadence. Downstream systems (visitors, events) should subscribe to `advanceTicks` outputs or derive selectors rather than scheduling their own timers.
- Global modifiers should remain additive/multiplicative scalars surfaced through helper utilities so individual features apply them explicitly (avoiding hidden side-effects).
- Telemetry sinks and persistence adapters are intentionally abstract to allow CLI tooling (e.g., QA export scripts) to hook in without rewriting UI code.
- Bridge into Phase 2: inventory and item systems should consume snapshots via selectors if they need historical day/phase context, and hook global stat adjustments through `useGlobalStatsStore` so the loop UI instantly reflects economy changes.
