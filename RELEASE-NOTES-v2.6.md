# MineMind v2.6 — Communication & Mine Identity

## Added
- Compact Message Board on every actor landing page.
- Mine-wide notices published by System Administration.
- Team notices published from the Mine Manager / Supervisor workspace.
- Message priority, audience, author, created time, expiry and active/deactivated state.
- Message publication/deactivation entries in the audit trail.
- Mine-specific corporate identity settings under System Administration.
- Configurable mine/operation name, compact mine logo and optional corporate banner.
- Branding remains subordinate to the MineMind product identity.
- Local prototype persistence for messages and branding through the existing application state store.

## Production backend direction
Use dedicated Firestore collections or equivalent service domains:

- `communications/messages/{messageId}`
  - `operationId`, `audienceType`, `audienceIds`, `title`, `body`, `priority`
  - `createdByUserId`, `createdByRole`, `createdAt`, `expiresAt`, `status`
  - optional `requiresAcknowledgement`, `acknowledgementCount`
- `communications/acknowledgements/{ackId}`
  - `messageId`, `employeeId`, `acknowledgedAt`
- `operations/{operationId}/identity/current`
  - `mineName`, `logoAssetUrl`, `bannerAssetUrl`, `updatedBy`, `updatedAt`
- binary assets in controlled object storage, never embedded as base64 in production documents.

Authorization rules:
- System Administration may publish mine-wide messages and maintain operation identity.
- Supervisors may publish only to teams/areas inside their assigned operational scope.
- Ordinary employees cannot publish messages.
- All publish, deactivate, identity-change and acknowledgement actions are auditable server-side events.
- Expired messages remain historically queryable for institutional memory but are excluded from active landing-page reads.

## Institutional-memory rationale
Messages are operational records, not disposable UI text. Retaining audience, author, time, expiry and acknowledgement history enables later analysis of what instructions were communicated, to whom, before an event or shift outcome.
