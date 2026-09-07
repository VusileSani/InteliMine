# MineMind Permissions & Rights Management Guide

## Core rule
MineMind separates three things that are often incorrectly merged:
1. Employment identity and job title.
2. Shift reporting role - what the person is expected to capture/report operationally.
3. Application authority - what the person may do inside MineMind.

A job title never grants system authority automatically.

## Stable authority tiers
- OPERATIONS - baseline operational access.
- ELEVATED_OPERATIONS - additional coordination/review authority within scope.
- MANAGEMENT - broader operational visibility and action authority.
- SYSTEM_ADMIN - routine MineMind administration for the operation.
- PLATFORM_GOVERNANCE - protected authority over administrators, governance and the access model.

The visible labels are configurable. The underlying tiers are not changed by renaming.

## Who grants what
- Operational application roles: System Administration, unless Platform Governance changes that preset to Governance-only assignment.
- System Administrator: Platform Governance only.
- Platform Governance: existing Platform Governance only.
- No user should be able to self-promote in production.
- At least one active Platform Governor must always remain.

## Where it is done
### System Administration > Employees
Maintain employee identity, reporting role, operational application role and access scope. The application-role dropdown deliberately excludes protected authority roles.

### Platform Governance > Administrative Authority
Grant/revoke System Administrator and Platform Governance authority.

### Platform Governance > Role labels & delegation
Rename visible role labels, update descriptions/default scope and decide whether an operational role may be assigned by System Administration or only by Platform Governance.

## Scope
Permissions are bounded by scope. Current prototype scopes are:
- Own area
- Department
- Entire operation
- Platform (protected governance only)

## Role presets versus permissions
Role presets are user-friendly bundles of permissions. Most administrators should select a role and scope, not manage a large permission matrix. Fine-grained exceptions can be added later behind an advanced 'Customise access' control.

## Audit
Every employee access update, privileged authority grant/revoke/restore and role-preset configuration change must be auditable with actor, subject, old/new state where applicable, reason and timestamp.

## Production rule
The browser may hide buttons, but the browser is never the security boundary. Production authorization must be enforced server-side.
