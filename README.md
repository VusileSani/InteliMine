# MineMind — Version 2.5

MineMind turns compulsory shift handover into structured operational intelligence while keeping each role focused on the decisions it actually needs to make.


## Version 2.5 mine status signals

- Carries forward the v2.3 safety-continuity work and v2.4 access-governance model.
- Adds two extremely restrained mine-wide indicators directly to the employee sign-in card: **Safety** and **Operational Performance**.
- Uses Green / Yellow / Red signals with text labels so status is not communicated by colour alone.
- The indicators are deliberately informational and do not turn sign-in into a dashboard.
- System Administration manually sets both statuses based on current overall mine metrics; MineMind does not auto-derive them.
- Existing administrator-set status reasons remain available in authenticated actor views, while the login treatment stays compact.
- Preserves structured safety capture, safety-rich continuity reporting, observation/issue accountability, action ownership/closure, analytics-ready facts, configurable authority labels, scoped delegations and protected governance tiers from the earlier builds.

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

### Administrator
A controlled configuration workspace. The administrator maintains:
- employees and current-shift handover assignment;
- departments and operational areas;
- equipment;
- event types available to reporting roles;
- critical controls;
- operation identity.

Referenced master data is deactivated rather than destructively deleted so historical reporting remains interpretable.

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

## Version 2.2 administration correction

- Added **Administrator** to the role switcher.
- Added controlled maintenance for employees, departments, areas, equipment, event types and critical controls.
- Added operation identity editing.
- Added activation/deactivation rather than destructive deletion for referenced master data.
- Added current-shift handover assignment when creating or updating employees.
- Administrative changes persist in the browser state and are recorded in the audit trail.
- Mine Manager and Mine Executive remain free of configuration controls.

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

MineMind remains analytics-tool neutral. The governed data contract is the durable asset.

## Site configuration

Critical-control definitions, hazards, areas, equipment, targets and loss categories are mine-configured master data. The records included here demonstrate the operating model and must be aligned to the mine’s approved risk and control framework before production use.


## Administrator

Use **Role → Administrator** to maintain the operating configuration used by MineMind. The administrator can add/edit/deactivate employees, departments, areas, equipment, event types and critical controls, and can edit the operation identity. New employees can be assigned a current-shift handover from the employee form. Administrative changes are persisted locally and recorded in the audit trail.

Administrator is deliberately separate from Mine Manager and Mine Executive: configuration belongs to administration; operational decisions remain in the leadership views.


## v2.3 Safety Continuity update
- Safety capture is embedded in every employee shift handover rather than added as a separate safety workflow.
- All actor views show administrator-set Production Status and Safety Status indicators (Good / Attention / Critical).
- System Administration can update the mine-wide status reason and publish it across the prototype; values are stored locally for prototype testing and are not automatically inferred.
- Manager and Executive reports include realistic mock safety-continuity data, carried-forward actions, production context, and clear separation of fact, recorded interpretation and action.
- Production implementation should persist status history and permissions server-side; this prototype intentionally does not claim automatic safety scoring.


## v2.4 Access Governance

This build separates employment/job information, shift reporting role and MineMind application authority. System Administration can assign only operational application roles and scope. Protected System Administrator and Platform Governance authority is granted/revoked only from Platform Governance. Role labels and descriptions are configurable without changing the stable underlying authority tier. Privileged and employee access changes are written to the audit trail. The role switcher remains a prototype/demo navigation surface; production authorization must be enforced server-side.
