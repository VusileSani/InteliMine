# InteliMine 2.0 — System Improvement Inspection

## Main diagnosis

Version 1.3 had a strong analytical foundation, but the management experience still reflected the internal data model. Managers were shown reporting obligations, structured-check counts, immutable-observation language and technical identifiers that were useful for system design but not for operational decision-making.

Version 2.0 separates three concerns:

- **Capture:** frontline employees record reliable shift facts.
- **Control:** Mine Managers see current exceptions, loss, actions and handover readiness.
- **Direction:** Mine Executives see performance trend, control assurance, recurring loss and material risk.

## Product rules applied

- One role, one focused experience.
- Exception-first management screens.
- Progressive disclosure for infrequent controls.
- No visible prototype, release, analytics-engineering or development terminology.
- No unnecessary IDs or data-contract language in operational screens.
- Stable layout composition across role changes.
- Preserve analytical grain and history underneath the simplified UI.

## Data-model additions

Three operational fact families were added:

1. **Shift performance fact** — one row per shift for plan, actual, availability, utilisation, delays, control conformance, handover compliance and action closure.
2. **Delay event fact** — one row per classified operational delay with area/asset context, duration and estimated production impact.
3. **Critical-control verification fact** — one row per required control verification with pass/exception status, owner, time and context.

Managed issues now also carry an owner role and target time while preserving the source observation as immutable.

## Mine Manager value test

The manager should be able to answer, within seconds:

- Are any critical controls not effective?
- Are we on production plan?
- What is costing us the most time or tonnes?
- Which operational actions are open and who owns them?
- Is the next shift receiving a complete handover?
- Where is my intervention required now?

## Mine Executive value test

The executive should be able to answer, within seconds:

- Are we consistently delivering plan?
- Is critical-control assurance strengthening or weakening?
- Is asset availability improving?
- Are actions being closed with discipline?
- Where are losses recurring across shifts?
- What material risk currently requires leadership attention?

