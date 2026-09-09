# MineMind v2.7 — Operational Intelligence Foundation

## Release objective

v2.7 closes the principal gaps identified in the code-grounded review of v2.6. The existing handover/exception architecture is retained, but the application now models operational sequence, actual shift context, knowledge transfer, weak signals, accountable ownership and deterministic reporting more explicitly.

## Added

### Mine operating sequence
- Configurable process stages covering the seeded end-to-end mining value chain.
- Configurable work contexts for faces/panels, blast rounds, haul routes and process-plant units.
- Process-stage/work-context dimensions carried into operational facts and management views.

### Actual shift context
- State-backed shift instances rather than treating the display configuration as the historical record.
- Current-shift assignments that separate employee master/home-area identity from where the employee actually worked.
- Historical delay and critical-control records retain their own shift/operation identity.

### Operational readiness
- High-level readiness workflow/gate model with confirmed, blocked and pending states.
- Actor, timestamp and evidence retained on confirmation.
- Management display emphasizes blockers and the next configured gate.
- Production warning explicitly requires authorized roles, approved site procedures and server enforcement.

### Knowledge transfer
- Incoming handover delivery records.
- Viewed and acknowledged states.
- Employee acknowledgement experience.
- Management handover-delivery continuity metrics.

### Weak-signal preservation
- Non-actioned high/critical observations remain visible for management review.
- Signal review state is auditable.
- Recurring observation patterns are surfaced without forcing every signal into an action.
- Quick Capture lets employees preserve operational knowledge during the shift.

### Accountability
- Managed issues can be assigned to a concrete team and/or employee.
- Assignment history is retained.
- Resolution and closure preserve reasoning/evidence/verification context rather than only a status transition.

### Value-chain continuity
- Lightweight material/production-unit lineage.
- Material-movement facts preserve source stage, destination stage, tonnage, shift and note.

### Reporting and configuration
- Reporting templates stored in application state and extensible by System Administration.
- Five additional seed reporting roles for wider value-chain coverage: blasting supervisor, cleaning operator, haulage operator, plant operator and metallurgist.
- Deterministic Daily Control / Shift Handover Print Pack generated from governed state only.

## Corrected

- Common safety-continuity questions now generate structured check facts, not only submission answers.
- Older local prototype submissions with those answers are backfilled during state normalization.
- The previous hard-coded Safety Continuity management report was replaced by state-derived reporting.
- Analytics integrity now validates operation, shift, area, process stage, work context, taxonomy and issue-owner references.
- Analytics completeness incorporates explicit safety-answer-to-fact mapping checks.
- Team messages are filtered by the employee's actual team/area scope.
- Message Board collapsed state renders the first three messages correctly; View All can reveal the remaining rendered messages.
- Supervisor team-message composition is tied to an actual signed-in Supervisor employee and that supervisor's current-shift team.
- Mine-wide operational status now lives in the main governed state with history and audit rather than a separate browser storage silo.
- Product/config/data-contract/process-model versions have been aligned to the v2.7 release.

## Preserved from earlier releases

- Immutable observation + managed issue separation.
- Attendance vs reporting-obligation separation.
- Compact progressive-disclosure UI.
- Exception-led Mine Manager and Mine Executive views.
- Mine-wide status indicators.
- Access-governance separation between job title, reporting role and application authority.
- Message Board and mine-specific logo/banner identity.

## Production boundary

The release is still a local browser prototype. The role selector is not an authentication mechanism. Production must enforce identity, permission, operational scope, readiness-gate authority, issue ownership, message audience and audit on the backend.

Safety-critical operational readiness must remain deterministic and site-procedure-driven. AI may summarize, cluster or detect patterns later; it must not autonomously authorize a safety-critical gate.
