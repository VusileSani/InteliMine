# MineMind v2.8 — Restraint & Continuity

MineMind is a mining operational-memory and accountability prototype. Version 2.8 deliberately **reduces visible machinery** introduced in v2.7 and concentrates the POC on the capabilities that materially support the product's core purpose:

- preserve operational knowledge before it leaves with a person;
- make material problems accountable to a team/person;
- carry relevant knowledge into the receiving shift;
- route information to the people who need it;
- give supervisors, managers and executives useful exception-led visibility.

Mining-domain sophistication remains in the data underneath the interface. Process stage and work context can enrich an observation without becoming a process-control engine.

## Restraint decisions in v2.8

Removed/deferred from the POC surface and active analytical contract:

- blasting/readiness-gate workflows;
- material/tonnage lineage tracking;
- the visible mine-operating-sequence strip;
- duplicate Issue Ownership, Handover Delivery and Safety Continuity management sections;
- Reporting Templates administration;
- Platform Governance as a normal prototype actor/view;
- corporate banner branding;
- process-stage/work-context micromanagement in shift assignment;
- the five-state visible issue lifecycle.

The underlying authority model, process-stage IDs, work-context IDs and historical event detail remain available where they improve security, analytics or context without creating user-facing burden.

## Core actor experiences

### Employee
- Sign in with employee number and PIN.
- See mine status and scoped Message Board notices.
- Receive and acknowledge incoming handovers.
- See **My Actions** when a named action is assigned.
- Start and close own assigned actions with closure reasoning/evidence.
- Use a compact **Quick Capture** to preserve an observation during the shift.
- Review Quick Captures at handover; relevant captures carry forward without retyping.
- Complete the role-specific compulsory shift handover.
- Common safety continuity is reduced to one status question plus detail only when attention/critical is selected.

### Mine Manager / Supervisor
- Exception-first operating view.
- Open actions with assignment/reassignment in the same card.
- Critical-control exceptions where integration/configuration data exists.
- Weak signals plus explicit recurring patterns.
- One compact **Handover Continuity** view showing both missing outgoing reports and unacknowledged incoming handovers.
- Daily Shift Handover / management print pack.
- Seeded production/availability/delay/control metrics are clearly labelled as prototype integration placeholders rather than MineMind-native facts.

### Mine Executive
- Compact recent-shift trend and exception view.
- Priority open actions, recurring loss concentration and handover discipline.
- Integration/demo performance metrics are explicitly identified as such.

### System Administration
- Employees, operational roles/scopes and essential master data.
- Active-shift selection.
- Lightweight current-shift assignment: employee + area + team.
- Mine-wide Message Board publishing.
- Mine-wide Safety / Operational Performance indicators with governed history.
- Mine name + compact mine logo.

Protected platform authority remains in the code/governance model but is intentionally outside the normal POC actor switcher.

## Core continuity fixes

### Real source-shift → receiving-shift handover
A submitted handover now targets the next configured shift instance rather than its own source shift. Receiving team resolution uses the next shift's team/area assignments.

### Quick Capture becomes handover memory
Quick Captures are not a parallel reporting system. At formal handover they are shown as already-captured facts and are carried forward by default unless the employee deliberately unticks them.

### Accountability closes with the assignee
Managed issues route by responsibility rather than blindly inheriting the reporter's team. Engineering/electrical observations route to the engineering team. Named assignees see the item under **My Actions** and can record work/closure.

### Active shift is state-backed
The current operating shift is resolved from `activeShiftInstanceId` / shift state. Administration can activate a receiving shift without changing application code.

## Institutional-memory invariants

