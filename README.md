# InteliMine — Version 2.1

InteliMine turns compulsory shift handover into structured operational intelligence while keeping each role focused on the decisions it actually needs to make.

## Product experiences

### Employee
A short role-specific shift handover. Employees identify themselves, complete required operational checks, add any observations that need to carry forward, and submit before clock-off.

### Mine Manager
An exception-first shift-control view. The manager sees:
- critical-control verification and exceptions;
- production versus plan;
- equipment availability and current delay minutes;
- the largest current shift losses;
- open operational actions with owner, target and lifecycle state;
- handover readiness and only the employees still outstanding;
- a controlled clock-off exception path for genuine cases.

### Mine Executive
A compact operating-performance view across the recent shift rhythm. The executive sees:
- production plan attainment;
- critical-control conformance;
- equipment availability;
- action closure discipline;
- handover discipline;
- material leadership exceptions;
- recurring loss concentration;
- open high-priority operational risk.

The top-right role selector switches cleanly between these experiences. Each role sees only the information relevant to that role.

## Core business invariants

1. Attendance proves presence; reporting proves handover.
2. A required handover obligation is explicit and auditable.
3. Normal conditions are data; non-submission is a separate state.
4. Observations remain immutable historical facts.
5. Operational issues have a separate managed lifecycle.
6. Employee, role, area and shift context is frozen with each fact.
7. Controlled vocabularies and stable IDs preserve analytical meaning.
8. Management dashboards are derived from governed facts rather than becoming the data model themselves.
9. Operational loss must be classified consistently so recurring constraints can be compared across shifts.
10. Critical-control verification has an explicit denominator: passed controls and exceptions are both retained.

## Version 2.1 visual upgrade

- Introduced a restrained industrial operations visual system using steel/slate surfaces and safety-yellow accents.
- Added a mine-operations header underlay featuring conveyors, chairlift infrastructure, mine vehicles and plant/control cues.
- Kept operational content on clean surfaces so the machinery treatment never competes with decision-critical information.
- Strengthened metric-card hierarchy for Mine Manager and Mine Executive views without adding information density.
- Applied the same visual language to employee handover forms while preserving the fast, minimal workflow.
- Preserved stable page sizing and role switching with no zoom/scale effects.

## Version 2.0 system improvements

- Removed build terminology, analytics-engineering language, simulator labels and technical IDs from the normal product UI.
- Replaced the old home screen with a focused role switcher.
- Rebuilt the Mine Manager experience around interventions, exceptions, loss and readiness.
- Added a dedicated Mine Executive operating-performance view.
- Added shift-performance facts, delay-event facts and critical-control-verification facts to the analytical model.
- Added owner and target-time context to managed operational issues.
- Kept clock-off exceptions behind progressive disclosure instead of permanently occupying management screen space.
- Simplified the employee flow and removed capture-channel selection from the employee task.
- Stabilised page composition so role switching does not visually scale or resize the interface.
- Preserved the governed analytics foundation underneath the simplified user experience.

## Sample employee credentials

- 104782 / 1111 — Fitter
- 105310 / 2222 — Electrician
- 106004 / 3333 — Safety Officer
- 107199 / 4444 — Supervisor
- 108022 / 5555 — Operator

Credentials are documented here for testing and are intentionally not displayed inside the employee interface.

## Project structure

- `index.html` — role-focused application shell
- `css/styles.css` — stable responsive UI system
- `js/app.js` — composition root and role routing
- `js/employee.js` — employee identification and handover experience
- `js/dashboard.js` — Mine Manager shift-control experience
- `js/executive.js` — Mine Executive operating-performance experience
- `js/leadership.js` — management and executive metric derivation
- `js/leadershipData.js` — sample shift-performance, delay and control-verification data
- `js/reportSchemas.js` — compulsory role-specific handover questions
- `js/observation.js` — structured operational observation capture
- `js/records.js` — submission, check, observation and issue factories
- `js/issueLifecycle.js` — operational issue lifecycle
- `js/analyticsModel.js` — vendor-neutral analytical fact views
- `js/store.js` — browser persistence for the current build
- `data/` — master-data and analytical contract templates

The existing integration and analytics engineering modules remain in the codebase as technical foundation, but they are no longer part of the normal role navigation.

## Run locally

Use VS Code Live Server, GitHub Pages, Firebase Hosting, or another HTTP server. ES modules should be served over HTTP/HTTPS rather than opening `index.html` directly with `file://`.

## Persistence

This build still uses browser `localStorage`. The storage schema remains `2.0`, so older v1.x browser state is intentionally not silently coerced into the new leadership model.

The intended production path remains:

`Operational capture → governed operational data → governed analytics dataset / warehouse → preferred BI / analytics platform`

InteliMine remains analytics-tool neutral. The governed data contract is the durable asset.

## Site configuration

Critical-control definitions, hazards, areas, equipment, targets and loss categories are mine-configured master data. The records included here demonstrate the operating model and must be aligned to the mine’s approved risk and control framework before production use.
