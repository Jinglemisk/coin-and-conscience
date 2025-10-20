# Coin & Conscience — Phase Plan

## Phase 0 – Foundations & Param Strategy
**Status:** Complete. Core configuration, provider scaffolding, and documentation are in place to unblock the simulation loop.

**What was delivered**
- Architecture brief updated with timekeeping, provider graph, persistence boundaries, and HMR approach (`docs/architecture.md`).
- Config types + defaults defining ticks, phase durations, economy/tax scalars, danger thresholds, and feature flag registry (`config/configTypes.ts`, `config/gameConfig.ts`).
- Hot-reload-aware config slice and derived helpers (`src/app/providers/config/configStore.ts`, `ConfigProvider.tsx`).
- Feature flag schema supporting multi-value toggles with registry sync + overrides (`src/app/providers/feature-flags/*`).
- Structured logging pipeline with guidelines and optional buffer (`src/app/providers/logger/*`, `docs/logging.md`).
- Telemetry contract + sink routing with usage doc (`src/app/providers/telemetry/*`, `docs/telemetry.md`).
- Global modifiers scaffold and design note for run-wide effects (`src/app/providers/modifiers/*`, `docs/modifiers.md`).
- Persistence client stub wired to feature flag strategy selection (`src/app/providers/persistence/*`).
- Tech notes capturing outstanding design decisions (`docs/tech-notes.md`).

**How to run / verify**
- Install dependencies then run `npm run dev` to launch the Vite prototype. Adjust values in `config/gameConfig.ts` or flip flags via `useFeatureFlagsStore().setFlag` in the dev console; the UI reflects updates immediately thanks to Vite HMR hooks.
- Use the "Emit sample log & telemetry" button in the placeholder UI (`src/app/App.tsx`) to see logger and telemetry pipelines working together.

**Leading into Phase 1**
- Time controller will live under `src/features/time/`, consuming `useConfigStore` for tick cadence.
- Phase/state telemetry should reuse `useTelemetry().track` and existing logging helpers.
- Reference outstanding questions in `docs/tech-notes.md` before locking satisfaction, danger, and tax formulas.

## Phase 1 – Core Timekeeping & Loop Skeleton
- **Goals:** Make the simulation tick in real time with QA-friendly observability.
- **Deliverables:**
  - Time controller that advances ticks from `gameConfig`.
  - Day-phase state machine (Morning/Day/Evening/Night) with transitions driven purely by ticks and logging at phase boundaries.
  - Global logger utility (structured console output + in-memory buffer) and snapshot export command.
  - Minimal Zustand stores for global stats (gold, reputation placeholder, danger placeholder, heat placeholder) with per-phase snapshots.
  - Basic wireframe view showing phase, tick, day counter, and top-bar stats (gold/reputation/danger/heat/party size).
  - Telemetry hooks on phase transitions and tick cadence so QA can trace loop performance via the shared provider.
- **Exit Criteria:** Time flows correctly; phase boundaries fire events; telemetry and logs capture transitions so developers can review per-tick/per-phase data.

## Phase 2 – Inventory & Item Schema
- **Goals:** Establish the data structures for items and inventory management.
- **Deliverables:**
  - Item model/types, including categories, tags (illegal, cursed), base price, weight, scarcity, and quality.
  - Inventory store with add/remove, weight limits, and config-driven capacities/restock quantities.
  - Simple UI list for inventory with placeholders and tag indicators.
  - Logging of inventory actions (restock, consume) including tag metadata.
- **Exit Criteria:** Can seed inventory, view items, enforce capacity, flag tagged items, and trace actions in logs.

