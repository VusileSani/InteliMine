# Mining Shift Intelligence — Version 1.1

A responsive prototype for compulsory end-of-shift reporting, designed for kiosk or employee mobile use.

## Business invariant
Attendance proves the employee was present. Reporting proves the employee handed over operational knowledge. A normal clock-off is allowed only after the required report is complete, with a supervisor override path for genuine exceptions.

## V1.1 addition: canonical integration boundary
V1.1 introduces a stable Employee Master contract and Integration Hub boundary before any SAP-specific implementation.

- Official HR `jobTitle` is preserved separately from InteliMine `reportingRole`.
- Demo employee data now follows the canonical Employee Master shape.
- Reporting schemas use stable role codes (`FITTER`, `ELECTRICIAN`, etc.).
- Employee records are validated before operational use.
- Integration Hub shows employee-master readiness, role mappings, and the field contract.
- CSV templates define the information expected from future enterprise integrations.
- T&A remains a separate system and consumes a reporting-completion decision only.

## Demo credentials
- 104782 / 1111 — Fitter
- 105310 / 2222 — Electrician
- 106004 / 3333 — Safety Officer
- 107199 / 4444 — Supervisor
- 108022 / 5555 — Operator

## Project structure
- `index.html` — application shell
- `css/styles.css` — visual design
- `js/config.js` — operation / shift configuration
- `js/demoData.js` — canonical demo employee master and attendance fixtures
- `js/employeeMaster.js` — Employee Master field contract, validation and identity helpers
- `js/roleMappings.js` — source job-title to InteliMine reporting-role mappings
- `js/reportSchemas.js` — role-specific reporting requirements
- `js/store.js` — local demo persistence
- `js/domain.js` — core business rules and clock-off eligibility
- `js/reporting.js` — role report rendering / validation
- `js/employee.js` — employee/kiosk experience
- `js/dashboard.js` — management dashboard and overrides
- `js/attendance.js` — T&A decision simulator
- `js/integration.js` — Integration Hub UI
- `js/app.js` — routing and composition root
- `data/employee-master-template.csv` — canonical employee import template
- `data/role-mapping-template.csv` — source title → reporting role template
- `docs/integration/` — Employee Master, Integration Hub and T&A interface contracts

## Run locally
Because V1.1 uses ES modules, serve it through a local HTTP server, VS Code Live Server, or GitHub Pages rather than opening `index.html` directly from Windows Explorer.

## Production evolution
V1.1 does not connect to SAP or a real Time & Attendance platform. The next infrastructure phase can implement adapters against these stable contracts without changing the reporting domain.
