Headings marked with an X are INCOMPLETE. Consider them in your planning but they will be implemented LATER.

**Coin & Conscience** is a 2D, single-player shop simulator where the player is roleplaying a wandering merchant who can trade with various adventurers, travelers and mysterious personalities to expand their business without going down or angering certain factions.

React 18 + TS + Vite + Zustand + IndexedDB

# Core Gameplay Loop

The game maintains time via "ticks". Every second in real life is 10 ticks. 

All phases of the game last a certain duration (in seconds), creating time pressure on the player.

## Daily Cycle

Each cycle lasts an amount of seconds. End / beginning of each cycle is signalled by a popup.

- Morning → Day → Evening → Night → [Repeat]
- Morning: Player prepares to open shop.
    - Buy a daily Upgrade
- Day: Visitors enter the shop to Interact with the Player.
    - Buy / Sell: Exchange Items for Gold.
    - Haggle: Negotiate better prices.
        - May be disabled during early phases via the `haggle` feature flag.
    - Talk: Chat with the Visitors to learn their background and deduce their factions.
    - Refuse: Refuse service to a Visitor
    - Consequences: Every interaction affects either some or all of: Gold, Reputation, Danger
- Evening: Close shop, pay Wages, resolve any latent Events.
- Night: Player sleeps, resolve any latent Events. The cycle repeats.
- Events: During any time of the Day (and Night), the Player can receive Events based on their Reputation, Danger, or earlier interactions.

## Weekly Cycle

End of the Week: After every 5th day, the week ends.

- Day 1 → Day 2 → Day 3 → Day 4 → Day 5 → Weekend → [Repeat]
- Travel: The player can change Regions.
- Player can buy permanent Upgrades.

### Player Goals

- Increase total Gold while keeping Reputation at desired levels.
- Not let Danger rise to 100.
- Survive as many days as possible.

### Player Actions

- Restock Items: To obtain more items to sell.
- Hire: To expand your Party and capabilities
- Buy Upgrades: Daily and Permanent Upgrades for benefits.
- Interact: with Visitors
    - Buy Items / Sell Items: from Visitors to resolve their Needs, keep Reputation and Danger at desired levels.
    - Haggle: To negotiate better Prices
    - Talk: To infer their Honesty, Faction and its implications.
    - Refuse: Send Visitor away to avoid other consequences at the cost of Reputation.
- Pay Wages: To your Party to maintain them.

# Player Stats

The player’s state is defined by several key stats.

## Gold

The player’s most important resource used during buying and selling items. Gold can be earned or lost in several ways.

Gold is gained when the player:

- Sells an Item
- Rewarded by an Event.

Gold is lost when the player:

- Buys an Item
- Buys an Upgrade
- Pays Wages
- Pays the Local Lord
- Required by an Event

## Reputation

This is a reflection of how people see your trading business. Reputation is increased for every successful transaction and through certain Events, while it can be lost by refusing to serve a customer, angering them by failing a Haggle, or through certain Events.

## Danger

The world is a dangerous place, and it is made even more dangerous when the player fails to serve morally-good aligned characters and increases when they serve to morally-evil aligned characters. Reaching the maximum Danger score ends the game. Different regions have different base Danger values.
Global difficulty modifiers can raise or lower baseline danger/reputation deltas for the entire run via the shared modifiers provider.

## Party Size

The number of Employees (hands, guards etc. that have been unlocked via Interactions or Upgrades) the player has. Its max size depends on the Player’s Reputation, Upgrades and Interactions.

# Systems

Implementation note: Each gameplay system keeps its state, logic, and feature-specific UI co-located in a `features/*` module (for example, `features/inventory`), while shared atoms and layout pieces live under `src/components/ui` and `src/components/layout`. Cross-cutting services (config, feature flags such as `haggle`, telemetry, persistence, and global modifiers) live in `src/app/providers` so they can influence multiple systems without breaking encapsulation.

### Global Services

- Config provider: exposes tunable parameters and derived helpers to every feature.
- Feature flags: boolean toggles for partially implemented systems (haggle, travel, world events) that can be flipped for builds or QA scenarios.
- Logging + telemetry: structured events routed through a shared pipeline so gameplay actions, visitor flows, and economic changes are traceable.
- Persistence: IndexedDB-backed snapshots of config version, inventory, meters, feature flags, and modifiers to resume runs.
- Global modifiers: run-wide effects (difficulty, seasonal events) that adjust gold/reputation/danger math before features apply local logic.