## Phase 3 – Visitor Framework & Single Archetype
- **Goals:** Build the visitor pipeline with one generic buyer while wiring in satisfaction/honesty scaffolding.
- **Deliverables:**
  - Visitor model (id, display name, appearance placeholder, faction placeholder, honesty flag, satisfaction meter, need template, patience).
  - Queue/arrival manager responding to day phases and config cadence.
  - Interaction panel with stubbed actions (`Talk`, `Buy`, `Refuse`) logging every choice and satisfaction/relationship deltas.
  - Config knobs for visitor cadence, patience drain, base satisfaction adjustments, and talk time costs.
  - QA checklist: load visitor, talk, sell single item, refuse; verify satisfaction impacts logs.
- **Exit Criteria:** Single generic visitor enters during Day, player can interact, satisfaction reacts to actions, and logs show full conversation with honesty flag.

## Phase 4 – Buy/Sell Transaction Loop
- **Goals:** Enable core commerce without haggling, including satisfaction consequences.
- **Deliverables:**
  - Pricing calc using config (markup/markdown multipliers, taxes placeholders, faction modifiers stubbed).
  - Transaction validation (inventory availability, gold adjustments) plus satisfaction adjustments based on price vs base value.
  - Audit log entry per transaction (timestamp, visitor, item, gold delta, satisfaction delta, tags involved).
  - UI confirmation flow for buying and selling; refusal workflow updates satisfaction immediately.
  - Smoke script to simulate a day and export transaction log with satisfaction history.
  - Integration with `modifiersProvider` so global difficulty toggles influence pricing/danger deltas without bypassing feature boundaries.
- **Exit Criteria:** Player can buy from and sell to visitor; gold/inventory adjust correctly; satisfaction feeds into post-visit evaluation; each transaction recorded with tag context; global modifiers influence results when toggled.

## Phase 5 – Daily Wrap-up, Wages & Persistence
- **Goals:** Close the day properly, handle economic sinks, and retain progress.
- **Deliverables:**
  - End-of-day summary screen (gold earnings, wages, local lord tax placeholder, pending events placeholder).
  - Wages and local lord tithe deductions driven by config; logs note reasoning and amounts.
  - IndexedDB persistence storing config version, player stats, inventory, visitor seed, outstanding modifiers, and feature flag states via the shared provider.
  - `persistenceProvider` orchestration that snapshots stores on wrap-up and hydrates them on load, with logging/telemetry of outcomes and mismatch detection if config changes.
  - QA recipe for wiping/retaining saves and verifying deductions.
- **Exit Criteria:** Day cycle resets cleanly; state survives reload through the shared persistence provider; gold sinks (wages/taxes) fire at correct phase; logs and telemetry show checkpoints.

## Phase 6 – Reputation, Danger & Incident Baseline
- **Goals:** Implement first pass of key meters with concrete consequences.
- **Deliverables:**
  - Config-driven thresholds and deltas for reputation/danger reactions to buy/sell/refuse, satisfaction tiers, and tag modifiers (illegal/cursed).
  - Zustand slice with derived states (reputation tier labels, danger warnings) and helper selectors.
  - Incident system for danger thresholds (shoplifting/robbery attempts) with simple resolution UI; locked behind config toggles.
  - Logging entries capturing cause/effect for every meter change and incident trigger.
  - Documentation of open questions for faction influence on meters.
- **Exit Criteria:** Reputation and danger respond deterministically; incidents trigger at danger thresholds; logs trace every change and incident; refusal outcome drains satisfaction and meters properly.

## Phase 7 – Weekly Cycle, Heat & Restock Loop
- **Goals:** Extend the time model to weeks, add the foundational heat meter, and enable scheduled supply refresh.
- **Deliverables:**
  - Week/day counter using config durations; weekend state unlocks additional actions.
  - Restock screen unlocked after Day 5; purchase flow adds to inventory respecting capacity and tags (flagged in logs).
  - Heat meter implementation based on rules of illegal/cursed transactions and tax compliance; weekly decay/mitigation knobs in config.
  - Logging/performance checks around week rollover, including heat/hearings summary.
  - Persistence updates to capture week history, heat, and restock records.
