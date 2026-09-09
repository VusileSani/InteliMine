# MineMind v2.8 — Restraint & Continuity

## Release intent
v2.8 is a deliberate simplification release. It applies the MineMind restraint framework to v2.7: keep capabilities that materially improve operational memory, accountability, handover or useful visibility; remove/defer explicit workflow machinery that does not.

## Core fixes
- **Cross-shift handover routing:** new handovers resolve the next configured shift and its receiving team/area instead of targeting the source shift.
- **My Actions:** named assignees now see their open actions in the employee workspace and can start/close work with reasoning/evidence.
- **Quick Capture → handover:** captured observations are presented during formal handover and carry forward by default unless deliberately excluded.
- **Responsibility routing:** engineering/electrical issues resolve to an engineering team rather than inheriting the reporter's team.
- **State-backed active shift:** current shift behavior now follows `activeShiftInstanceId` and can be changed from System Administration.
- **Weak-signal visibility:** repeated patterns show what is repeating, how many reports exist and across how many shifts.
- **Safety handover restraint:** common safety continuity is reduced to a status plus conditional detail; the Safety Officer does not receive the duplicate common layer.
- **Issue lifecycle restraint:** visible lifecycle simplified to `OPEN → IN_PROGRESS → CLOSED`, while useful timestamps/history remain in data.

## UI simplification
Removed/deferred from the normal POC experience:
- visible mine operating sequence;
- operational readiness gates;
- material/tonnage lineage;
- duplicate Issue Ownership section;
- separate Handover Delivery Continuity section;
- separate Safety Continuity manager/executive report;
- Reporting Templates administration;
- process-stage/work-context assignment fields in shift administration;
- Platform Governance from the prototype actor selector;
- mine corporate banner.

Consolidated:
- action assignment now lives inside **Open Actions**;
- outgoing and incoming handover exceptions now live in one **Handover Continuity** section;
- mine branding is reduced to mine name + compact logo.

## Credibility of management data
The seeded production, availability, delay and critical-control values remain useful to demonstrate intended integration surfaces, but the UI and analytical facts now identify them as prototype integration/demo inputs. MineMind-native handovers, observations, actions and status history remain state-driven.

## Analytics contract
Data contract advances to **v1.4**. Readiness-gate and material-movement facts are removed from the active POC analytical contract. Process-stage/work-context IDs remain optional semantic context on retained facts.

## Production boundary
The prototype still uses browser `localStorage` and a role/view switcher. Production requires authenticated identities, server-side scope/authority enforcement and a durable transactional datastore. The protected governance model remains in the source architecture even though it is hidden from the normal POC actor experience.
