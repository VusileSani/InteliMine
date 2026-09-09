# MineMind Analytics Integrity — v2.8

`analyticsDataQuality()` validates canonical references and core lineage for the restrained v2.8 fact contract.

## Checks currently enforced
- observation identity, frozen employee context, shift, operation, area, event taxonomy and severity;
- process-stage/work-context references when present;
- analytical version envelope on observations;
- structured-check identity and shift/employee context;
- reporting-obligation identity and shift grain;
- issue observation lineage, canonical context and valid named assignee;
- issue status constrained to `OPEN`, `IN_PROGRESS` or `CLOSED` after normalization;
- shift-performance grain;
- delay and critical-control records owning their own shift and operation identifiers;
- every supplied common-safety answer having a structured check fact;
- handover source/target shift references, including prevention of source-shift self-routing;
- carried observation IDs resolving to preserved observations;
- operational-status history resolving to the operation.

Readiness-gate and material-movement checks were removed together with those fact families from the active v2.8 POC contract.

`tools/v28-invariant-test.mjs` also includes a negative safety-fact regression and direct continuity/routing checks.

## Production strengthening
Before production, add schema validation at write boundaries, transactional/idempotent integration handling, server-side authorization, controlled taxonomy migrations and warehouse reconciliation. A quality percentage is only a summary; the underlying error list remains authoritative.