- **Exit Criteria:** Weekends trigger restock mode; heat updates alongside danger; inventory updates recorded; logs show week transitions, taxes, and heat adjustments.

## Phase 8 – Party, Recruitment & Upgrades Foundations
- **Goals:** Introduce support systems, visitor-driven recruitment, and core upgrades.
- **Deliverables:**
  - Party member schema (role, effects, upkeep cost) with storage in state and persistence.
  - Visitor recruitment path using satisfaction thresholds (Recruitment Need) that adds party members or daily hires.
  - Party management UI stubbed into side panel with active effects summary.
  - Daily/permanent upgrade lists with config-driven effects (inventory cap +10, danger incident mitigation, guards reducing heat/danger).
  - Logging for recruitment attempts, upgrade purchases, and party hires (including satisfaction preconditions).
- **Exit Criteria:** Player can hire via visitors or upgrades; upgrades alter existing systems (capacity, danger incident mitigation, guards reducing heat/danger); actions auditable.

## Phase 9 – Factions, Reputation/Danger Deep Dive & Event Hooks
- **Goals:** Expand the social risk layer with faction nuance and event scaffolding.
- **Deliverables:**
  - Faction data model (alignment, base reputation impact, danger modifiers, heat modifiers) and visitor generation infused with faction/honesty sets.
  - Detailed formulas for meter changes by visitor archetype and item tags, plus blocked interactions if satisfaction collapses.
  - Event trigger scaffolding keyed to meter thresholds, cursed/illegal item flags, weekly rolls, and faction states; simple warning/boon events firing with logging.
  - Config sections for tuning faction weights, event probabilities, and heat/danger interactions.
  - Observability upgrade: meter history export (CSV/JSON) or sparkline component for QA.
- **Exit Criteria:** Faction-aware visitors affect reputation/danger/heat; events trigger from items and thresholds; design gaps documented for richer narrative events.

## Phase 10 – Haggling System
- **Goals:** Layer in negotiation once base economy is stable.
- **Deliverables:**
  - Haggling rounds logic (patience, modifiers, faction tolerance) aligned with earlier formulas.
  - UI for selecting preset offers; acceptance feedback tied to satisfaction and heat/danger deltas.
  - Config tables for tolerance, elasticity, patience by archetype; logging capturing each round (offer, roll, outcome).
- **Exit Criteria:** Haggling integrates with buy/sell, satisfaction, and meters without regressions; logs capture full negotiation trails.

## Phase 11 – Regions, Travel & World Progression
- **Goals:** Introduce spatial progression and region-specific modifiers.
- **Deliverables:**
  - Region data (base reputation/danger/heat modifiers, travel costs, local lord taxes) defined via config.
  - Travel screen unlocked during rest week; region switching affecting visitors, events, and baseline meters.
  - Logging for travel decisions, costs, and region shifts; persistence storing region history.
- **Exit Criteria:** Player can travel between regions; systems respond appropriately (new tax rates, visitor pools); logs document transitions.

## Phase 12 – Polish, Content & Analytics
- **Goals:** Improve UX, content breadth, and QA tooling.
- **Deliverables:**
  - Placeholder visuals replaced with improved layout/art direction guidance.
  - Additional visitor archetypes with unique needs, factions, and recruitment hooks.
  - Expanded event pool, narrative text, and incident variations (shoplifting outcomes, inspections).
  - QA dashboard exporting session summaries (config snapshot, key metrics, incident/event logs).
  - Performance pass and bug triage.
- **Exit Criteria:** Stable hobby-ready build with traceable logs, content variety, and smoother UX.

## Deferred / Future Considerations
- Advanced faction politics, narrative arcs, complex AI visitors, multi-region storylines.
- Deeper economy modeling (market fluctuations, credit systems, dynamic supply/demand).
- Automated tests beyond exploratory QA (leave hooks for future harnesses).
- Accessibility and localization planning once content stabilizes.
