# Coin & Conscience — Development Phases

---

## Phase 0 — Skeleton, parameters, and CI
**Goals:** one-command setup; single source of tunables; repeatable seeds.

**Code:**
- packages/config: parameters.schema.ts, defaults.json5, index.ts  
- packages/utils: rng.ts, math.ts, chance.ts  
- packages/types: time enums, IDs, Item/Visitor/Upgrade/Event skeleton types, GameState shell  
- wiring for Vitest, lint, Turbo caching; CLI stub that prints the seed and exits  

**Done when:** repo installs, typechecks, runs a trivial CLI that reads parameters and emits a seeded random number; CI runs validate-content placeholder.

---

## Phase 1 — Timebox loop and state container (playable “empty day”)
**Goals:** deterministic Morning→Day→Evening→Night and 5-day→weekend loop; no gameplay yet.

**Code:**
- core/src/time/timeline.ts and weekly.ts with scheduler advancing ticks by duration from config  
- core/src/state/gameState.ts with initial GameState and counters (gold=0, rep=0, danger=0, day=1)  
- core/src/index.ts with createGame, step, applyAction signatures and serialization placeholders  
- apps/cli run.ts: advance N ticks and print phase/day changes  

**Done when:** you can run a full week in the CLI, see phases and debrief boundary ticks.

---

## Phase 2 — Inventory and content loader (trade without visitors)
**Goals:** items exist; inventory capacity and value work; content validated at boot.

**Code:**
- packages/schemas: item.schema.ts  
- packages/content: items.yaml and index.ts to load/validate to a registry  
- core/systems/inventory.ts for add/remove, capacity, filters  
- selectors for inventory value and capacity  

**Done when:** CLI can add a few items, respect weight limit, and compute inventory value; unit tests cover add/remove/overflow.

---

## Phase 3 — Basic buy/sell interaction against static offers (first gold loop)
**Goals:** make and resolve a sale with formulas but without visitors yet.

**Code:**
- packages/types/economy.ts for formula params  
- core/systems/economy.ts: reserve price, acceptance probability, margin  
- core/state/reducers.ts: actions buyItemFromStock, sellItemFromStock; queue deltas for gold only  
- tests/engine.economy.spec.ts: verify formula math deterministically  

**Done when:** CLI script completes one day with 1–2 sales and prints gold delta and a debrief summary.

---

## Phase 4 — Visitors v1: archetype, need, honesty; rep/danger effects
**Goals:** procedurally generate a visitor with faction, need, honesty; apply rep/danger deltas at debrief.

**Code:**
- packages/schemas: visitor.schema.ts  
- packages/content: visitors.yaml with a handful of archetypes and simple talk lines  
- core/systems/visitors.ts: generator from archetypes with honesty rules  
- core/systems/reputation.ts and danger.ts: compute queued deltas from interaction outcome; daily decay in effects.ts  
- reducers for startInteraction, resolveInteraction, refuseInteraction  
- tests/progression.weekly.spec.ts to assert debrief deltas apply once per day  

**Done when:** a loop of “spawn visitor → buy/sell/refuse → debrief applies gold/rep/danger” works headless.

---

## Phase 5 — Haggling mini-loop and satisfaction
**Goals:** three-round haggle with patience; acceptance odds change; satisfaction influences rep/danger.

**Code:**
- packages/types: Satisfaction, Patience, Tolerance traits  
- core/systems/interactions.ts: haggle rounds; final accepted price or walk-away  
- apps/web: machines/haggle.machine.ts to drive UI later; for now, CLI presets low/med/high/extreme  
- tests for acceptance curves, patience drain, and satisfaction-to-deltas mapping  

**Done when:** you can complete haggles in CLI; rep/danger vary with outcome severity.

---

## Phase 6 — Weekly restock and permanent upgrades
**Goals:** restock screen logic; wages; party size; permanent upgrades adjusting params.

**Code:**
- packages/schemas: upgrade.schema.ts  
- packages/content: upgrades.yaml  
- core/systems/upgrades.ts: apply daily vs permanent effects; modifiers.ts to compute effective parameters  
- core/state/reducers: buyUpgrade, payWages; hooks in weekly.ts to open restock window  

**Done when:** after day 5 the weekend restock happens; buying a Quartermaster affects next week’s restock prices; wages deduct gold at Evening.

---

## Phase 7 — Events v1: threshold and random events, resolution queue
**Goals:** minimal event engine; triggers on rep/danger thresholds and weekly random roll.

**Code:**
- packages/schemas: event.schema.ts  
- packages/content: events.yaml (fine, reward, theft attempt)  
- core/systems/events.ts: evaluate triggers, enqueue, resolve at Night/Evening  
- reducers: resolveEvent; tests for trigger correctness and one-shot resolution  

**Done when:** you can hit a threshold and see an event resolve at the right phase.

---

## Phase 8 — Web UI vertical slice
**Goals:** one-screen playthrough for a day with real engine; minimal art; deterministic via seed.

**Code:**
- apps/web: useEngine hook; StatsBar, InventoryPanel, VisitorPanel, InteractionPanel; dayCycle.machine.ts  
- DebriefModal and EventToast for queued deltas and events  
- e2e: shop.spec.ts runs a day, buys/sells once, confirms debrief deltas match engine  

**Done when:** you can start a run with a seed, play one or two visitors, see deltas at debrief, and restock on weekend.

---

## Phase 9 — Save/load and migration policy
**Goals:** stable serialization and versioning; forward-compatible saves for future phases.

**Code:**
- core/save/codec.ts and migrations/v1.ts  
- packages/docs/save-format.md  
- tests/serialization.spec.ts: round-trip invariants; graceful fail on incompatible  

**Done when:** a save written mid-day can be reloaded and finishes the same with identical deltas under the same seed.

---

## Phase 10 — Content/balance and sim harness
**Goals:** expand items/visitors/upgrades/events; run batch sims to tune parameters.

**Code:**
- packages/sim: scenarios, CSV/JSON reports for gold/rep/danger, visitor accept rates, run length  
- tooling/validate-content.ts to guard content correctness in CI  

**Done when:** you can run 1,000 seeded sims and produce summary stats; balancing changes happen through config/content only.

---

## Phase 11 — Nice-to-haves and deferred systems
Travel/regions with base rep/danger and local fees; integrate into weekly.ts and travel.regions.ts.  
Deeper event chains and narrative flags.  
Credit/permits/compliance systems that feed heat/inspections.  
Full audio/i18n pass and art replacement.  
Performance profiling and memoization in UI.

---

## Coding Order Inside Each Phase
types → schemas → content loader → core system → reducers/effects → tests → CLI/web glue.

Always thread parameters through systems; never read config directly in reducers.  
Content first, then formulas; stick to data-driven fields even if some are ignored early.

---

## Interfaces to Stub Now
- Actions: discriminated unions that tolerate new variants  
- Event triggers: accept Trigger[]; unrecognized ignored, not fatal  
- Upgrade effects: generic modifier pipeline that composes  

---

## Example Contracts to Implement Early
- createGame(seed: number): GameState  
- step(state: GameState): GameState  
- applyAction(state: GameState, action: GameAction): GameState  
- serialize(state): string  
- deserialize(str): GameState  