## Inventory Management

The Inventory is the backbone of the Player. It is where all Items are stored, regardless of their category, and can be filtered based on their category (Armor, Weapons, Books, etc.). Inventory has a Base Weight limit that can be altered with daily or permanent Upgrades.

Every Item has:

- Name: “Cuirass of the Temple…”
- Weight: in kg.
- Base Price: in. Gold
- Category: The type of Item
- Tags: Any tags like Illegal or Cursed, these may be hidden initially as “???”

Item Categories: Items fall under several categories:

- Weapons: Swords, bows, etc.
- Armor: Cuirass, pauldrons, greaves, etc.
- Clothes: Robes, gloves, boots, hoods, etc.
- Books: Tomes, diaries, scrolls, etc.
- Potions: Healing, Poisons, etc.
- Trinkets: Amulets, keepsakes, gems, etc.

Item Tags: Items can have one or several tags:

- Illegal: Selling these to certain Factions will decrease your Reputation.
- Cursed: Selling these to any Faction will decrease your Reputation and increase your Danger.

Restocking: Players Restock every Week after the 5-day cycle is over. Players may only buy Items and not sell Items. Players can purchase permanent Upgrades.

## Party Management

Your Party is made of helpers, guards and various other entourage. Party has a Base Party Size which can be changed using permanent Upgrades.

## Visitors

Every Visitor is defined by several key attributes:

- Name: Their own name or an alias.
- Appearance: How they seem on the outside (portrait image and description).
- Faction: Their affiliation. Affects Reputation after every Interaction.
- Need: Buy or Sell an Item, or something else. The Interaction succeeds when this is fulfilled.
- Satisfaction: Affected by Haggling outcome and Need. The Interaction fails when this drops to 0.
- Talk: Generic lines based on their Faction and Honesty.
- Honesty: Whether their Appearance and Talk are in line with his Faction affiliation.

When generating a Visitor, the game calculates:

1. Faction, to determine Reputation outcomes
2. Need, to determine Interaction requirements
3. Honesty, to determine their Appearance, Name
    1. If they are honest, they are generated from that Faction’s set of Appearance, Names and Talks
    2. If they are honest, they are generated from any other random Faction’s set of Appearance, Names and Talks
4. All Talks are generated based on Honesty - Faction match.

During the Interaction, the game calculates Satisfaction based on whether:

- The Need is satisfied, and
- How much the Visitor paid / gained for the Item compared to Base Price.
- If the player refused service, this drops to 0 automatically.

After the Interaction, the Visitor +/- affects:

- Reputation, based on their Faction and Satisfaction
- Danger, based on their Faction and Satisfaction

## Interactions

Whenever a Visitor enters the store, the Interaction is determined by their Need and Honesty.

- Buy or Sell Items (Need): The Visitor is asking to buy or sell an Item for a certain price.
- Haggle (Buy or Sell): The Player can haggle for the price.
- Recruitment (Need): The Visitor may be seeking employment from the Player.
- Talk (Honesty): Whether they will answer aligned with their Faction depends on their Honesty.
- Refuse: Player can refuse service which drops Satisfaction to 0 and the Visitor leaves.

## Upgrades

Upgrades are split in two categories:

- Daily Upgrades: These last until the next Morning.
    - Daily Guard: +1 Party, Decreases Danger
    - Daily Hand: +1 Party, Increases Interaction Speed
- Permanent Upgrades: They last permanently.
    - Appraiser: +1 Party, increases/decreases Base Prices for selling/buying to Visitors by 5%/10%/15%
    - Quartermaster: +1 Party, decreases Base Prices for Restocking Inventory by 5%/10%/15%
    - Tents: +1 Party Size
    - Guard: +1 Party, Decreases Danger
    - Hand: +1 Party, Increases Interaction Speed
    - Bard: +1 Party, % chance to identify Honesty
    - Scout: +1 Party, …..
    - Locked Chest: Reduces shoplifting chance…

## Reputation and Danger

<aside>
💡

Option 2: Reputation is Popularity, Danger is Chaos

- Popularity:
    - Increased chance of getting better / exotic customers
    - Increased chance of getting better Events
- Danger
    - Increased chance of getting worse Events
    - Decreased chance of interacting with Good-factions