1. Attendance proves presence; reporting proves handover.
2. Employee identity is separate from where/team with whom the employee worked that shift.
3. Historical facts own their shift identity.
4. Original observations remain immutable operational facts; managed actions have a separate lifecycle.
5. A non-actioned signal can still remain visible and recur across shifts.
6. Every supplied common-safety handover answer must survive into the structured check-fact stream.
7. Process stage/work context are optional semantic context, not user-facing workflow gates.
8. Responsibility routing, named assignment and closure history preserve accountability.
9. Information recorded is different from information transferred; handover delivery and acknowledgement are distinct.
10. Mine-wide status, messages and authority changes remain auditable.
11. Operational reports are generated from governed MineMind state; seeded integration metrics are labelled as prototype inputs.

## Active analytical fact families — contract v1.4

- observation facts;
- structured shift-check facts;
- reporting-compliance facts;
- managed-issue facts;
- shift-performance facts (integration/demo source in this POC);
- delay-event facts (integration/demo source in this POC);
- critical-control-verification facts (integration/demo source in this POC);
- handover-delivery facts;
- operational-status history.

Readiness-gate and material-movement fact families are intentionally outside the v2.8 POC contract.

See `docs/analytics/ANALYTICS-DATA-CONTRACT.md` and `data/`.

## Sample employee credentials

- `104782 / 1111` — Fitter
- `105310 / 2222` — Electrician
- `106004 / 3333` — Safety Officer
- `107199 / 4444` — Supervisor
- `108022 / 5555` — Operator

## Suggested v2.8 test walkthrough

1. Start as **Employee** and sign in as `107199 / 4444`. Review and acknowledge the incoming handover.
2. Sign in as `108022 / 5555`. Use **Quick Capture** for an operational observation and keep it non-actioned; verify it is available for the formal handover.
3. Capture another equipment issue with **Needs managed action = Yes**. Switch to **Mine Manager** and verify the issue routes to Engineering rather than the reporter's production team.
4. In **Mine Manager**, assign an open action to `105310` and switch back to Employee as `105310 / 2222`. Verify it appears under **My Actions**, then start/close it with reasoning.
5. Complete an outstanding shift handover and verify the delivery targets the configured **06 Sep Day Shift** rather than the source Night Shift.
6. In **System Administration**, change the active shift to **06 Sep · Day**. Sign in to a receiving-team employee and verify the routed handover becomes visible for acknowledgement.
7. Confirm the manager landing page contains no readiness-gate workflow, material-lineage view, visible mine operating sequence, duplicate Issue Ownership section or separate Safety Continuity dashboard.
8. Open the Daily Shift Handover Print Pack and confirm it contains exceptions/actions/handover gaps/recurring signals but no engineering data-quality score.

## Run locally

MineMind uses ES modules and should be served over HTTP/HTTPS:

```bash
cd minemind_v2_8_restraint_continuity
python -m http.server 8080
```

Open `http://localhost:8080`.

VS Code Live Server, GitHub Pages or Firebase Hosting are also suitable for prototype testing.

## Validation

Run the v2.8 invariant suite:

```bash
node tools/v28-invariant-test.mjs
```

Run the application composition smoke test:

```bash
node tools/v28-composition-smoke.mjs
```

Validate JavaScript syntax:

```bash
for f in js/*.js tools/*.mjs; do node --check "$f"; done
```

`VALIDATION-v2.8.txt` records the packaged-build verification result.

## Persistence and production boundary

This remains a browser prototype using `localStorage`. Existing v2.7 state is normalized forward into v2.8, including simplified issue lifecycle/status normalization and correction of engineering responsibility routing where possible.

Production must replace the prototype actor/view switcher with authenticated identities and server-enforced authorization. A durable backend should preserve bounded operational state plus append-oriented history, with long-range analytics exported to a governed analytical store.

## Release documentation

- `RELEASE-NOTES-v2.8.md`
- `RESTRAINT-IMPLEMENTATION-v2.8.md`
- `docs/analytics/ANALYTICS-DATA-CONTRACT.md`
- `docs/PERMISSIONS-AND-RIGHTS-GUIDE.md`
- historical v2.x notes are retained under `docs/archive/`.
