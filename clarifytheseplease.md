🚨 CRITICAL MISSING MECHANICS

  1. Talk System (MAJOR GAP)

  - WHAT'S MISSING: The entire Talk mechanic is mentioned but not defined
    - How does talking work? Is it multiple choice? Free text? Preset questions?
    - What information is revealed? (Faction hints? Honesty indicators? Background lore?)
    - Does talking consume time? How much?
    - How many talk actions per visitor?
    - How do you mechanically deduce faction from talk responses?
    - What's the signal-to-noise ratio for dishonest visitors?

  2. Time Pressure System (CRITICALLY VAGUE)

  - UNCLEAR: "All phases last a certain duration" but NO specifics:
    - How many seconds per phase? (Morning/Day/Evening/Night)
    - How many visitors can appear during Day phase?
    - Do visitors queue or come sequentially?
    - What happens if time expires mid-interaction?
    - Does haggling consume time? How much per round?
    - Can you serve multiple visitors simultaneously?
    - Is there a pause button?

  3. Visitor Spawning Logic (NOT SPECIFIED)

  - How many visitors per day phase?
  - What determines the faction distribution?
  - Does Reputation affect who shows up?
  - Does Danger affect spawn rates/types?
  - Can you skip/dismiss visitors before interacting?
  - Is there RNG or deterministic patterns?

  4. Restock Phase Mechanics (VERY THIN)

  - WHERE do you buy items? (NPC vendor? Market menu? Fixed shop?)
  - What determines available inventory?
  - Are items limited per week?
  - Do prices fluctuate based on Reputation/Danger/Region?
  - Can you sell items during restock or only buy?
  - How many "restock actions" do you get?

  5. Faction System (CORE CONCEPT, BARELY DEFINED)

  - How many factions exist? (Archetypes listed, but are those factions?)
  - What are faction relationships? (Do Knights hate Cultists?)
  - Is Reputation global or per-faction?
  - Do factions have opposing mechanics? (serving one angers another?)
  - How do factions map to the -100/+100 Reputation scale?
  - What's the difference between archetype (Adventurer, Noble) and faction?

  6. Party Management (EXTREMELY VAGUE)

  - How do you hire party members? (Through recruitment interactions only?)
  - Do party members have names, personalities, individual stats?
  - What happens if you can't pay wages? (They leave? Loyalty drops? Game over?)
  - Can party members die, quit, or be fired?
  - Active vs. passive party slots?
  - Do different party types cost different wages?

  7. Satisfaction → Rep/Danger Conversion (UNCLEAR)

  - Satisfaction mentioned but:
    - Starting value? (50? 100?)
    - How much does haggling decrease it per round?
    - What are the threshold breakpoints? (>80 = good, <20 = bad?)
    - Formula for converting satisfaction + faction → rep/danger deltas?

  8. Item Tag Discovery (INCOMPLETE)

  - Items can have hidden tags ("???")
  - HOW do you reveal them?
    - Does Appraiser reveal tags?
    - Does Bard reveal tags or just honesty?
    - Can visitors lie about item properties?
    - What if you sell Illegal/Cursed items unknowingly?

  9. Shoplifting/Robbery Mechanics (MENTIONED, NOT SPECIFIED)

  - When does it trigger? (Random roll based on Danger?)
  - Is it preventable? (Guards reduce chance?)
  - What do you lose? (Random items? Gold?)
  - Is there a mini-game or just automatic loss?
  - Can you catch thieves?

  🤔 MECHANICS NEEDING CLARIFICATION

  10. Reputation System Confusion (TWO MODELS PRESENTED)

  - specs.md:198 shows Reputation as -100 to +100 (evil↔good alignment)
  - specs.md:182-196 shows "Option 2: Popularity vs Chaos" system
  - WHICH ONE? Are you using alignment or popularity?
  - Or is Reputation = Popularity and Danger = Chaos?
  - The two models have different implications

  11. Honesty System Logic (POSSIBLY BACKWARDS)

  - specs.md:139 says: "If they are honest, they are generated from any other random Faction's set"
  - This seems backwards — shouldn't DIS-honest people disguise as other factions?
  - Need clarification on honest vs. dishonest generation logic

  12. "Need" Types (INCOMPLETE)

  - spec.md:128 says "Buy or Sell an Item, or something else"
  - What's "something else"?
  - Recruitment? Quest? Information? Flavor?
  - Can visitors have multiple needs?
  - What if you don't have the specific item they want?

  13. Phase Purpose Confusion

  - Morning: "Prepare shop" → buy daily upgrade... anything else? Just a shop menu?
  - Evening: "Pay wages, resolve events" → Is this automatic or interactive?
  - Night: "Sleep, resolve events" → Why separate from Evening? Just narrative transition?
  - Is there gameplay in Morning/Evening/Night or just automation?

  14. Upgrade Stacking (UNCLEAR)

  - Daily Guard vs. Permanent Guard — do they stack?
  - Can you buy multiple Daily Guards in one morning?
  - If you buy Permanent Guard, does Daily Guard still have value?
  - Are upgrades unique or repeatable purchases?

  15. "Interaction Speed" (UNDEFINED EFFECT)

  - Hands increase "Interaction Speed" but:
  - What does this mean? Faster haggling animations? More visitors per day? Time bonus?
  - How is this quantified?

  16. Local Lord Tax (MENTIONED, NOT EXPLAINED)

  - specs.md:72 mentions "Pays the Local Lord"
  - Who is this? Mandatory tax? How much? How often?
  - Related to deferred Region system?

  17. Party vs. Party Size Terminology (CONFUSING)

  - Upgrades say "+1 Party"
  - Stats say "Party Size"
  - Are these the same? Or current count vs. max capacity?

  18. Item "Base Price" vs. "Cost" (UNCLEAR)

  - Items have "Base Price"
  - Formulas use "cost" and "asked_price"
  - Is "cost" what YOU paid during restock?
  - Is this tracked per item instance?
  - How does this work with procedurally generated offers?

  19. Refusal Consequences (INCOMPLETE)

  - Refusal drops Satisfaction to 0
  - But what's the Reputation penalty formula?
  - Does visitor faction matter?
  - specs.md:77 mentions rep lost by refusing but gives no numbers

  20. Event Timing (AMBIGUOUS)

  - "Events can trigger during Day or Night"
  - Can they interrupt active interactions?
  - Are they queued until phase end?
  - What's the difference between "latent" and immediate events?

  21. Appraiser Wording (CONFUSING)

  - "increases/decreases Base Prices for selling/buying to Visitors by 5%/10%/15%"
  - Does this mean:
    - You sell for MORE (good) and buy for LESS (good)? ← Likely intended
    - Or literally increase/decrease in opposite directions?

  22. Scout & Locked Chest (INCOMPLETE ENTRIES)

  - Scout: "+1 Party, ….." ← Effect missing
  - Locked Chest: "Reduces shoplifting chance…" ← By how much?

  🎨 UI/GAMEPLAY FLOW GAPS

  23. Credit System (UI MENTIONS, NO MECHANIC)

  - specs.md:242 mentions "credit toggle"
  - What does offering credit do?
  - Do nobles pay later? Default risk? Reputation benefit?
  - Is this a Phase 11 feature or core?

  24. Permits/Heat System (FORMULAS EXIST, NO EXPLANATION)

  - Formulas mention "heat_delta", "permits_level", "compliance_spend"
  - But core specs don't explain what permits are
  - Is this deferred to Phase 11 or should be in core?

  25. Hesitation/Contradiction Cues (UI MENTIONED, NO MECHANIC)

  - specs.md:242 mentions "cues like hesitation or contradictions" in dialogue
  - How are these generated?
  - Tied to Honesty stat?
  - Actionable or just flavor?

  26. Rumor Ticker (UI ELEMENT WITHOUT MECHANIC)

  - "rumor ticker with qualitative hints about world state"
  - What world state? Global Danger? Regional events?
  - Is this actionable intelligence or flavor?

  📊 ECONOMY & BALANCE GAPS

  27. Formula Constants (ALL MISSING)

  - Formulas use: kD, kH, kT, kP, dG, dT, elasticity, tolerance
  - NO VALUES PROVIDED
  - Should these be in config?
  - Will Phase 10 simulation tune these?

  28. Scarcity & Quality (MENTIONED, NOT DEFINED)

  - Reserve price uses "scarcity_multiplier" and "quality_factor"
  - What creates scarcity? (Rarity tier? Supply/demand?)
  - Do items have quality levels? (Common/Rare/Legendary?)

  29. Typical Margins (NO GUIDANCE)

  - What's a reasonable profit margin? 10%? 50%? 200%?
  - What margin triggers visitor anger?
  - What's the risk/reward curve?

  30. Wage Amounts (NOT SPECIFIED)

  - How much does each party type cost?
  - Fixed or scaling with Reputation/Day count?
  - Can wages bankrupt you?

  🎯 GAME DESIGN PHILOSOPHY GAPS

  31. Victory Conditions (MISSING)

  - Game has "survive as many days as possible"
  - But no "win" state or score system
  - Is this endless survival? Campaign with ending?
  - How do players compare runs?

  32. Game Over Conditions (INCOMPLETE)

  - Danger = 100 → game over (specified)
  - Gold = 0 → game over? (not mentioned)
  - Can't pay wages → game over? (not mentioned)
  - Other fail states?

  33. Difficulty Curve (NOT ADDRESSED)

  - Do days get harder? More dangerous factions? Higher wages?
  - Or does player power scale faster (feedback loop risk)?
  - How to avoid death spiral?

  34. Player Agency (REACTIVE DESIGN)

  - Most gameplay is reacting to visitors who come to YOU
  - Where's the proactive decision-making?
  - Can you choose which visitors to attract (ads, reputation management)?

  35. Tutorial/Onboarding (NOT MENTIONED)

  - Complex interconnected systems
  - How do new players learn?
  - Guided first day? Tooltips? Help screens?

  📝 CONTENT GAPS

  36. Actual Faction List (MISSING)

  - Visitor archetypes shown (Adventurer, Bandit, Noble...)
  - But unclear if these ARE the factions or examples
  - Need clear faction taxonomy with morality alignment

  37. Item Content Scope (UNDEFINED)

  - Categories listed, but how many items per category?
  - Need variety for replayability
  - Tag distribution (how many Illegal items? Cursed?)

  38. Dialogue Content Scope (NO EXAMPLES)

  - Talk system needs dialogue
  - Procedural generation or hand-written?
  - How many lines per faction/honesty combo?

  39. Event Content Scope (VERY SPARSE)

  - Minimal event examples
  - Need variety for different Rep/Danger thresholds
  - Event chains? Narrative flags?

  🏗️ TECHNICAL IMPLEMENTATION QUESTIONS

  40. Determinism with Real-Time Gameplay (TENSION)

  - phases.md emphasizes seeded RNG for determinism
  - But real-time phases with user timing creates non-determinism
  - How to reconcile? Tick-based time? Replay system?

  41. Zustand + Determinism (POTENTIAL CONFLICT)

  - Zustand is mentioned for state
  - But phases.md requires serializable, deterministic GameState
  - Should core engine be separate from Zustand UI layer?

  42. IndexedDB Usage (UNCLEAR)

  - IndexedDB mentioned but:
  - Just for saves? Or content caching? Game state?
  - Performance implications for frequent reads?

  43. Content Format (PARTIALLY SPECIFIED)

  - phases.md shows YAML for content
  - But how much is procedural vs. static?
  - Are visitors procedurally generated or pre-authored?

  ---
  🎯 RECOMMENDATIONS

  Before Phase 1 starts, you MUST define:
  1. Talk system mechanics (most critical)
  2. Phase duration timings
  3. Visitor spawning logic
  4. Faction list and morality mapping
  5. Satisfaction → Rep/Danger conversion formulas
  6. Restock phase UX flow
  7. Game over conditions
  8. Victory/score system

  Design documents needed:
  - Faction taxonomy (list of all factions with morality, archetype examples, talk patterns)
  - Time budget document (seconds per phase, actions per phase, visitor counts)
  - Economy design doc (all formula constants with initial values for playtesting)
  - Party management spec (hiring flow, wages, member persistence)
  - Tutorial flow (how players learn the game)

  This game has great potential but the specs are more of a "vision document" than an implementation-ready design.
   About 40% of core mechanics need clarification before coding can begin effectively.