•		•	Increased chance of interacting with Bad-factions

</aside>

Reputation has a value between -100 and +100. -100 implies morally-evil alignment, and +100 morally-good alignment.

- Bad Reputation:

Danger has a value between 0-100. At 100 Danger the game is over. Depending on the Danger level, the player can get:

- Shoplifting and robbery attempts

## World Events

There is a pool of Events which can trigger during the Day or Night. Events can be triggered in one or several ways:

- Items: An Item may be associated with an Event, due to a Curse, etc.
- Reputation or Danger: If the player passes a certain Reputation or Danger threshold they may receive an Event.
- Weekly: Every Week an Event may be randomly selected.

# Visual Design & UI

## Styles

- Medieval, script, medieval bookkeeping, skeuomorphic UI

## Screens

Regardless of the Screens, the player will always have the Stats Bar at the top of the screen.

- Stats Bar: Features the Player’s Gold, Reputation, Danger, Party/Party Size, Day Count and Day type (Day 1, Day 2, Weekend, etc.)
- Restock: Featuring permanent Upgrades and Item purchases (to sell to Visitors later)
- Shop: Where the player will spend most of their time.
    - Left Column: Inventory that can be sorted based on Category, Tags, etc. of Items.
    - Right Column: Daily Upgrades and Party Management
        - Daily Upgrades: Bought & Buyable daily Upgrades.
        - Party Management: Screen for interacting with Party members with active effects.
    - Center: Information about the Visitor, including their Name, Appearance, Need and Talk options.
        
        

## Screen layout

- Top bar: gold, day counter & status, and values for Reputation and Danger.
- Left column: inventory by category with scarcity badges and inquiry synergies; drag items into the deal slot.
- Right column: upgrades, staff, permits; tooltips state meter effects and time impacts.
- Center top: visitor portrait and alias only. Beneath: discovered tags you have earned this run (not all tags).
- Center middle: inquiry actions with time costs, haggling presets/price entry, credit toggle, add-ons.
- Bottom center: dialogue log with your questions, their answers, cues like hesitation or contradictions, and a rumor ticker with qualitative hints about world state.

## Visitor archetypes (examples)

- Adventurer party: buys practical gear; success reduces danger; their failure raises it.
- Bandits/raiders: pay well for contraband; raise danger and create heat if exposed.
- Court mages: want rare reagents; avert magical crises; counterfeits cause big heat.
- Nobles: prestige items; raise renown; may demand credit; defaults cause heat.
- Guards: bulk arms contracts; funding lowers danger; price-gouging raises heat.
- Cultists/hooded figures: extreme margins; spike danger; unlock dark upgrades.
- Tax assessor: inspections; good paperwork lowers heat; discrepancies fined.
- Rival merchant: swaps stock; triggers market shocks; cartel collusion raises heat.
- Refugees/survivors: low budget; charity slightly lowers danger and raises renown.

## Haggling mini-loop

- Quick presets: low, medium, high, extreme margin. Each rolls against visitor patience and traits.
- Up to three rounds; each round changes acceptance odds and drains patience. Traits like stubborn, gullible, thrifty, vengeful shape curves and post-sale effects.

## Economy and risk (first-pass formulas)

- Reserve price:
    - r = base_price × scarcity_multiplier × quality_factor × reputation_factor
- Offer acceptance:
    - Accept if asked_price ≤ r × (1 + tolerance)
    - Else probability: p = exp(−elasticity × (asked_price / r − 1 − tolerance))
- Profit per sale:
    - margin = asked_price − cost
- Queued deltas per sale:
    - danger_delta = kD × villain_power × margin_ratio × shady_factor − kH × hero_power × sold_to_hero_flag
    - heat_delta = kT × illegal_flag × margin_ratio − permits_level × kP
- Daily decay applied at debrief:
    - danger = max(0, danger + sum(danger_delta) − guard_funding × dG)
    - heat = max(0, heat + sum(heat_delta) − compliance_spend × dT)

## X Travel and Regions

- TO BE IMPLEMENTED
    - Travel to different regions with different base reputation + danger + Local Lord
- FOR NOW: No Travel / Regions screen during the Restock phase.

## X World Events

- TO BE IMPLEMENTED
    - Events depending on Reputation & Danger
- FOR NOW:
    - There is only one region with no base Danger, Reputation or Local Lord.
