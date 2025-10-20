# Global Modifiers Design Note (Phase 0)

## Purpose
Modifiers represent run-wide effects that tune the economy, faction responses, and risk without each feature hard-coding alternative logic. Examples include difficulty levels, seasonal events, and narrative arcs that temporarily adjust player stats.

## Data Model
- `ModifierDefinition`: id, label, description, `effects[]`, optional expiry cycle.
- `ModifierEffect`: scope (`global`, `economy`, `reputation`, `danger`, `inventory`, `visitors`), multiplier, delta.
- Modifiers live in a simple array for now; future phases can index by scope for faster lookups.

## Lifecycle
1. **Activation**: Features dispatch `addModifier` with a definition (e.g., weekly travel choices, event outcomes).
2. **Consumption**: Systems query `useModifiers().active` and filter for relevant scopes when computing deltas.
3. **Expiry**: Future ticking systems will compare `expiresOnCycle` against the global clock and call `removeModifier` or `clearModifiers`.

## Integration Plan
- Phase 1 (timekeeping) will expose cycle counters so modifiers can react to day/week changes.
- Phase 2+ features calculate final values as:
  - `result = (baseValue × productOfMultipliers) + sumOfDeltas`.
  - Helper utilities (to be added in modifiers module) will provide `applyMultipliers(scope, baseValue)` and `sumDeltas(scope)`.
- `GameConfig` can define baseline difficulty presets. Future `config/presets/*` packages will seed modifiers to achieve specific play styles (easy/hardcore/story).

## Guardrails
- Keep modifiers deterministic; avoid randomising inside effect definitions. RNG should live in the consuming feature.
- Avoid silent overrides. If two modifiers adjust the same scope, both effects should stack multiplicatively/additively instead of replacing each other. Features can clamp final values if needed.
- Document modifier sources (events, upgrades, narrative) to help QA reproduce states.

## Deferred Tasks
- Persistence of active modifiers (tie into the persistence provider once implemented).
- Dev tooling to visualise modifiers per scope (likely Phase 3/4 once more systems are online).
- Schema validation and TypeScript helpers for constructing modifiers from JSON or content tooling.
