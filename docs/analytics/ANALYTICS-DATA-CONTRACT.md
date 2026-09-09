# MineMind Analytics Data Contract — v1.4

## Principle
MineMind preserves governed operational facts whose grain and meaning remain stable when screens, employee assignments, mine terminology and BI tools change. Historical records own their original context rather than inheriting whichever configuration happens to be current later.

The v2.8 restraint rule is equally important: **analytical context does not have to become an operational workflow.** Process stage and work context may enrich a fact without creating readiness gates, dependency engines or material-tracking screens.

## Core analytical dimensions
A governed fact may carry:

`operation → shift instance → actual area/team assignment → process stage → work context → equipment → event → ownership → handover/acknowledgement`

Employee master/home-area information is frozen separately from actual shift-assignment context.

## Active fact grains
- **Reporting compliance:** one row per reporting obligation per employee per active shift instance.
- **Structured check:** one row per submitted structured question/answer, including the compact common-safety continuity layer where applicable.
- **Observation:** one immutable row per noteworthy observation or Quick Capture fact.
- **Issue:** one row per managed operational problem; issue history owns assignment, work-start and closure reasoning/evidence.
- **Shift performance:** one row per integrated/demonstration shift-performance record.
- **Delay event:** one row per integrated/demonstration delay event.
- **Critical-control verification:** one row per integrated/configured control verification.
- **Handover delivery:** one row per intended cross-shift knowledge transfer, including target shift/team/area and delivery/view/acknowledgement state.
- **Operational status history:** one row per governed mine-wide safety or operational-performance status change.

Readiness-gate and material-movement fact families are intentionally excluded from the v2.8 POC contract.

## Required context and referential integrity
Where applicable, canonical IDs must resolve to governed state/master entities: operation, shift instance, area, optional process stage/work context, employee, equipment and event taxonomy. Missing canonical IDs are data-quality errors even when display text exists.

A handover with both source and target shift IDs must not target its own source shift. Carried observation IDs must resolve to preserved observations.

## Time
Facts preserve their own `shiftInstanceId`, business date, operation timezone and event timestamp. Historical facts may not derive shift identity from the currently active shift at read/export time.

## Versioning
Operational capture facts preserve, where applicable:
- `dataContractVersion = 1.4`
- `reportSchemaVersion = 2.2`
- `eventTaxonomyVersion = 1.3`
- `masterDataVersion = 1.2`
- `processModelVersion = 1.1`

## Provenance
Capture records preserve channel/capture point. Imported/integrated records should preserve source system, source record and import-batch identifiers. Prototype shift-performance, delay and control-verification facts are explicitly tagged/defaulted as `DEMO_INTEGRATION` until connected to authoritative mine systems.

## Safety mapping invariant
Every non-empty compact common-safety answer stored on a submitted handover must have a corresponding structured check fact. Analytics completeness must fall below 100% if that mapping is broken.

## Accountability invariant
The exposed issue lifecycle is deliberately small: `OPEN → IN_PROGRESS → CLOSED`. Rich timestamps/history may still preserve acknowledgement, work-start and prior migrated states underneath the interface.

## Production direction
Operational screens should subscribe only to bounded current work. Long-range trend analysis belongs in a governed analytical store/warehouse. Stable IDs and append-oriented history should be retained even when the front-end remains deliberately simple.
