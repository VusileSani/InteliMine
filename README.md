# Mining Shift Intelligence — Version 1

A responsive prototype for compulsory end-of-shift reporting, designed for kiosk or employee mobile use.

## Business invariant
Attendance proves the employee was present. Reporting proves the employee handed over operational knowledge. A normal clock-off is allowed only after the required report is complete, with a supervisor override path for genuine exceptions.

## What V1 demonstrates
- Employee identification with employee number + PIN.
- Role-specific compulsory shift reports.
- Explicit "no issue" answers are valid; non-submission remains outstanding.
- Operations dashboard with shift compliance and priority observations.
- Supervisor clock-off override with audit fields.
- T&A simulator that asks whether an employee may clock off.
- Responsive UI suitable for kiosk, tablet, laptop or phone.
- LocalStorage persistence for demo purposes.

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
- `js/demoData.js` — prototype roster and attendance fixtures
- `js/reportSchemas.js` — role-specific reporting requirements
- `js/store.js` — local demo persistence
- `js/domain.js` — core business rules and clock-off eligibility
- `js/reporting.js` — role report rendering / validation
- `js/employee.js` — employee/kiosk experience
- `js/dashboard.js` — management dashboard and overrides
- `js/attendance.js` — T&A contract simulator
- `js/app.js` — routing and composition root

## Run locally
Because V1 uses ES modules, do not double-click `index.html` from Windows Explorer. Serve the project with VS Code Live Server, Python's local HTTP server, or GitHub Pages.

## Production evolution
V1 deliberately does not write to a real Time & Attendance platform. The later production architecture should expose an authenticated integration endpoint or adapter that returns a reporting-completion decision for a specific employee and shift. Real identity, roster, attendance, and role data should come from authorised enterprise systems or a controlled master-data layer.
