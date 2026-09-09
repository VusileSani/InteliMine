# MineMind BI Readiness — v2.8

MineMind v2.8 preserves analytical meaning without making the POC operate every part of the mining value chain.

## Analysis enabled by the retained grain
- reporting/handover completion by shift, team, role, area and operation;
- handover delivery vs acknowledgement across source and receiving shifts;
- recurring observations by event, equipment, process stage and work context;
- weak signals that did not become managed actions;
- assignment, time-to-start and time-to-close for managed issues;
- delay and critical-control performance where authoritative integrations are available;
- mine-wide operational-status history;
- patterns such as repeated equipment/area observations across multiple shifts.

## What v2.8 intentionally does not model as a POC fact family
- safety-critical readiness-gate progression;
- material/tonnage movement lineage across mining and plant stages.

Those domains may be revisited only if real pilot evidence shows they materially improve MineMind's institutional-memory/accountability purpose.

## Warehouse direction
Keep the operational datastore optimized for bounded current work. Export append-oriented facts/events to a governed warehouse for long-range analysis. Stable IDs should survive terminology/UI changes.

AI/ML can later operate on this governed history for clustering, recurrence detection, weak-signal identification, summarisation and decision support. It should deepen interpretation of captured operational knowledge rather than create unnecessary user-facing workflow machinery.
