⏺ Prerequisites to Finalize Before Phase 3

  Based on the documentation (phases.md:60-65) and current codebase state:

  Core Definitions (Blocking)

  - Faction taxonomy: Define 5-8 factions with alignment values (good/neutral/evil), base
  reputation impacts, and danger modifiers. Need consistent naming and data structure.
  - Satisfaction formula: Lock down the math for:
    - Starting satisfaction value per visitor
    - How price deviation affects satisfaction (linear? exponential curve?)
    - Satisfaction thresholds that trigger different outcomes
    - Conversion formula from satisfaction → reputation/danger deltas
  - Talk interaction specification: Define:
    - Question sets structure (how many questions? categories?)
    - Time cost per talk action (in ticks)
    - How honesty flag influences responses
    - What triggers tag/faction reveals during conversation
  - Visitor spawn cadence: Specify:
    - How many visitors spawn per "day" phase
    - Queue management rules (max queue size, timeout behavior)
    - Skip/dismiss visitor mechanics
    - Spawn rate modifiers based on reputation/danger

  Configuration Values

  - Visitor config section in gameConfig.ts:
    - basePatience - starting patience value
    - baseSatisfaction - starting satisfaction value
    - talkTimeCost - ticks consumed per talk action
    - spawnRatePerPhase - visitors spawned during day phase
  - Reputation thresholds for tier labels/effects (if any)
  - Danger threshold behaviors at warning/critical/gameOver levels

  Data Structures

  - Faction data file location: Decide if src/data/factions/factionCatalog.ts or embedded in
  gameConfig
  - Visitor template schema: Finalize the shape of visitor archetypes (even if specific instances
   created during Phase 3)
