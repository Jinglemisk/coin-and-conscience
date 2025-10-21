# Phase 0 Tech Notes & Open Questions

## Economy & Balancing
- Confirm how faction alignment influences markup/markdown beyond base scalars. Should modifiers apply before or after faction deltas?
- Clarify whether taxes stack (daily + weekly + lord) or if some replace others based on region.
- Determine default restock quantities per category to align with weight limits once inventory is built.

## Visitors & Satisfaction
- Need precise curve for satisfaction vs. price deviation (linear vs. exponential) and how it feeds into reputation/danger.
- Honesty detection cadence: should it consume time/ticks or rely purely on upgrades/flags?
- Recruitment flow specifics (Phase 3+): do recruits occupy inventory/party slots immediately or after nightly resolution?

## Haggling & Risk Systems
- Decide whether haggling consumes discrete rounds from a visitor patience meter or uses probability thresholds only.
- Define how danger interacts with shoplifting/robbery events when danger exceeds critical threshold.
- Clarify relationship between `heat` (placeholder) and `danger` meters—are they merged or parallel systems?

## Persistence & Telemetry
- Storage quotas: need max snapshot size and retention policy before enabling real IndexedDB writes.
- Telemetry export format for QA (JSON Lines vs. zipped session package) once buffer UI exists.
- Evaluate need for opt-in analytics consent prompt if telemetry eventually leaves the client.
- Phase 1 snapshot exporter currently logs to console; when persistence work starts, decide whether to stream snapshots into IndexedDB or provide a downloadable JSON blob alongside telemetry buffers.

## Tooling & Testing
- Decide on unit test harness (Vitest vs. Jest) before Phase 1 tick engine is implemented.
- Establish storybook or component documentation approach once UI work begins.
- Determine automated smoke script shape in `/scripts` (Node vs. browser automation) before Phase 4 commerce loop.
- Validate that the fractional tick accumulator stays deterministic under QA speed multipliers; consider a debug view or test harness once automated tests land.
