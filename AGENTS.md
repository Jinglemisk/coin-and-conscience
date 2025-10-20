# Repository Guidelines

## Pre-Coding Checklist
- Read `docs/architecture.md`, `docs/specs.md`, and `docs/phases.md` at the start of every session; confirm the phase scope and open questions before coding.
- If a requirement is missing or marked with an `X` placeholder, capture it in task notes and align with design before committing.

## Project Structure & Module Organization
- Runtime entry is `src/app/App.tsx`; providers under `src/app/providers` expose config, flags, logging, telemetry, modifiers, and persistence.
- `config/configTypes.ts` owns every tunable type; `config/gameConfig.ts` supplies defaults and derived helpers. Treat these files as the only authority on gameplay parameters.
- As features unlock, place domain logic in `src/features/<domain>` (player, economy, visitors, etc.) and shared shells in `src/components` to keep responsibilities compartmentalized.
- Update the matching brief in `docs/` whenever behaviour changes; the docs are living contracts that must evolve with the code.

## Config Discipline & Coding Style
- Never introduce ad-hoc constants; extend `configTypes` and `gameConfig`, then consume values via the config store selectors.
- Preserve TypeScript `strict` guarantees and prefer discriminated unions, branded primitives, or utility types over `any`.
- Favour named hooks/selectors over inline store access, and use the `@/` and `#config/` aliases to keep module boundaries clear.

## Build, Verify, and Dead-Code Sweeps
- `npm install` once per clone, `npm run dev` for HMR, `npm run build` for strict compilation before every hand-off, and `npm run preview` for production smoke tests.
- After coding, review touched modules against the three core docs to ensure each export, store field, and config entry is still exercised; prune or ticket anything orphaned to prevent dead code.

## Testing Guidelines
- Automated tests are not yet wired. Rely on `npm run build` for type coverage and document manual scenarios executed through `npm run preview`.
- When tests arrive, colocate `*.test.ts(x)` with the feature and assert provider contracts, config guards, and edge cases anchored in the docs.

## Commit & Collaboration Practices
- Use short, imperative commit titles (e.g., `Wire visitor cadence knobs`) with bodies referencing any synced docs or config updates.
- Hand-off notes should list the feature slice touched, `npm run build` status, manual checks performed, and any outstanding doc deltas.
