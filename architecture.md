# Coin & Conscience — Architecture Draft

## Repository Layout (proposed)
```
coin-and-conscience/ — Planning-only repo placeholder prior to scaffolding the app
├─ config/ — Centralized knobs and schema definitions for tunable gameplay values
│  ├─ gameConfig.ts — Single source of truth for ticks, economy multipliers, and feature flags
│  ├─ configTypes.ts — Type definitions that describe every configurable knob in the game
│  └─ presets/ — Optional alternate config bundles for balancing experiments
├─ src/ — React application source code and feature implementations
│  ├─ app/ — Application shell, providers, and bootstrap composition
│  │  ├─ App.tsx — Root component wiring together global layout and routing stubs
│  │  └─ providers/ — Context/Zustand providers for config, feature flags, logging, telemetry, persistence, and global modifiers
│  ├─ components/ — Shared presentational building blocks reused across features
│  │  ├─ layout/ — Shell pieces like top bar, columns, and scaffolding widgets
│  │  └─ ui/ — Feature-agnostic atoms and molecules (buttons, tooltips, badges)
│  ├─ features/ — Domain folders bundling state, domain logic, and UI per system
│  │  ├─ time/ — Tick engine, day-phase state machine, and cycle hooks
│  │  ├─ visitors/ — Visitor generation, satisfaction logic, and archetype templates
│  │  ├─ commerce/ — Buy/sell/haggling flows, price calculators, and transaction logs
│  │  ├─ meters/ — Reputation, danger, and heat meter management plus incidents
│  │  ├─ restock/ — Weekly restock screens, catalog management, and inventory importers
│  │  └─ upgrades/ — Daily/permanent upgrade flows, recruitment hooks, and effect resolvers
│  ├─ hooks/ — Shared React hooks reused across features (logger taps, persistence)
│  ├─ services/ — Non-UI utilities like persistence adapters, logging pipeline, telemetry
│  ├─ lib/ — Pure helper utilities and formula implementations (pricing, RNG, math)
│  ├─ styles/ — Global styles, tokens, and theming artifacts for the UI
│  └─ index.tsx — Vite entry point bootstrapping the React application
├─ public/ — Static assets served as-is by Vite (manifest, favicon)
├─ assets/ — Game visuals, portraits, audio stubs, and other runtime-loaded media
├─ scripts/ — Node-based tooling for smoke runs, data seeding, and QA exports
├─ docs/ — Living design documents including specs, phases, and architecture notes
│  ├─ specs.md — Original design specification for the project
│  ├─ phases.md — Approved phase roadmap for staged implementation
│  └─ architecture.md — This repo structure draft with commentary
├─ tests/ — Placeholder for future automated test suites and simulation harnesses
├─ package.json — NPM manifest describing dependencies and scripts
├─ tsconfig.json — TypeScript compiler configuration for the project
└─ vite.config.ts — Vite build configuration and plugin wiring
```

Feature-specific Zustand slices live inside their owning `features/*` directories (for example, `features/time/store.ts`) so each domain keeps its logic, state, and UI bundled together. Only cross-cutting state such as config hydration or logging should sit in shared providers under `src/app`.

The shared providers are planned as:
- `configProvider.tsx` and `configStore.ts` — authoritative source for game tuning knobs.
- `featureFlagsProvider.tsx` and `featureFlagsStore.ts` — boolean gates for unfinished systems like haggling or travel.
- `loggerProvider.tsx` — structured console output plus in-memory buffer tap for QA.
- `telemetryProvider.tsx` — runtime metrics/analytics dispatcher with opt-in sinks.
- `persistenceProvider.tsx` — IndexedDB hydration/snapshot coordination across features.
- `modifiersProvider.tsx` — global difficulty or run-wide effect toggles that touch multiple meters at once.

## Current State Snapshot
At present the root contains only `specs.md`, `phases.md`, and `clarifytheseplease.md`, so the tree above serves as a forward-looking scaffold until the Vite project is initialized.
