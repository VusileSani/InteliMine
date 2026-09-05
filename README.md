# InteliMine — Version 1.3 · Analytics Integrity

InteliMine is a responsive mining shift-intelligence prototype for compulsory employee handover reporting from a shared kiosk, employee cellphone or operational tablet.

## Business invariants
1. Attendance proves the employee was present.
2. A clock-in creates an explicit reporting obligation for the identified shift instance.
3. Reporting proves the employee handed over operational knowledge.
4. A normal clock-off is allowed only after the obligation is complete, with an auditable supervisor override for genuine exceptions.
5. Normal conditions are data. Non-submission is a different state.
6. An observation is an immutable statement of what was observed. An operational issue is a separate record whose lifecycle may change.
7. Historical employee/role/area context is frozen with each fact so later master-data changes do not rewrite history.
8. The operational application captures information; the governed dataset is the long-term analytical asset.

## V1.3 — Analytics Integrity
V1.3 strengthens the information model before production persistence is introduced.

- Explicit `shiftInstance` with start/end timestamps, business date, timezone and UTC equivalents.
- Explicit `reportingObligation` records generated from attendance/roster presence rather than assuming every active employee is the denominator.
- Structured check facts are created for every required answer, including normal conditions.
- Immutable observation facts are separated from managed operational issues.
- Action-required observations create an issue; issue status changes never mutate the source observation.
- Employee organisational context is snapshotted at capture time.
- Every analytical record carries data-contract, report-schema, taxonomy and master-data versions.
- Capture provenance records kiosk/mobile/tablet channel and capture point.
- Integration Hub demonstrates staged ingestion: `RECEIVED → VALIDATED → APPLIED` or `REJECTED`.
- Cross-midnight observation times resolve inside the actual shift instance.
- Vendor-neutral CSV exports now exist for compliance, structured checks, observations and issues.

## Demo credentials
- 104782 / 1111 — Fitter
- 105310 / 2222 — Electrician
- 106004 / 3333 — Safety Officer
- 107199 / 4444 — Supervisor
- 108022 / 5555 — Operator

## Project structure
- `index.html` — application shell
- `css/styles.css` — responsive visual design
- `js/config.js` — product/version configuration
- `js/shift.js` — shift-instance time model and cross-midnight timestamp resolution
- `js/masterData.js` — canonical operational dimensions and controlled vocabularies
- `js/demoData.js` — demo Employee Master, attendance, obligations, submissions, facts, issues and integration batches
- `js/employeeMaster.js` — Employee Master contract and validation
- `js/roleMappings.js` — source job-title → reporting-role mappings
- `js/reportSchemas.js` — compulsory role-specific reporting questions plus analytics metadata
- `js/context.js` — version envelope, provenance and frozen employee context
- `js/observation.js` — immutable observation composer
- `js/records.js` — submission, check-fact, observation and issue factories
- `js/store.js` — local prototype persistence
- `js/domain.js` — reporting-obligation / clock-off business rules
- `js/issueLifecycle.js` — managed issue lifecycle transitions
- `js/reporting.js` — report rendering and validation
- `js/employee.js` — employee / kiosk / mobile experience
- `js/dashboard.js` — management compliance and issue workflow
- `js/attendance.js` — T&A decision simulator
- `js/analyticsModel.js` — vendor-neutral analytical fact views
- `js/analytics.js` — analytics-integrity UI and CSV exports
- `js/integration.js` — Integration Hub and staging visibility
- `js/app.js` — composition root and routing
- `data/` — integration, master-data and analytical templates
- `docs/integration/` — enterprise interface contracts
- `docs/analytics/` — analytics integrity and fact-grain contracts

## Run locally
V1.3 uses ES modules. Serve the project through a local HTTP server, VS Code Live Server, GitHub Pages, or the PowerShell server used during prototype testing. Do not open `index.html` directly via `file://`.

## Prototype persistence
V1.3 still uses browser `localStorage`. The storage version intentionally changes to `1.3`, so previous V1.x browser demo state is reset instead of being silently coerced into the new analytical model.

Production evolution should preserve the same grains:

`Operational database → governed analytics dataset / warehouse → mine's preferred BI / analytics platform`

InteliMine remains analytics-tool neutral. The data contract is the stable asset.
