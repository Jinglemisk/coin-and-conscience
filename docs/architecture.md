# Coin & Conscience — Architecture Brief (Phase 0)

## Repository Layout (phase 0 snapshot)
```
coin-and-conscience/
├─ config/
│  ├─ configTypes.ts         # Shared config + feature flag type system
│  └─ gameConfig.ts          # Canonical tuning values + feature flag registry
├─ src/
│  ├─ app/
│  │  ├─ App.tsx             # Phase 0 prototype surface and provider graph
│  │  └─ providers/
│  │     ├─ config/          # Config store + provider (Zustand)
│  │     ├─ feature-flags/   # Config-driven flag registry + overrides
│  │     ├─ logger/          # Structured logging pipeline (console + buffer)
│  │     ├─ telemetry/       # Telemetry contract + sink routing
│  │     ├─ modifiers/       # Global modifier registry scaffold
│  │     └─ persistence/     # Persistence strategy stub wired to flags
│  └─ main.tsx               # React bootstrap entry
├─ docs/                     # Living documentation (specs, phases, briefs)
├─ index.html                # Vite entry document
├─ package.json              # React + Vite + Zustand toolchain
├─ tsconfig*.json            # TypeScript compiler settings
└─ vite.config.ts            # Vite config with @ / #config aliases
```
`features/`, `components/`, and other gameplay-focused folders will be introduced in later phases once loop mechanics are implemented.

## Timekeeping & Tick Strategy
- Global tick rate is defined in `config/gameConfig.ts` (`ticksPerSecond`, `maxTicksPerFrame`).
- Conversions (`secondsToTicks`, `ticksToSeconds`, `getPhaseDuration*`) live in the `useConfigStore` derived helpers so later systems (time controller, visitor pacing, economy) fetch consistent math from one place.
- Day phase lengths are stored as seconds in config to keep authoring human-readable; helpers expose both raw seconds and tick equivalents.

## State Layers & Provider Graph
- **Config Store (Zustand):** single source of truth for tuning knobs. The store accepts Vite HMR updates by re-importing `gameConfig` and rehydrating derived helpers. Any component or store can consume the same hook without prop-drilling.
- **Feature Flags Store:** consumes the config’s registry, generates defaults, validates overrides, and supports non-boolean flag values (e.g., selecting a telemetry sink or persistence strategy). Flags update reactively with config HMR and can be overridden per provider instance to support QA scenarios.
- **Logger Provider:** wraps the structured logging store, merging provider options with feature-flag-driven behaviour. Logs always hit `console.*`; the in-memory buffer is toggled by flag or provider props and exposes size limits for future UI tooling.
- **Telemetry Provider:** exposes a `track/emit` contract, routes to console, buffers events when requested, piggybacks logger debug traces, and supports registering additional sinks (future IndexedDB/export scripts).
- **Modifiers Provider:** maintains a scoped list of active global modifiers. Later systems can query/filter effects without directly mutating each other, keeping difficulty tweaks centralized.
- **Persistence Provider:** stub client with a strategy selector (indexedDb/session/off) driven by feature flags. Real storage hooks will replace the console-log stubs in the persistence phase without altering consumers.

Providers are composed in `App.tsx` in the order: Config → Feature Flags → Logger → Telemetry → Modifiers → Persistence → UI. This top-level composition mirrors the dependency graph (flags need config, logger/telemetry read flags, persistence/modifiers depend on both).

## Persistence Boundaries
- Phase 0 defers actual storage but defines an interface (`PersistenceClient`) covering save/load/delete/list and strategy switching. Later implementations can plug in IndexedDB without changing callers.
- Persistence strategy is derived from the `persistenceMode` feature flag, giving QA an immediate way to disable storage when debugging.

## Hot Reload Strategy
- Vite HMR is the default dev workflow.
- `useConfigStore` registers `import.meta.hot.accept` on `gameConfig.ts`. When values change, the store swaps in the new object and recomputes derived helpers; consumers automatically re-render with updated data.
- Feature flags sync through the provider so registry changes (new flags, altered defaults) propagate without restarting dev server.
- Other providers rely on reactive flags/config values, so no additional HMR hooks are required.

## Future System Integration Notes
- Phase 1 will introduce the tick engine inside `features/time`. It should depend on `useConfigStore` helpers for cadence rather than hard-coded constants.
- Visitor, economy, and event systems will live in isolated `features/*` folders and consume providers via hooks, ensuring each domain can be tested independently.
- Global modifiers should remain additive/multiplicative scalars surfaced through helper utilities so individual features apply them explicitly (avoiding hidden side-effects).
- Telemetry sinks and persistence adapters are intentionally abstract to allow CLI tooling (e.g., QA export scripts) to hook in without rewriting UI code.
